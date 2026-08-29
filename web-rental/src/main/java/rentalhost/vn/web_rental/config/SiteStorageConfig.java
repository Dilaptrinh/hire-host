package rentalhost.vn.web_rental.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "site")
@Getter @Setter
public class SiteStorageConfig {

    private String rootPath;

    private long maxSizeBytes;

    private String baseDomain;
}
