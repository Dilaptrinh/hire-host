package rentalhost.vn.web_rental.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import rentalhost.vn.web_rental.enums.PaymentStatus;
import rentalhost.vn.web_rental.model.Order;
import rentalhost.vn.web_rental.model.Payment;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT p FROM Payment p JOIN FETCH p.order WHERE p.order = :order ORDER BY p.createdAt DESC")
    List<Payment> findByOrderOrderByCreatedAtDesc(Order order);

    @Query("SELECT p FROM Payment p JOIN FETCH p.order WHERE p.order.user.id = :userId ORDER BY p.createdAt DESC")
    List<Payment> findByUserId(Long userId);

    @Query("SELECT p FROM Payment p JOIN FETCH p.order ORDER BY p.createdAt DESC")
    List<Payment> findAllByOrderByCreatedAtDesc();

    @Query("SELECT p FROM Payment p JOIN FETCH p.order ORDER BY p.createdAt DESC")
    Page<Payment> findAllWithOrder(Pageable pageable);

    Optional<Payment> findByOrderAndStatus(Order order, PaymentStatus status);

    Optional<Payment> findByRequestId(String requestId);
}
