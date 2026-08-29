package rentalhost.vn.web_rental.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import rentalhost.vn.web_rental.exception.UnauthorizedException;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtConfig jwtConfig;

    private SecretKey getSigningKey() {
        try {
            byte[] keyBytes = jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8);
            byte[] hash = MessageDigest.getInstance("SHA-512").digest(keyBytes);
            byte[] key = new byte[64];
            System.arraycopy(hash, 0, key, 0, Math.min(hash.length, 64));
            return Keys.hmacShaKeyFor(key);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate JWT signing key", e);
        }
    }

    public String generateAccessToken(Long userId, String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getAccessExpiration());

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(Long userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtConfig.getRefreshExpiration());

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(userId.toString())
                .issuedAt(now)
                .expiration(expiryDate) 
                .signWith(getSigningKey())
                .compact();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return Long.valueOf(claims.get("userId", Integer.class));
    }

    public String getEmailFromToken(String token) {
        return parseToken(token).getSubject();
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            throw new UnauthorizedException("Invalid or expired token");
        }
    }
    //claim là object chứa những thông tin user đỏ vào lúc tạo token
    private Claims parseToken(String token) {
        return Jwts.parser() //phân tích token
                .verifyWith(getSigningKey())  // kí chữ kí
                .build() //
                .parseSignedClaims(token)   //giải mã xác minh chữ kí , xác thực thời hạn
                .getPayload();   //ra được claim , phần ruột sub , userId , role
    }
}
