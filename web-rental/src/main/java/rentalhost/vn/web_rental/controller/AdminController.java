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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import rentalhost.vn.web_rental.dto.*;
import rentalhost.vn.web_rental.enums.UserRole;
import rentalhost.vn.web_rental.enums.UserStatus;
import rentalhost.vn.web_rental.helper.ApiResponse;
import rentalhost.vn.web_rental.service.*;

@Tag(name = "Admin", description = "Admin & Super Admin management endpoints")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ServerService serverService;
    private final CategoryService categoryService;
    private final OrderService orderService;
    private final PaymentService paymentService;
    private final AdminService adminService;

    @Operation(summary = "Get all servers (paginated)")
    @GetMapping("/servers")
    public ApiResponse<Page<ServerDTO.ServerResponse>> getAllServers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(serverService.getAll(pageable));
    }

    @Operation(summary = "Create a new hosting plan")
    @PostMapping("/servers")
    public ApiResponse<ServerDTO.ServerResponse> createServer(@Valid @RequestBody ServerDTO.ServerRequest request) {
        return ApiResponse.created(serverService.create(request));
    }

    @Operation(summary = "Update a hosting plan")
    @PutMapping("/servers/{id}")
    public ApiResponse<ServerDTO.ServerResponse> updateServer(@PathVariable Long id,
                                                              @Valid @RequestBody ServerDTO.ServerRequest request) {
        return ApiResponse.success(serverService.update(id, request));
    }

    @Operation(summary = "Delete a hosting plan")
    @DeleteMapping("/servers/{id}")
    public ApiResponse<Void> deleteServer(@PathVariable Long id) {
        serverService.delete(id);
        return ApiResponse.noContent();
    }

    @Operation(summary = "Create a new category")
    @PostMapping("/categories")
    public ApiResponse<CategoryDTO.CategoryResponse> createCategory(@Valid @RequestBody CategoryDTO.CategoryRequest request) {
        return ApiResponse.created(categoryService.create(request));
    }

    @Operation(summary = "Update a category")
    @PutMapping("/categories/{id}")
    public ApiResponse<CategoryDTO.CategoryResponse> updateCategory(@PathVariable Long id,
                                                                    @Valid @RequestBody CategoryDTO.CategoryRequest request) {
        return ApiResponse.success(categoryService.update(id, request));
    }

    @Operation(summary = "Delete a category")
    @DeleteMapping("/categories/{id}")
    public ApiResponse<Void> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return ApiResponse.noContent();
    }

    @Operation(summary = "Get all orders (paginated)")
    @GetMapping("/orders")
    public ApiResponse<Page<OrderDTO.OrderResponse>> getAllOrders(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(orderService.getAllOrders(pageable));
    }

    @Operation(summary = "Get any order by ID")
    @GetMapping("/orders/{id}")
    public ApiResponse<OrderDTO.OrderResponse> getOrderById(@PathVariable Long id) {
        return ApiResponse.success(orderService.getByIdAndUser(id, null));
    }

    @Operation(summary = "Get all payments (paginated)")
    @GetMapping("/payments")
    public ApiResponse<Page<PaymentDTO.PaymentResponse>> getAllPayments(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(paymentService.getAll(pageable));
    }

    @Operation(summary = "Get all users (paginated)")
    @GetMapping("/users")
    public ApiResponse<Page<UserDTO.UserResponse>> getAllUsers(
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        return ApiResponse.success(adminService.getAllUsers(pageable));
    }

    @Operation(summary = "Get user by ID")
    @GetMapping("/users/{id}")
    public ApiResponse<UserDTO.UserResponse> getUserById(@PathVariable Long id) {
        return ApiResponse.success(adminService.getUserById(id));
    }

    @Operation(summary = "Change user role (Super Admin only)")
    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<Void> changeUserRole(@PathVariable Long id, @RequestParam UserRole role) {
        adminService.changeUserRole(id, role);
        return ApiResponse.success("Role updated", null);
    }

    @Operation(summary = "Change user status (Super Admin only)")
    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<Void> changeUserStatus(@PathVariable Long id, @RequestParam UserStatus status) {
        adminService.changeUserStatus(id, status);
        return ApiResponse.success("Status updated", null);
    }

    @Operation(summary = "Delete user (Super Admin only)")
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ApiResponse.noContent();
    }
}
