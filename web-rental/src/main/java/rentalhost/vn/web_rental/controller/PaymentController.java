package rentalhost.vn.web_rental.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import rentalhost.vn.web_rental.dto.PaymentDTO;
import rentalhost.vn.web_rental.helper.ApiResponse;
import rentalhost.vn.web_rental.security.SecurityUtil;
import rentalhost.vn.web_rental.service.PaymentService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Tag(name = "Payments", description = "Payment management (authenticated)")
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "Make a payment for an order")
    @PostMapping
    public ApiResponse<PaymentDTO.PaymentResponse> create(
            @Valid @RequestBody PaymentDTO.PaymentRequest request,
            HttpServletRequest httpRequest
    ) {
        String ipAddr = httpRequest.getRemoteAddr();
        return ApiResponse.created(paymentService.create(request, SecurityUtil.getCurrentUserId(), ipAddr));
    }

    @Operation(summary = "Get payment history of current user")
    @GetMapping
    public ApiResponse<List<PaymentDTO.PaymentResponse>> getAllMine() {
        return ApiResponse.success(paymentService.getByUser(SecurityUtil.getCurrentUserId()));
    }

    @Operation(summary = "MoMo IPN webhook (public)")
    @PostMapping("/momo/ipn")
    public String momoIpn(@RequestParam Map<String, String> params) {
        log.info("MoMo IPN: {}", params);
        return paymentService.handleMoMoIpn(params);
    }

    @Operation(summary = "MoMo callback redirect (public)")
    @GetMapping("/momo/callback")
    public ApiResponse<Map<String, String>> momoCallback(@RequestParam Map<String, String> params) {
        log.info("MoMo callback: {}", params);
        paymentService.handleMoMoIpn(params);
        Map<String, String> result = new HashMap<>();
        result.put("status", params.getOrDefault("resultCode", "unknown").equals("0") ? "SUCCESS" : "FAILED");
        result.put("message", params.getOrDefault("message", ""));
        return ApiResponse.success(result);
    }
}

