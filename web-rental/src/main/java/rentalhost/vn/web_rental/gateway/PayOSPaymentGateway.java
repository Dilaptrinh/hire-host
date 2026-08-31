package rentalhost.vn.web_rental.gateway;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import rentalhost.vn.web_rental.config.PaymentConfig;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PayOSPaymentGateway {

    private final PaymentConfig paymentConfig;
    private final RestTemplate restTemplate;

    public PayOSData createPayment(long orderCode, long amount, String description,
                                   String returnUrl, String cancelUrl) {
        PaymentConfig.PayOSConfig config = paymentConfig.getPayos();

        String signData = "amount=" + amount +
                "&cancelUrl=" + cancelUrl +
                "&description=" + description +
                "&orderCode=" + orderCode +
                "&returnUrl=" + returnUrl;
        String signature = hmacSha256(signData, config.getChecksumKey());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("orderCode", orderCode);
        body.put("amount", amount);
        body.put("description", description);
        body.put("cancelUrl", cancelUrl);
        body.put("returnUrl", returnUrl);
        body.put("signature", signature);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-client-id", config.getClientId());
        headers.set("x-api-key", config.getApiKey());
        headers.set("x-partner-code", "");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        log.info("PayOS create request: {}", body);

        ResponseEntity<PayOSResponse> responseEntity = restTemplate.exchange(
                config.getEndpoint(), HttpMethod.POST, entity, PayOSResponse.class);

        PayOSResponse response = responseEntity.getBody();
        if (response == null || !"00".equals(response.getCode())) {
            throw new IllegalStateException("PayOS error: " + (response != null ? response.getDesc() : "no response"));
        }
        log.info("PayOS create response orderCode={} checkoutUrl={}",
                response.getData() != null ? response.getData().getOrderCode() : null,
                response.getData() != null ? response.getData().getCheckoutUrl() : null);
        return response.getData();
    }

    public boolean verifyWebhook(String body, String signature) {
        if (body == null || signature == null) return false;
        return hmacSha256(body, paymentConfig.getPayos().getChecksumKey()).equals(signature);
    }

    private String hmacSha256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec spec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(spec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                String h = Integer.toHexString(0xff & b);
                if (h.length() == 1) hex.append('0');
                hex.append(h);
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("HMAC-SHA256 error", e);
        }
    }

    @Data
    public static class PayOSResponse {
        private String code;
        private String desc;
        private PayOSData data;
    }

    @Data
    public static class PayOSData {
        private String id;
        private Long orderCode;
        private Long amount;
        private String status;
        private String checkoutUrl;
        private String qrCode;
        private String cancelUrl;
        private String returnUrl;
    }
}
