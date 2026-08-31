package rentalhost.vn.web_rental.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import rentalhost.vn.web_rental.dto.SiteDTO;
import rentalhost.vn.web_rental.helper.ApiResponse;
import rentalhost.vn.web_rental.security.SecurityUtil;
import rentalhost.vn.web_rental.service.SiteService;

import java.util.Arrays;
import java.util.List;

@Tag(name = "Sites", description = "Static site hosting (authenticated)")
@RestController
@RequestMapping("/api/v1/sites")
@RequiredArgsConstructor
public class SiteController {

    private final SiteService siteService;

    @Operation(summary = "Deploy static site from uploaded folder")
    @PostMapping(value = "/deploy/folder", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<SiteDTO.SiteResponse> deployFolder(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(required = false) String subdomain) {
        return ApiResponse.created(siteService.deployFromFolder(
                SecurityUtil.getCurrentUserId(),
                subdomain,
                files == null ? List.of() : Arrays.asList(files)));
    }

    @Operation(summary = "Deploy static site from GitHub URL")
    @PostMapping("/deploy/github")
    public ApiResponse<SiteDTO.SiteResponse> deployGithub(@Valid @RequestBody SiteDTO.SiteRequest request) {
        return ApiResponse.created(siteService.deployFromGithub(
                SecurityUtil.getCurrentUserId(), request.getSubdomain(), request.getGithubUrl()));
    }

    @Operation(summary = "Get current user's site")
    @GetMapping("/me")
    public ApiResponse<SiteDTO.SiteResponse> getMySite() {
        return ApiResponse.success(siteService.getMySite(SecurityUtil.getCurrentUserId()));
    }

    @Operation(summary = "Change subdomain without re-deploying (moves existing files)")
    @PutMapping("/me/subdomain")
    public ApiResponse<SiteDTO.SiteResponse> changeSubdomain(
            @Valid @RequestBody SiteDTO.ChangeSubdomainRequest request) {
        return ApiResponse.success(siteService.changeSubdomain(
                SecurityUtil.getCurrentUserId(), request.getSubdomain()));
    }
}
