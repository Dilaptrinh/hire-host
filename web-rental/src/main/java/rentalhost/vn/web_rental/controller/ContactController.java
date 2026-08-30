package rentalhost.vn.web_rental.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import rentalhost.vn.web_rental.dto.ContactDTO;
import rentalhost.vn.web_rental.helper.ApiResponse;
import rentalhost.vn.web_rental.service.ContactService;

@Tag(name = "Contact", description = "Public contact form")
@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @Operation(summary = "Send a contact message via email")
    @PostMapping
    public ApiResponse<Void> send(@Valid @RequestBody ContactDTO.ContactRequest request) {
        contactService.sendContact(request.getName(), request.getEmail(), request.getMessage());
        return ApiResponse.success("Message sent", null);
    }
}
