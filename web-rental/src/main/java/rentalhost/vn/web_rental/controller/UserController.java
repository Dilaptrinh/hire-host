package rentalhost.vn.web_rental.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import rentalhost.vn.web_rental.dto.AuthDTO;
import rentalhost.vn.web_rental.dto.UserDTO;
import rentalhost.vn.web_rental.helper.ApiResponse;
import rentalhost.vn.web_rental.security.SecurityUtil;
import rentalhost.vn.web_rental.service.UserService;

@Tag(name = "Users", description = "User profile management")
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get current user profile")
    @GetMapping("/me")
    public ApiResponse<UserDTO.UserResponse> getProfile() {
        return ApiResponse.success(userService.getProfile(SecurityUtil.getCurrentUserId()));
    }

    @Operation(summary = "Update current user profile")
    @PutMapping("/me")
    public ApiResponse<UserDTO.UserResponse> updateProfile(@Valid @RequestBody UserDTO.UpdateProfileRequest request) {
        return ApiResponse.success(userService.updateProfile(SecurityUtil.getCurrentUserId(), request));
    }

    @Operation(summary = "Change password")
    
    @PutMapping("/me/password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody AuthDTO.ChangePasswordRequest request) {
        userService.changePassword(SecurityUtil.getCurrentUserId(), request.getOldPassword(), request.getNewPassword());
        return ApiResponse.success("Password changed", null);
    }
}
