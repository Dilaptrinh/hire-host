package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import rentalhost.vn.web_rental.dto.SiteDTO;
import rentalhost.vn.web_rental.enums.SiteSource;
import rentalhost.vn.web_rental.enums.SiteStatus;
import rentalhost.vn.web_rental.exception.BadRequestException;
import rentalhost.vn.web_rental.exception.ResourceNotFoundException;
import rentalhost.vn.web_rental.mapper.SiteMapper;
import rentalhost.vn.web_rental.model.Site;
import rentalhost.vn.web_rental.model.User;
import rentalhost.vn.web_rental.repository.SiteRepository;
import rentalhost.vn.web_rental.repository.UserRepository;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SiteService {

    private final SiteRepository siteRepository;
    private final UserRepository userRepository;
    private final SiteMapper siteMapper;
    private final SiteStorageService storageService;
    private final GitHubCloneService gitHubCloneService;

    @Transactional
    public SiteDTO.SiteResponse deployFromFolder(Long userId, String subdomain, List<MultipartFile> files) {
        Site site = getOrCreateSite(userId, subdomain);
        site.setStatus(SiteStatus.DEPLOYING);
        site.setSource(SiteSource.FOLDER);
        site.setGithubUrl(null);
        site.setErrorMessage(null);
        siteRepository.save(site);
        try {
            storageService.deployFromFolder(site.getSubdomain(), files);
            site.setStatus(SiteStatus.ACTIVE);
            site.setUrl(storageService.buildUrl(site.getSubdomain()));
        } catch (Exception e) {
            log.error("Deploy folder failed for user {}", userId, e);
            site.setStatus(SiteStatus.FAILED);
            site.setErrorMessage(e.getMessage());
        }
        return siteMapper.toResponse(siteRepository.save(site));
    }

    @Transactional
    public SiteDTO.SiteResponse deployFromGithub(Long userId, String subdomain, String githubUrl) {
        Site site = getOrCreateSite(userId, subdomain);
        site.setStatus(SiteStatus.DEPLOYING);
        site.setSource(SiteSource.GITHUB);
        site.setGithubUrl(githubUrl);
        site.setErrorMessage(null);
        siteRepository.save(site);
        try {
            gitHubCloneService.cloneAndDeploy(site.getSubdomain(), githubUrl);
            site.setStatus(SiteStatus.ACTIVE);
            site.setUrl(storageService.buildUrl(site.getSubdomain()));
        } catch (Exception e) {
            log.error("Deploy github failed for user {}", userId, e);
            site.setStatus(SiteStatus.FAILED);
            site.setErrorMessage(e.getMessage());
        }
        return siteMapper.toResponse(siteRepository.save(site));
    }

    @Transactional(readOnly = true)
    public SiteDTO.SiteResponse getMySite(Long userId) {
        return siteRepository.findByUserId(userId)
                .map(siteMapper::toResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<SiteDTO.SiteResponse> getAllSites() {
        return siteRepository.findAllWithUser().stream()
                .map(siteMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SiteDTO.SiteResponse> getSitesByUser(Long userId) {
        return siteRepository.findAllByUserId(userId).stream()
                .map(siteMapper::toResponse)
                .toList();
    }

    @Transactional
    public void deleteSite(Long userId) {
        Site site = siteRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Site", userId));
        storageService.deleteSiteFolder(site.getSubdomain());
        siteRepository.delete(site);
    }

    @Transactional
    public void deleteSiteById(Long siteId) {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new ResourceNotFoundException("Site", siteId));
        storageService.deleteSiteFolder(site.getSubdomain());
        siteRepository.delete(site);
    }

    private Site getOrCreateSite(Long userId, String requestedSub) {
        String resolved = resolveSubdomain(userId, requestedSub);
        Site existing = siteRepository.findByUserId(userId).orElse(null);
        if (existing != null) {
            existing.setSubdomain(resolved);
            return existing;
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return Site.builder()
                .user(user)
                .subdomain(resolved)
                .source(SiteSource.FOLDER)
                .status(SiteStatus.DEPLOYING)
                .build();
    }

    private String resolveSubdomain(Long userId, String requested) {
        String existing = siteRepository.findByUserId(userId).map(Site::getSubdomain).orElse(null);
        if (requested == null || requested.isBlank()) {
            return existing != null ? existing : storageService.createSubdomain();
        }
        String sub = requested.trim().toLowerCase();
        if (!sub.matches("^[a-z0-9][a-z0-9-]{0,28}[a-z0-9]$")) {
            throw new BadRequestException("Tên miền không hợp lệ (chỉ a-z, 0-9, dấu gạch ngang, 2-30 ký tự)");
        }
        if (!sub.equals(existing) && siteRepository.existsBySubdomain(sub)) {
            throw new BadRequestException("Tên miền '" + sub + "' đã được sử dụng, vui lòng chọn tên khác");
        }
        return sub;
    }
}
