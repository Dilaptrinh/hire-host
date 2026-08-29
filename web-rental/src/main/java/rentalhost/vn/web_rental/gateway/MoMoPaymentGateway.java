package rentalhost.vn.web_rental.gateway;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import rentalhost.vn.web_rental.config.PaymentConfig;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class MoMoPaymentGateway {

    private final PaymentConfig paymentConfig;
    private final RestTemplate restTemplate;

    public MomoCreatePaymentResponse createPayment(
            String orderId,
            String requestId,
            BigDecimal amount,
            String orderInfo,
            String returnUrl,
            String notifyUrl
    ) {
        PaymentConfig.MomoConfig config = paymentConfig.getMomo();

        String requestType = "captureWallet";
        String extraData = "";

        String rawHash = "accessKey=" + config.getAccessKey() +
                "&amount=" + amount.longValue() +
                "&extraData=" + extraData +
                "&ipnUrl=" + notifyUrl +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + config.getPartnerCode() +
                "&redirectUrl=" + returnUrl +
                "&requestId=" + requestId +
                "&requestType=" + requestType;

        String signature = hmacSha256(rawHash, config.getSecretKey());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("partnerCode", config.getPartnerCode());
        body.put("accessKey", config.getAccessKey());
        body.put("requestId", requestId);
        body.put("amount", amount.longValue());
        body.put("orderId", orderId);
        body.put("orderInfo", orderInfo);
        body.put("redirectUrl", returnUrl);
        body.put("ipnUrl", notifyUrl);
        body.put("extraData", extraData);
        body.put("requestType", requestType);
        body.put("signature", signature);
        body.put("lang", "vi");

        log.info("MoMo request: {}", body);

        MomoCreatePaymentResponse response = restTemplate.postForObject(
                config.getEndpoint(),
                body,
                MomoCreatePaymentResponse.class
        );

        log.info("MoMo response: {}", response);
        return response;
    }

    public boolean verifySignature(Map<String, String> params) {
        String signature = params.get("signature");
        if (signature == null) return false;

        Map<String, String> sortedParams = new TreeMap<>(params);
        sortedParams.remove("signature");

        String rawHash = sortedParams.entrySet().stream()
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("&"));

        String expectedSignature = hmacSha256(rawHash, paymentConfig.getMomo().getSecretKey());
        return expectedSignature.equals(signature);
    }

    private String hmacSha256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error computing HMAC-SHA256", e);
        }
    }

    @lombok.Data
    public static class MomoCreatePaymentResponse {
        private String partnerCode;
        private String requestId;
        private String orderId;
        private long amount;
        private String responseTime;
        private String message;
        private int resultCode;
        private String payUrl;
        private String shortLink;
        private String qrCodeUrl;
        private String deeplink;
        private String deeplinkMiniApp;
    }
}
