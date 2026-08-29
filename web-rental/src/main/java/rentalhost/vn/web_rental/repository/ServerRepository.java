package rentalhost.vn.web_rental.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import rentalhost.vn.web_rental.enums.ServerStatus;
import rentalhost.vn.web_rental.model.Server;

import java.util.List;

public interface ServerRepository extends JpaRepository<Server, Long> {

    @Query("SELECT s FROM Server s LEFT JOIN FETCH s.category WHERE s.status = :status")
    List<Server> findByStatus(ServerStatus status);

    @Query("SELECT s FROM Server s LEFT JOIN FETCH s.category WHERE s.status = :status")
    Page<Server> findByStatus(ServerStatus status, Pageable pageable);

    @Query("SELECT s FROM Server s LEFT JOIN FETCH s.category")
    Page<Server> findAllWithCategory(Pageable pageable);

    @Query("SELECT s FROM Server s LEFT JOIN FETCH s.category WHERE s.category.id = :categoryId")
    List<Server> findByCategoryId(Long categoryId);

    @Query("SELECT s FROM Server s LEFT JOIN FETCH s.category WHERE s.category.id = :categoryId AND s.status = :status")
    List<Server> findByCategoryIdAndStatus(Long categoryId, ServerStatus status);
}
