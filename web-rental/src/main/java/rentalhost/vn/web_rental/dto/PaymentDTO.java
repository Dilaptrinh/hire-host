package rentalhost.vn.web_rental.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "Payment DTOs")
public class PaymentDTO {

    @Getter @Setter @NoArgsConstructor
    @Schema(description = "Create payment request body")
    public static class PaymentRequest {
        @Schema(example = "1", description = "Order ID to pay")
        @NotNull
        private Long orderId;

        @Schema(example = "MOMO", allowableValues = {"BANKING", "MOMO", "VNPAY", "CASH"})
        @NotNull
        private String method;

        @Schema(example = "6200000")
        @NotNull @Positive
        private BigDecimal amount;

        @Schema(example = "http://localhost:5173/payment/callback", description = "URL for MoMo/VNPay to redirect after payment")
        private String returnUrl;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "Payment response")
    public static class PaymentResponse {
        private Long id;
        private Long orderId;
        private BigDecimal amount;
        private String method;
        private String status;
        private String transactionId;
        private String paymentUrl;
        private LocalDateTime paidAt;
    }
}
