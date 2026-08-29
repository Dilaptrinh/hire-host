package rentalhost.vn.web_rental.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import rentalhost.vn.web_rental.model.Site;

import java.util.List;
import java.util.Optional;

public interface SiteRepository extends JpaRepository<Site, Long> {

    @Query("SELECT s FROM Site s JOIN FETCH s.user WHERE s.user.id = :userId")
    Optional<Site> findByUserId(Long userId);

    @Query("SELECT s FROM Site s JOIN FETCH s.user WHERE s.user.id = :userId ORDER BY s.createdAt DESC")
    List<Site> findAllByUserId(Long userId);

    @Query("SELECT s FROM Site s JOIN FETCH s.user ORDER BY s.createdAt DESC")
    List<Site> findAllWithUser();

    Optional<Site> findBySubdomain(String subdomain);

    boolean existsBySubdomain(String subdomain);
}
