package rentalhost.vn.web_rental.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import rentalhost.vn.web_rental.dto.CategoryDTO;
import rentalhost.vn.web_rental.dto.ServerDTO;
import rentalhost.vn.web_rental.helper.ApiResponse;
import rentalhost.vn.web_rental.service.CategoryService;
import rentalhost.vn.web_rental.service.ServerService;

import java.util.List;

@Tag(name = "Categories", description = "Server categories — public GET")
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final ServerService serverService;

    @Operation(summary = "Get all categories (public)")
    @GetMapping
    public ApiResponse<List<CategoryDTO.CategoryResponse>> getAll() {
        return ApiResponse.success(categoryService.getAll());
    }

    @Operation(summary = "Get category by ID (public)")
    @GetMapping("/{id}")
    public ApiResponse<CategoryDTO.CategoryResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(categoryService.getById(id));
    }

    @Operation(summary = "Get servers by category (public)")
    @GetMapping("/{id}/servers")
    public ApiResponse<List<ServerDTO.ServerResponse>> getServersByCategory(@PathVariable Long id) {
        return ApiResponse.success(serverService.getByCategory(id));
    }
}
