package rentalhost.vn.web_rental.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Schema(description = "Announcement DTOs")
public class AnnouncementDTO {

    @Getter @Setter @NoArgsConstructor
    @Schema(description = "Create/update announcement body")
    public static class AnnouncementRequest {
        @Schema(example = "Tiêu đề thông báo")
        @NotBlank
        @Size(max = 255)
        private String title;

        @Schema(example = "Nội dung thông báo")
        @NotBlank
        @Size(max = 10000)
        private String content;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "Announcement response")
    public static class AnnouncementResponse {
        private Long id;
        private String title;
        private String content;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
