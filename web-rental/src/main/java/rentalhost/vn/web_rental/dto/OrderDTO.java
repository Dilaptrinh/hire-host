package rentalhost.vn.web_rental.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Order DTOs")
public class OrderDTO {

    @Getter @Setter @NoArgsConstructor
    @Schema(description = "Create order request body")
    public static class OrderRequest {
        @Schema(example = "1", description = "Server ID to rent")
        @NotNull
        private Long serverId;

        @Schema(example = "2026-07-18")
        @NotNull
        private LocalDate startDate;

        @Schema(example = "2026-08-18")
        @NotNull @Future
        private LocalDate endDate;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "Order response")
    public static class OrderResponse {
        private Long id;
        private Long userId;
        private Long serverId;
        private String serverName;
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal totalPrice;
        private String status;
    }
}
