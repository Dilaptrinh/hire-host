package rentalhost.vn.web_rental.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

/**
 * Danh sách email/domain được phép deploy website.
 * Admin chỉnh qua application.properties hoặc biến môi trường:
 *   app.deploy.allowed-email-domains (DEPLOY_ALLOWED_EMAIL_DOMAINS)
 *   app.deploy.allowed-emails       (DEPLOY_ALLOWED_EMAILS)
 */
@Configuration
@ConfigurationProperties(prefix = "app.deploy")
@Getter @Setter
public class DeployAccessConfig {

    private List<String> allowedEmailDomains = new ArrayList<>();

    private List<String> allowedEmails = new ArrayList<>();
}
