package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import rentalhost.vn.web_rental.config.SiteStorageConfig;
import rentalhost.vn.web_rental.exception.BadRequestException;
import rentalhost.vn.web_rental.repository.SiteRepository;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.nio.file.attribute.PosixFilePermission;
import java.security.SecureRandom;
import java.util.*;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class SiteStorageService {

    private final SiteStorageConfig config;
    private final SiteRepository siteRepository;

    private static final String SUBDOMAIN_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
    private static final int SUBDOMAIN_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    private static final Set<String> BLOCKED_EXTENSIONS = Set.of(
            ".php", ".phtml", ".php5", ".phar", ".pl", ".py", ".cgi", ".sh", ".exe", ".bat", ".cmd");

    private static final Set<PosixFilePermission> DIR_PERMS =
            new HashSet<>(Arrays.asList(PosixFilePermission.OWNER_READ, PosixFilePermission.OWNER_WRITE,
                    PosixFilePermission.OWNER_EXECUTE, PosixFilePermission.GROUP_READ,
                    PosixFilePermission.GROUP_EXECUTE, PosixFilePermission.OTHERS_READ,
                    PosixFilePermission.OTHERS_EXECUTE));

    private static final Set<PosixFilePermission> FILE_PERMS =
            new HashSet<>(Arrays.asList(PosixFilePermission.OWNER_READ, PosixFilePermission.OWNER_WRITE,
                    PosixFilePermission.GROUP_READ, PosixFilePermission.OTHERS_READ));

    public String createSubdomain() {
        String subdomain;
        do {
            subdomain = generateSubdomain();
        } while (siteRepository.existsBySubdomain(subdomain));
        return subdomain;
    }

    private String generateSubdomain() {
        StringBuilder sb = new StringBuilder(SUBDOMAIN_LENGTH);
        for (int i = 0; i < SUBDOMAIN_LENGTH; i++) {
            sb.append(SUBDOMAIN_CHARS.charAt(RANDOM.nextInt(SUBDOMAIN_CHARS.length())));
        }
        return sb.toString();
    }

    public String buildUrl(String subdomain) {
        return "https://" + subdomain + "." + config.getBaseDomain();
    }

    public void deployFromFolder(String subdomain, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new BadRequestException("No files uploaded");
        }
        long total = files.stream().mapToLong(MultipartFile::getSize).sum();
        if (total > config.getMaxSizeBytes()) {
            throw new BadRequestException("Total upload size exceeds limit of " + config.getMaxSizeBytes() + " bytes");
        }
        Path staging = null;
        try {
            staging = Files.createTempDirectory("site-" + subdomain);
            for (MultipartFile file : files) {
                writeFile(staging, file.getOriginalFilename(), file.getInputStream());
            }
            publish(subdomain, staging);
        } catch (IOException e) {
            throw new BadRequestException("Failed to deploy folder: " + e.getMessage());
        } finally {
            deleteRecursively(staging);
        }
    }

    public void deployFromGitHub(String subdomain, Path cloneDir) {
        Path staging = null;
        try {
            staging = Files.createTempDirectory("site-gh-" + subdomain);
            long copied = copyTree(cloneDir, staging, 0L);
            if (copied > config.getMaxSizeBytes()) {
                throw new BadRequestException("GitHub repository size exceeds limit of "
                        + config.getMaxSizeBytes() + " bytes");
            }
            publish(subdomain, staging);
        } catch (IOException e) {
            throw new BadRequestException("Failed to deploy from GitHub: " + e.getMessage());
        } finally {
            deleteRecursively(staging);
        }
    }

    public void deleteSiteFolder(String subdomain) {
        if (subdomain == null || !subdomain.matches("[a-z0-9]{6}")) {
            return;
        }
        Path webRoot = Paths.get(config.getRootPath());
        Path target = webRoot.resolve(subdomain).normalize();
        if (target.startsWith(webRoot) && Files.exists(target)) {
            deleteRecursively(target);
        }
    }

    private void writeFile(Path staging, String rawPath, InputStream in) throws IOException {
        String sanitized = sanitize(rawPath);
        if (sanitized == null) {
            return;
        }
        Path target = staging.resolve(sanitized).normalize();
        if (!target.startsWith(staging)) {
            throw new IOException("Path traversal detected: " + rawPath);
        }
        Files.createDirectories(target.getParent());
        try (InputStream is = in) {
            Files.copy(is, target, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    private long copyTree(Path src, Path staging, long sizeSoFar) throws IOException {
        long total = sizeSoFar;
        try (Stream<Path> stream = Files.walk(src)) {
            List<Path> paths = stream.filter(p -> !Files.isDirectory(p)).toList();
            for (Path path : paths) {
                Path rel = src.relativize(path);
                String relStr = rel.toString().replace('\\', '/');
                if (relStr.equals(".git") || relStr.startsWith(".git/")) {
                    continue;
                }
                String sanitized = sanitize(relStr);
                if (sanitized == null) {
                    continue;
                }
                total += Files.size(path);
                if (total > config.getMaxSizeBytes()) {
                    throw new IOException("GitHub repository exceeds size limit");
                }
                Path target = staging.resolve(sanitized).normalize();
                if (!target.startsWith(staging)) {
                    continue;
                }
                Files.createDirectories(target.getParent());
                Files.copy(path, target, StandardCopyOption.REPLACE_EXISTING);
            }
        }
        return total;
    }

    private String sanitize(String raw) {
        if (raw == null) {
            return null;
        }
        String normalized = raw.replace('\\', '/');
        if (normalized.startsWith("/") || normalized.contains(":")) {
            return null;
        }
        String[] parts = normalized.split("/");
        List<String> clean = new ArrayList<>();
        for (String p : parts) {
            if (p.isEmpty() || p.equals(".") || p.equals("..")) {
                continue;
            }
            String lower = p.toLowerCase(Locale.ROOT);
            if (lower.equals(".htaccess")) {
                return null;
            }
            if (BLOCKED_EXTENSIONS.stream().anyMatch(lower::endsWith)) {
                return null;
            }
            clean.add(p);
        }
        if (clean.isEmpty()) {
            return null;
        }
        return String.join("/", clean);
    }

    private void publish(String subdomain, Path staging) throws IOException {
        if (!Files.exists(staging.resolve("index.html"))) {
            throw new IOException("Missing index.html in project root");
        }
        Path webRoot = Paths.get(config.getRootPath());
        Files.createDirectories(webRoot);
        Path target = webRoot.resolve(subdomain).normalize();
        if (!target.startsWith(webRoot)) {
            throw new IOException("Invalid subdomain path");
        }
        if (Files.exists(target)) {
            deleteRecursively(target);
        }
        Files.move(staging, target, StandardCopyOption.REPLACE_EXISTING);
        applyPermissions(target);
    }

    private void applyPermissions(Path root) {
        try (Stream<Path> stream = Files.walk(root)) {
            List<Path> paths = stream.toList();
            for (Path p : paths) {
                Set<PosixFilePermission> perms = Files.isDirectory(p) ? DIR_PERMS : FILE_PERMS;
                Files.setPosixFilePermissions(p, perms);
            }
        } catch (UnsupportedOperationException e) {
            log.debug("POSIX permissions not supported on this filesystem: {}", e.getMessage());
        } catch (IOException e) {
            log.warn("Failed to set permissions on {}: {}", root, e.getMessage());
        }
    }

    private void deleteRecursively(Path dir) {
        if (dir == null || !Files.exists(dir)) {
            return;
        }
        try (Stream<Path> stream = Files.walk(dir)) {
            List<Path> paths = stream.sorted(Comparator.reverseOrder()).toList();
            for (Path p : paths) {
                Files.deleteIfExists(p);
            }
        } catch (IOException e) {
            log.warn("Failed to delete {}: {}", dir, e.getMessage());
        }
    }
}
