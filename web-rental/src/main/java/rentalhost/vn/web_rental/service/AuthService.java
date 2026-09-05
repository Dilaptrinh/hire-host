package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rentalhost.vn.web_rental.dto.AuthDTO;
import rentalhost.vn.web_rental.enums.UserRole;
import rentalhost.vn.web_rental.enums.UserStatus;
import rentalhost.vn.web_rental.exception.BadRequestException;
import rentalhost.vn.web_rental.exception.DuplicateResourceException;
import rentalhost.vn.web_rental.exception.UnauthorizedException;
import rentalhost.vn.web_rental.model.RefreshToken;
import rentalhost.vn.web_rental.model.User;
import rentalhost.vn.web_rental.repository.RefreshTokenRepository;
import rentalhost.vn.web_rental.repository.UserRepository;
import rentalhost.vn.web_rental.security.JwtConfig;
import rentalhost.vn.web_rental.security.JwtTokenProvider;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtConfig jwtConfig;

    // Đăng ký bằng form thường bị tắt vì chưa có xác thực email.
    // Bật lại khi có email verification: app.registration.enabled=true
    @Value("${app.registration.enabled:false}")
    private boolean registrationEnabled;

    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (!registrationEnabled) {
            throw new BadRequestException("Đăng ký bằng email/mật khẩu đang tạm khóa. Vui lòng đăng ký bằng Google.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already in use");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();
        user = userRepository.save(user);

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (user.getStatus() == UserStatus.BANNED) {
            throw new UnauthorizedException("Account is banned");
        }

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthDTO.AuthResponse refresh(AuthDTO.RefreshTokenRequest request) {
        return refreshToken(request.getRefreshToken());
    }

    @Transactional
    public AuthDTO.AuthResponse refreshToken(String token) {
        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("Invalid refresh token");
        }
        RefreshToken storedToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (storedToken.isExpired()) {
            refreshTokenRepository.delete(storedToken);
            throw new UnauthorizedException("Refresh token expired");
        }

        User user = storedToken.getUser();

        refreshTokenRepository.delete(storedToken);

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthDTO.AuthResponse processOAuthUser(String email, String name, String avatar, String googleId) {
        User user = userRepository.findByGoogleId(googleId).orElse(null);
        if (user == null) {
            user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                user = User.builder()
                        .email(email)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .fullName(name)
                        .avatar(avatar)
                        .googleId(googleId)
                        .role(UserRole.USER)
                        .status(UserStatus.ACTIVE)
                        .build();
            } else {
                user.setGoogleId(googleId);
                if (avatar != null) {
                    user.setAvatar(avatar);
                }
            }
        }
        return generateAuthResponse(userRepository.save(user));
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    private AuthDTO.AuthResponse generateAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        RefreshToken tokenEntity = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiresAt(Instant.now().plusMillis(jwtConfig.getRefreshExpiration()))
                .build();
        refreshTokenRepository.saveAndFlush(tokenEntity);

        return AuthDTO.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtConfig.getAccessExpiration())
                .build();
    }
}
