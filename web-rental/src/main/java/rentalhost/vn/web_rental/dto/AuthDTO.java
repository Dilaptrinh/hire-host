package rentalhost.vn.web_rental.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Schema(description = "Authentication DTOs")
public class AuthDTO {

    @Getter @Setter @NoArgsConstructor
    @Schema(description = "Login request body")
    public static class LoginRequest {
        @Schema(example = "user@example.com")
        @NotBlank @Email
        private String email;

        @Schema(example = "password123")
        @NotBlank
        private String password;
    }

    @Getter @Setter @NoArgsConstructor
    @Schema(description = "Register request body")
    public static class RegisterRequest {
        @Schema(example = "user@example.com")
        @NotBlank @Email
        private String email;

        @Schema(example = "password123", minLength = 6)
        @NotBlank @Size(min = 6, max = 100)
        private String password;

        @Schema(example = "Nguyen Van A")
        @NotBlank
        private String fullName;

        @Schema(example = "0909123456")
        private String phone;
    }

    @Getter @Setter @NoArgsConstructor
    @Schema(description = "Refresh token request body")
    public static class RefreshTokenRequest {
        @Schema(example = "eyJhbGciOiJIUzI1NiJ9...")
        @NotBlank
        private String refreshToken;
    }

    @Getter @Setter @NoArgsConstructor
    @Schema(description = "Change password request body")
    public static class ChangePasswordRequest {
        @Schema(example = "oldPassword123")
        @NotBlank
        private String oldPassword;

        @Schema(example = "newPassword456", minLength = 6)
        @NotBlank @Size(min = 6, max = 100)
        private String newPassword;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "Authentication response with tokens")
    public static class AuthResponse {
        @Schema(example = "eyJhbGciOiJIUzI1NiJ9...")
        private String accessToken;

        @Schema(example = "eyJhbGciOiJIUzI1NiJ9...")
        private String refreshToken;

        @Builder.Default
        @Schema(example = "Bearer")
        private String tokenType = "Bearer";

        @Schema(example = "900000")
        private long expiresIn;

        public AuthResponse(String accessToken, String refreshToken, long expiresIn) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.tokenType = "Bearer";
            this.expiresIn = expiresIn;
        }
    }
}
