package rentalhost.vn.web_rental.model;

import jakarta.persistence.*;
import lombok.*;
import rentalhost.vn.web_rental.enums.SiteSource;
import rentalhost.vn.web_rental.enums.SiteStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "sites")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Site {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 40)
    private String subdomain;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SiteSource source;

    @Column(length = 500)
    private String githubUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SiteStatus status;

    @Column(length = 500)
    private String url;

    @Column(length = 255)
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
