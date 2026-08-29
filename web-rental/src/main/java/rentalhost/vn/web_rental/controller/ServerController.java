package rentalhost.vn.web_rental.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import rentalhost.vn.web_rental.dto.ServerDTO;
import rentalhost.vn.web_rental.helper.ApiResponse;
import rentalhost.vn.web_rental.service.ServerService;

@Tag(name = "Servers", description = "Public hosting plans — no auth required for GET")
@RestController
@RequestMapping("/api/v1/servers")
@RequiredArgsConstructor
public class ServerController {

    private final ServerService serverService;

    @Operation(summary = "Get all available hosting plans (public, paginated)")
    @GetMapping
    public ApiResponse<Page<ServerDTO.ServerResponse>> getAll(
            @PageableDefault(size = 20, sort = "price", direction = Sort.Direction.ASC) Pageable pageable) {
        return ApiResponse.success(serverService.getAllAvailable(pageable));
    }

    @Operation(summary = "Get hosting plan detail by ID (public)")
    @GetMapping("/{id}")
    public ApiResponse<ServerDTO.ServerResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(serverService.getById(id));
    }
}
