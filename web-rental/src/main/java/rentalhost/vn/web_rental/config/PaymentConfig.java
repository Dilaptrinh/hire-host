package rentalhost.vn.web_rental.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "payment")
@Getter @Setter
public class PaymentConfig {

    private MomoConfig momo = new MomoConfig();
    private PayOSConfig payos = new PayOSConfig();

    @Getter @Setter
    public static class MomoConfig {
        private String partnerCode;
        private String accessKey;
        private String secretKey;
        private String endpoint;
        private String notifyUrl;
        private String returnUrl;
    }

    @Getter @Setter
    public static class PayOSConfig {
        private String clientId;
        private String apiKey;
        private String checksumKey;
        private String endpoint;
        private String returnUrl;
        private String cancelUrl;
        private String webhookUrl;
    }
}
