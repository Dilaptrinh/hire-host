package rentalhost.vn.web_rental.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import rentalhost.vn.web_rental.enums.UserRole;
import rentalhost.vn.web_rental.enums.UserStatus;

@Schema(description = "User DTOs")
public class UserDTO {

    @Getter @Setter @NoArgsConstructor
    @Schema(description = "Update profile request body")
    public static class UpdateProfileRequest {
        @Schema(example = "Nguyen Van A")
        private String fullName;

        @Schema(example = "0909123456")
        private String phone;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "User response")
    public static class UserResponse {
        private Long id;
        private String email;
        private String fullName;
        private String phone;
        private UserRole role;
        private UserStatus status;
    }
}
