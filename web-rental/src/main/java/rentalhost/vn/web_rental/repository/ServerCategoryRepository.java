package rentalhost.vn.web_rental.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rentalhost.vn.web_rental.model.ServerCategory;

public interface ServerCategoryRepository extends JpaRepository<ServerCategory, Long> {
    boolean existsByName(String name);
}
