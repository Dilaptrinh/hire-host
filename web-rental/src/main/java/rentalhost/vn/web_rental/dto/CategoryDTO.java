package rentalhost.vn.web_rental.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Schema(description = "Category DTOs")
public class CategoryDTO {

    @Getter @Setter @NoArgsConstructor
    @Schema(description = "Create/Update category request body")
    public static class CategoryRequest {
        @Schema(example = "VPS")
        @NotBlank
        private String name;

        @Schema(example = "Virtual Private Server plans")
        private String description;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "Category response")
    public static class CategoryResponse {
        private Long id;
        private String name;
        private String description;
    }
}
