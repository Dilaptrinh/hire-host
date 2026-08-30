package rentalhost.vn.web_rental.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import rentalhost.vn.web_rental.dto.AnnouncementDTO;
import rentalhost.vn.web_rental.helper.ApiResponse;
import rentalhost.vn.web_rental.service.AnnouncementService;

@Tag(name = "Admin Announcements", description = "Admin manage announcements")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/admin/announcements")
@RequiredArgsConstructor
public class AdminAnnouncementController {

    private final AnnouncementService announcementService;

    @Operation(summary = "Get all announcements (paginated)")
    @GetMapping
    public ApiResponse<Page<AnnouncementDTO.AnnouncementResponse>> getAll(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(announcementService.getAll(pageable));
    }

    @Operation(summary = "Create an announcement")
    @PostMapping
    public ApiResponse<AnnouncementDTO.AnnouncementResponse> create(@Valid @RequestBody AnnouncementDTO.AnnouncementRequest request) {
        return ApiResponse.created(announcementService.create(request));
    }

    @Operation(summary = "Update an announcement")
    @PutMapping("/{id}")
    public ApiResponse<AnnouncementDTO.AnnouncementResponse> update(@PathVariable Long id,
                                                                    @Valid @RequestBody AnnouncementDTO.AnnouncementRequest request) {
        return ApiResponse.success(announcementService.update(id, request));
    }

    @Operation(summary = "Delete an announcement")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        announcementService.delete(id);
        return ApiResponse.noContent();
    }
}
