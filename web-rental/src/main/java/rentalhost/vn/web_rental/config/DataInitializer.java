package rentalhost.vn.web_rental.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import rentalhost.vn.web_rental.enums.UserRole;
import rentalhost.vn.web_rental.enums.UserStatus;
import rentalhost.vn.web_rental.model.User;
import rentalhost.vn.web_rental.repository.UserRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.super-admin.email}")
    private String superAdminEmail;

    @Value("${app.super-admin.password}")
    private String superAdminPassword;

    @Value("${app.super-admin.full-name}")
    private String superAdminFullName;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail(superAdminEmail).isEmpty()) {
            User superAdmin = User.builder()
                    .email(superAdminEmail)
                    .password(passwordEncoder.encode(superAdminPassword))
                    .fullName(superAdminFullName)
                    .role(UserRole.SUPER_ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(superAdmin);
            log.info("Created default Super Admin account: {}", superAdminEmail);
        }
    }
}
