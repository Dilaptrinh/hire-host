package rentalhost.vn.web_rental.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import rentalhost.vn.web_rental.dto.OrderDTO;
import rentalhost.vn.web_rental.helper.ApiResponse;
import rentalhost.vn.web_rental.security.SecurityUtil;
import rentalhost.vn.web_rental.service.OrderService;

@Tag(name = "Orders", description = "Order management (authenticated)")
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "Create a new rental order")
    @PostMapping
    public ApiResponse<OrderDTO.OrderResponse> create(@Valid @RequestBody OrderDTO.OrderRequest request) {
        return ApiResponse.created(orderService.create(SecurityUtil.getCurrentUserId(), request));
    }

    @Operation(summary = "Get all orders of current user (paginated)")
    @GetMapping
    public ApiResponse<Page<OrderDTO.OrderResponse>> getAllMine(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ApiResponse.success(orderService.getByUser(SecurityUtil.getCurrentUserId(), pageable));
    }

    @Operation(summary = "Get order detail by ID")
    @GetMapping("/{id}")
    public ApiResponse<OrderDTO.OrderResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(orderService.getByIdAndUser(id, SecurityUtil.getCurrentUserId()));
    }

    @Operation(summary = "Cancel a pending order")
    @PutMapping("/{id}/cancel")
    public ApiResponse<OrderDTO.OrderResponse> cancel(@PathVariable Long id) {
        return ApiResponse.success("cancelled", orderService.cancel(id, SecurityUtil.getCurrentUserId()));
    }
}
