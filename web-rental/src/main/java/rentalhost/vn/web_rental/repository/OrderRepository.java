package rentalhost.vn.web_rental.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import rentalhost.vn.web_rental.enums.OrderStatus;
import rentalhost.vn.web_rental.model.Order;
import rentalhost.vn.web_rental.model.Server;
import rentalhost.vn.web_rental.model.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o JOIN FETCH o.server WHERE o.user = :user ORDER BY o.createdAt DESC")
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT o FROM Order o JOIN FETCH o.server WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT o FROM Order o JOIN FETCH o.server WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    Page<Order> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT o FROM Order o JOIN FETCH o.server ORDER BY o.createdAt DESC")
    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("SELECT o FROM Order o JOIN FETCH o.server ORDER BY o.createdAt DESC")
    Page<Order> findAllWithServer(Pageable pageable);

    boolean existsByUserAndServerAndStatus(User user, Server server, OrderStatus status);

    long countByServerAndStatus(Server server, OrderStatus status);

    @Query("SELECT o FROM Order o JOIN FETCH o.server WHERE o.status = :status AND o.createdAt < :before")
    List<Order> findByStatusAndCreatedAtBefore(OrderStatus status, LocalDateTime before);

    @Query("SELECT o FROM Order o JOIN FETCH o.server WHERE o.status = :status AND o.endDate < :today")
    List<Order> findByStatusAndEndDateBefore(OrderStatus status, LocalDate today);
}
