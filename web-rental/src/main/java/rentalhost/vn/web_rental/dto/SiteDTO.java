package rentalhost.vn.web_rental.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Schema(description = "Static site DTOs")
public class SiteDTO {

    @Getter @Setter @NoArgsConstructor
    @Schema(description = "Deploy from GitHub request body")
    public static class SiteRequest {
        @Schema(example = "GITHUB", allowableValues = {"FOLDER", "GITHUB"})
        @NotNull
        private String source;

        @Schema(example = "https://github.com/username/repo")
        @Size(max = 500)
        private String githubUrl;

        @Schema(example = "mywebsite", description = "Subdomain tự chọn (tùy chọn)")
        @Size(max = 30)
        private String subdomain;
    }

    @Getter @Setter @NoArgsConstructor
    @Schema(description = "Change subdomain request")
    public static class ChangeSubdomainRequest {
        @Schema(example = "mywebsite", description = "Subdomain mới")
        @jakarta.validation.constraints.NotBlank
        @Size(max = 30)
        private String subdomain;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "Static site response")
    public static class SiteResponse {
        private Long id;
        private String subdomain;
        private String source;
        private String status;
        private String url;
        private String errorMessage;
        private Long userId;
        private String userEmail;
        private String userFullName;
        private LocalDateTime updatedAt;
    }
}
