package rentalhost.vn.web_rental.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rentalhost.vn.web_rental.model.RefreshToken;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUserId(Long userId);
}
