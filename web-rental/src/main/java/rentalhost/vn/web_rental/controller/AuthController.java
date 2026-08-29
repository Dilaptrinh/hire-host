package rentalhost.vn.web_rental.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import rentalhost.vn.web_rental.dto.AuthDTO;
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
    public ApiResponse<AuthDTO.AuthResponse> register(@Valid @RequestBody AuthDTO.RegisterRequest request) {
        return ApiResponse.created(authService.register(request));
    }

    @Operation(summary = "Login with email and password")
    
    @PostMapping("/login")
    public ApiResponse<AuthDTO.AuthResponse> login(@Valid @RequestBody AuthDTO.LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @Operation(summary = "Refresh access token using refresh token")
    
    @PostMapping("/refresh")
    public ApiResponse<AuthDTO.AuthResponse> refresh(@Valid @RequestBody AuthDTO.RefreshTokenRequest request) {
        return ApiResponse.success(authService.refresh(request));
    }

    @Operation(summary = "Logout and revoke refresh token")
    
    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        authService.logout(SecurityUtil.getCurrentUserId());
        return ApiResponse.success("Logged out", null);
    }
}
