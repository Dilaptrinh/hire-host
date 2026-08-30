package rentalhost.vn.web_rental.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import rentalhost.vn.web_rental.dto.AnnouncementDTO;
import rentalhost.vn.web_rental.helper.ApiResponse;
import rentalhost.vn.web_rental.service.AnnouncementService;

import java.util.List;

@Tag(name = "Announcements", description = "Public announcements")
@RestController
@RequestMapping("/api/v1/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @Operation(summary = "Get all announcements (newest first)")
    @GetMapping
    public ApiResponse<List<AnnouncementDTO.AnnouncementResponse>> getAll() {
        return ApiResponse.success(announcementService.getAll());
    }
}
