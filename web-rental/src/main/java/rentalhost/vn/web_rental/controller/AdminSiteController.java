package rentalhost.vn.web_rental.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import rentalhost.vn.web_rental.dto.SiteDTO;
import rentalhost.vn.web_rental.helper.ApiResponse;
import rentalhost.vn.web_rental.service.SiteService;

import java.util.List;

@Tag(name = "Admin Sites", description = "Admin & Super Admin static site management")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/admin/sites")
@RequiredArgsConstructor
public class AdminSiteController {

    private final SiteService siteService;

    @Operation(summary = "Get all hosted sites of all users")
    @GetMapping
    public ApiResponse<List<SiteDTO.SiteResponse>> getAllSites() {
        return ApiResponse.success(siteService.getAllSites());
    }

    @Operation(summary = "Get all hosted sites of a specific user")
    @GetMapping("/users/{userId}")
    public ApiResponse<List<SiteDTO.SiteResponse>> getSitesByUser(@PathVariable Long userId) {
        return ApiResponse.success(siteService.getSitesByUser(userId));
    }

    @Operation(summary = "Delete any user's hosted site (admin/super admin)")
    @DeleteMapping("/{siteId}")
    public ApiResponse<Void> deleteSite(@PathVariable Long siteId) {
        siteService.deleteSiteById(siteId);
        return ApiResponse.noContent();
    }
}
