package rentalhost.vn.web_rental.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rentalhost.vn.web_rental.model.Announcement;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findAllByOrderByCreatedAtDesc();
}
