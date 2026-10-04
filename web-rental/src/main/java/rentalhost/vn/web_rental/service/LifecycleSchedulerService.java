package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rentalhost.vn.web_rental.enums.OrderStatus;
import rentalhost.vn.web_rental.enums.PaymentMethod;
import rentalhost.vn.web_rental.enums.PaymentStatus;
import rentalhost.vn.web_rental.enums.ServerStatus;
import rentalhost.vn.web_rental.model.Order;
import rentalhost.vn.web_rental.model.Payment;
import rentalhost.vn.web_rental.model.Server;
import rentalhost.vn.web_rental.repository.OrderRepository;
import rentalhost.vn.web_rental.repository.PaymentRepository;
import rentalhost.vn.web_rental.repository.ServerRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class LifecycleSchedulerService {

    /** Thời gian tối đa một đơn/giao dịch được giữ ở trạng thái PENDING (phút) cho cổng thanh toán online. */
    private static final int PENDING_TIMEOUT_MINUTES = 15;

    /** Phương thức thanh toán thủ công cần admin xác nhận (không hủy theo timeout ngắn). */
    private static final Set<PaymentMethod> MANUAL_METHODS =
            Set.of(PaymentMethod.BANKING, PaymentMethod.VNPAY, PaymentMethod.CASH);

    /** Thời gian chờ xác nhận thủ công (phút). Mặc định 24 giờ. */
    @Value("${app.payment.manual-pending-timeout-minutes:1440}")
    private long manualPendingTimeoutMinutes;

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ServerRepository serverRepository;

    /**
     * Tự hủy các đơn hàng &amp; giao dịch PENDING quá hạn (bỏ dở, không thanh toán).
     * Đơn có giao dịch thủ công chờ xác nhận được giữ lâu hơn để admin kịp duyệt.
     * Chạy mỗi 5 phút.
     */
    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void cancelExpiredPendingOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(PENDING_TIMEOUT_MINUTES);
        LocalDateTime manualCutoff = LocalDateTime.now().minusMinutes(manualPendingTimeoutMinutes);
        log.info("[scheduler] cancelExpiredPendingOrders - cutoff={}, manualCutoff={}", cutoff, manualCutoff);

        List<Order> pendingOrders = orderRepository.findByStatusAndCreatedAtBefore(OrderStatus.PENDING, cutoff);
        for (Order order : pendingOrders) {
            if (paymentRepository.findByOrderAndStatus(order, PaymentStatus.SUCCESS).isPresent()) {
                continue;
            }

            List<Payment> payments = paymentRepository.findByOrderOrderByCreatedAtDesc(order);
            LocalDateTime manualPendingSince = payments.stream()
                    .filter(p -> p.getStatus() == PaymentStatus.PENDING
                            && MANUAL_METHODS.contains(p.getMethod()))
                    .map(Payment::getCreatedAt)
                    .filter(java.util.Objects::nonNull)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);

            // Còn trong thời gian chờ admin xác nhận thủ công -> giữ đơn PENDING
            if (manualPendingSince != null && manualPendingSince.isAfter(manualCutoff)) {
                log.info("[scheduler] giữ đơn {} chờ admin xác nhận thanh toán thủ công", order.getId());
                continue;
            }

            // Đánh FAILED các giao dịch PENDING còn treo của đơn
            for (Payment payment : payments) {
                if (payment.getStatus() == PaymentStatus.PENDING) {
                    payment.setStatus(PaymentStatus.FAILED);
                    paymentRepository.save(payment);
                }
            }
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            log.info("[scheduler] cancelled abandoned order id={}", order.getId());
        }

        // Dọn các giao dịch PENDING mồ côi của những đơn đã hủy/hết hạn
        List<Payment> stray = paymentRepository.findByStatusAndCreatedAtBefore(PaymentStatus.PENDING, cutoff);
        for (Payment payment : stray) {
            OrderStatus orderStatus = payment.getOrder().getStatus();
            if (orderStatus == OrderStatus.CANCELLED || orderStatus == OrderStatus.EXPIRED) {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
            }
        }
    }

    /**
     * Tự khóa (EXPIRED) các đơn hàng ACTIVE đã qua ngày kết thúc (endDate < hôm nay).
     * Đơn được dùng trọn ngày endDate; slot tự được trả vì "còn chỗ = quantity - đơn ACTIVE".
     * Đồng thời trả server đang kẹt RENTED về AVAILABLE nếu hết đơn ACTIVE.
     * Chạy mỗi ngày lúc 00:15.
     */
    @Scheduled(cron = "0 15 0 * * *")
    @Transactional
    public void expireActiveOrders() {
        LocalDate today = LocalDate.now();
        log.info("[scheduler] expireActiveOrders - today={}", today);

        List<Order> actives = orderRepository.findByStatusAndEndDateBefore(OrderStatus.ACTIVE, today);
        Set<Long> affectedServerIds = new java.util.LinkedHashSet<>();
        for (Order order : actives) {
            order.setStatus(OrderStatus.EXPIRED);
            orderRepository.save(order);
            if (order.getServer() != null) {
                affectedServerIds.add(order.getServer().getId());
            }
            log.info("[scheduler] expired order id={} endDate={}", order.getId(), order.getEndDate());
        }

        // Trả server bị kẹt RENTED (chưa có đơn ACTIVE nào) về AVAILABLE để bán lại
        List<Server> rented = serverRepository.findByStatus(ServerStatus.RENTED);
        for (Server server : rented) {
            long active = orderRepository.countByServerAndStatus(server, OrderStatus.ACTIVE);
            if (active == 0) {
                server.setStatus(ServerStatus.AVAILABLE);
                serverRepository.save(server);
                log.info("[scheduler] released rented server id={} back to AVAILABLE", server.getId());
            }
        }
    }
}
