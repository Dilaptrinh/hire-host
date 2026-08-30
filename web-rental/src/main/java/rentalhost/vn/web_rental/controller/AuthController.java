package rentalhost.vn.web_rental.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import rentalhost.vn.web_rental.dto.AuthDTO;
import rentalhost.vn.web_rental.exception.BadRequestException;
import rentalhost.vn.web_rental.helper.ApiResponse;
import rentalhost.vn.web_rental.security.SecurityUtil;
import rentalhost.vn.web_rental.service.AuthService;

@Tag(name = "Authentication", description = "Register, login, refresh token, logout")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register a new user account")
    @PostMapping("/register")
    public ApiResponse<AuthDTO.AuthResponse> register(@Valid @RequestBody AuthDTO.RegisterRequest request,
                                                      HttpServletResponse response) {
        AuthDTO.AuthResponse auth = authService.register(request);
        setRefreshCookie(response, auth.getRefreshToken());
        return ApiResponse.created(auth);
    }

    @Operation(summary = "Login with email and password")
    @PostMapping("/login")
    public ApiResponse<AuthDTO.AuthResponse> login(@Valid @RequestBody AuthDTO.LoginRequest request,
                                                   HttpServletResponse response) {
        AuthDTO.AuthResponse auth = authService.login(request);
        setRefreshCookie(response, auth.getRefreshToken());
        return ApiResponse.success(auth);
    }

    @Operation(summary = "Refresh access token using refresh token")
    @PostMapping("/refresh")
    public ApiResponse<AuthDTO.AuthResponse> refresh(
            @RequestBody(required = false) AuthDTO.RefreshTokenRequest request,
            @CookieValue(name = "refreshToken", required = false) String cookieToken,
            HttpServletResponse response) {
        String token = (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank())
                ? request.getRefreshToken()
                : cookieToken;
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Refresh token missing");
        }
        AuthDTO.AuthResponse auth = authService.refreshToken(token);
        setRefreshCookie(response, auth.getRefreshToken());
        return ApiResponse.success(auth);
    }

    @Operation(summary = "Logout and revoke refresh token")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletResponse response) {
        authService.logout(SecurityUtil.getCurrentUserId());
        clearRefreshCookie(response);
        return ApiResponse.success("Logged out", null);
    }

    private void setRefreshCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("refreshToken", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        cookie.setAttribute("SameSite", "Strict");
        response.addCookie(cookie);
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
