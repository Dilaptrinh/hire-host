package rentalhost.vn.web_rental.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Schema(description = "Server/Hosting plan DTOs")
public class ServerDTO {

    @Getter @Setter @NoArgsConstructor
    @Schema(description = "Create/Update server request body")
    public static class ServerRequest {
        @Schema(example = "1", description = "Category ID (optional)")
        private Long categoryId;

        @Schema(example = "Basic VPS")
        @NotBlank
        private String name;

        @Schema(example = "1 core CPU, 1GB RAM, 20GB SSD")
        private String description;

        @Schema(example = "1 core")
        @NotBlank
        private String cpu;

        @Schema(example = "1 GB")
        @NotBlank
        private String ram;

        @Schema(example = "20 GB SSD")
        @NotBlank
        private String storage;

        @Schema(example = "500 GB")
        @NotBlank
        private String bandwidth;

        @Schema(example = "199000")
        @NotNull @Positive
        private BigDecimal price;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "Server response")
    public static class ServerResponse {
        private Long id;
        private Long categoryId;
        private String categoryName;
        private String name;
        private String description;
        private String cpu;
        private String ram;
        private String storage;
        private String bandwidth;
        private BigDecimal price;
        private String status;
    }
}
