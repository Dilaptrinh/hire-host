package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jgit.api.Git;
import org.springframework.stereotype.Service;
import rentalhost.vn.web_rental.exception.BadRequestException;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
@RequiredArgsConstructor
@Slf4j
public class GitHubCloneService {

    private final SiteStorageService storageService;

    public void cloneAndDeploy(String subdomain, String githubUrl) {
        String url = validateUrl(githubUrl);
        Path temp = null;
        try {
            temp = Files.createTempDirectory("gh-" + subdomain);
            try (Git git = Git.cloneRepository()
                    .setURI(url)
                    .setDirectory(temp.toFile())
                    .setDepth(1)
                    .setNoCheckout(false)
                    .call()) {
                log.info("Cloned {} into {}", url, temp);
            }
            storageService.deployFromGitHub(subdomain, temp);
        } catch (Exception e) {
            throw new BadRequestException("Failed to clone GitHub repository: " + e.getMessage());
        } finally {
            deleteRecursively(temp);
        }
    }

    private String validateUrl(String url) {
        if (url == null || url.isBlank()) {
            throw new BadRequestException("GitHub URL is required");
        }
        try {
            URI uri = new URI(url);
            if (!"https".equalsIgnoreCase(uri.getScheme())) {
                throw new BadRequestException("Only HTTPS GitHub URLs are supported");
            }
            if (!"github.com".equalsIgnoreCase(uri.getHost())) {
                throw new BadRequestException("Only GitHub URLs are supported");
            }
            return url;
        } catch (URISyntaxException e) {
            throw new BadRequestException("Invalid GitHub URL");
        }
    }

    private void deleteRecursively(Path dir) {
        if (dir == null || !Files.exists(dir)) {
            return;
        }
        try (var stream = Files.walk(dir)) {
            var paths = stream.sorted((a, b) -> b.compareTo(a)).toList();
            for (Path p : paths) {
                Files.deleteIfExists(p);
            }
        } catch (IOException e) {
            log.warn("Failed to delete {}: {}", dir, e.getMessage());
        }
    }
}
