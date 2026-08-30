package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

    private final JavaMailSender mailSender;

    @Value("${app.contact.email}")
    private String contactEmail;

    @Value("${app.contact.from:}")
    private String fromEmail;

    public void sendContact(String name, String email, String message) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(contactEmail);
        if (fromEmail != null && !fromEmail.isBlank()) {
            mail.setFrom(fromEmail);
        }
        mail.setSubject("Liên hệ từ website - " + name);
        mail.setText("Họ tên: " + name + "\nEmail người gửi: " + email + "\n\nNội dung:\n" + message);
        try {
            mailSender.send(mail);
            log.info("Contact email sent from {} to {}", email, contactEmail);
        } catch (Exception e) {
            log.error("Failed to send contact email", e);
            throw new IllegalStateException("Không thể gửi email. Vui lòng kiểm tra cấu hình SMTP.");
        }
    }
}
