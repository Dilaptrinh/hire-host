package rentalhost.vn.web_rental.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(description = "Contact form DTOs")
public class ContactDTO {

    @Getter @Setter @NoArgsConstructor
    @Schema(description = "Contact form submission")
    public static class ContactRequest {
        @Schema(example = "Nguyễn Văn A")
        @NotBlank
        @Size(max = 100)
        private String name;

        @Schema(example = "nguyenvana@example.com")
        @NotBlank
        @Email
        @Size(max = 100)
        private String email;

        @Schema(example = "Nội dung tin nhắn")
        @NotBlank
        @Size(max = 2000)
        private String message;
    }
}
