package rentalhost.vn.web_rental.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@Service
public class CloudflareCacheService {

    private static final Logger LOGGER = Logger.getLogger(CloudflareCacheService.class.getName());

    @Value("${cloudflare.api-token:}")
    private String apiToken;

    @Value("${cloudflare.zone-id:}")
    private String zoneId;

    @Value("${cloudflare.enabled:false}")
    private boolean enabled;

    private final RestTemplate restTemplate = new RestTemplate();

    public void purgeCache(List<String> files) {
        if (!enabled || apiToken == null || apiToken.isEmpty() || zoneId == null || zoneId.isEmpty()) {
            LOGGER.info("Cloudflare cache purge skipped (disabled or missing credentials).");
            return;
        }

        try {
            String url = "https://api.cloudflare.com/client/v4/zones/" + zoneId + "/purge_cache";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiToken);

            Map<String, Object> body = new HashMap<>();
            body.put("files", files);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                LOGGER.info("Successfully purged Cloudflare cache for files: " + files);
            } else {
                LOGGER.warning("Failed to purge Cloudflare cache: " + response.getBody());
            }
        } catch (Exception e) {
            LOGGER.severe("Error purging Cloudflare cache: " + e.getMessage());
        }
    }
}
