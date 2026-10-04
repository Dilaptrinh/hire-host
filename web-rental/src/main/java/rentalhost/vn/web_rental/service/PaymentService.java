package rentalhost.vn.web_rental.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rentalhost.vn.web_rental.config.PaymentConfig;
import rentalhost.vn.web_rental.dto.PaymentDTO;
import rentalhost.vn.web_rental.enums.OrderStatus;
import rentalhost.vn.web_rental.enums.PaymentMethod;
import rentalhost.vn.web_rental.enums.PaymentStatus;
import rentalhost.vn.web_rental.enums.ServerStatus;
import rentalhost.vn.web_rental.exception.BadRequestException;
import rentalhost.vn.web_rental.exception.ResourceNotFoundException;
import rentalhost.vn.web_rental.gateway.MoMoPaymentGateway;
import rentalhost.vn.web_rental.gateway.PayOSPaymentGateway;
import rentalhost.vn.web_rental.mapper.PaymentMapper;
import rentalhost.vn.web_rental.model.Order;
import rentalhost.vn.web_rental.model.Payment;
import rentalhost.vn.web_rental.repository.OrderRepository;
import rentalhost.vn.web_rental.repository.PaymentRepository;
import rentalhost.vn.web_rental.repository.ServerRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final ServerRepository serverRepository;
    private final PaymentMapper paymentMapper;
    private final MoMoPaymentGateway moMoPaymentGateway;
    private final PayOSPaymentGateway payOSPaymentGateway;
    private final PaymentConfig paymentConfig;

    @Transactional
    public PaymentDTO.PaymentResponse create(PaymentDTO.PaymentRequest request, Long userId, String ipAddr) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId()));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Order does not belong to user");
        }

        if (paymentRepository.findByOrderAndStatus(order, PaymentStatus.SUCCESS).isPresent()) {
            throw new BadRequestException("Order already paid");
        }

        PaymentMethod method;
        try {
            method = PaymentMethod.valueOf(request.getMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid payment method: " + request.getMethod());
        }

        // Số tiền luôn lấy từ đơn hàng ở phía server, KHÔNG tin amount do client gửi lên.
        BigDecimal amount = order.getTotalPrice();
        if (amount == null || amount.signum() <= 0) {
            throw new BadRequestException("Đơn hàng không có số tiền hợp lệ");
        }
        if (request.getAmount() != null && request.getAmount().compareTo(amount) != 0) {
            log.warn("Payment amount mismatch orderId={} clientAmount={} orderAmount={} userId={}",
                    order.getId(), request.getAmount(), amount, userId);
            throw new BadRequestException("Số tiền thanh toán không khớp với đơn hàng");
        }

        if (method == PaymentMethod.MOMO) {
            return createMoMoPayment(order, amount, request.getReturnUrl());
        }

        if (method == PaymentMethod.PAYOS) {
            return createPayOSPayment(order, amount);
        }

        // Các phương thức thủ công (BANKING, VNPAY, CASH): chỉ ghi nhận giao dịch PENDING.
        // KHÔNG tự duyệt và KHÔNG cấp host - admin phải xác nhận thủ công.
        Payment payment = Payment.builder()
                .order(order)
                .amount(amount)
                .method(method)
                .status(PaymentStatus.PENDING)
                .transactionId(UUID.randomUUID().toString())
                .gateway(method.name())
                .orderInfo("Thanh toan thu cong - don #" + order.getId())
                .build();
        payment = paymentRepository.save(payment);

        log.info("PAYMENT_PENDING method={} orderId={} buyerId={} buyerEmail={} server={} amount={} - cho admin xac nhan",
                method, order.getId(), order.getUser().getId(), order.getUser().getEmail(),
                order.getServer().getName(), amount);

        return paymentMapper.toResponse(payment);
    }

    @Transactional
    protected PaymentDTO.PaymentResponse createMoMoPayment(Order order, BigDecimal amount, String returnUrl) {
        String requestId = UUID.randomUUID().toString();
        String orderId = "ORDER_" + order.getId() + "_" + System.currentTimeMillis();
        String orderInfo = "Thanh toan thue server #" + order.getId();

        String resolvedReturnUrl = returnUrl != null
                ? returnUrl
                : paymentConfig.getMomo().getReturnUrl();

        MoMoPaymentGateway.MomoCreatePaymentResponse momoResponse = moMoPaymentGateway.createPayment(
                orderId,
                requestId,
                amount,
                orderInfo,
                resolvedReturnUrl,
                paymentConfig.getMomo().getNotifyUrl()
        );

        if (momoResponse.getResultCode() != 0) {
            throw new BadRequestException("MoMo error: " + momoResponse.getMessage());
        }

        Payment payment = Payment.builder()
                .order(order)
                .amount(amount)
                .method(PaymentMethod.MOMO)
                .status(PaymentStatus.PENDING)
                .transactionId(orderId)
                .requestId(requestId)
                .paymentUrl(momoResponse.getPayUrl())
                .gateway("MOMO")
                .orderInfo(orderInfo)
                .build();
        payment = paymentRepository.save(payment);

        PaymentDTO.PaymentResponse response = paymentMapper.toResponse(payment);
        response.setPaymentUrl(momoResponse.getPayUrl());
        return response;
    }

    @Transactional
    protected PaymentDTO.PaymentResponse createPayOSPayment(Order order, BigDecimal amount) {
        PaymentConfig.PayOSConfig config = paymentConfig.getPayos();
        long amountValue = amount.longValue();
        long orderCode = 1000000000000L + Math.abs(UUID.randomUUID().hashCode());
        String description = "Thanh toan thue server #" + order.getId();

        PayOSPaymentGateway.PayOSData payosData = payOSPaymentGateway.createPayment(
                orderCode, amountValue, description, config.getReturnUrl(), config.getCancelUrl());

        Payment payment = Payment.builder()
                .order(order)
                .amount(amount)
                .method(PaymentMethod.PAYOS)
                .status(PaymentStatus.PENDING)
                .transactionId(payosData.getOrderCode() != null
                        ? String.valueOf(payosData.getOrderCode())
                        : String.valueOf(orderCode))
                .requestId(payosData.getId() != null ? payosData.getId() : UUID.randomUUID().toString())
                .paymentUrl(payosData.getCheckoutUrl())
                .gateway("PAYOS")
                .orderInfo(description)
                .build();
        payment = paymentRepository.save(payment);

        PaymentDTO.PaymentResponse response = paymentMapper.toResponse(payment);
        response.setPaymentUrl(payosData.getCheckoutUrl());
        response.setQrCode(payosData.getQrCode());
        return response;
    }

    @Transactional
    public String handlePayOSWebhook(String rawBody, String signature) {
        log.info("PayOS webhook received");
        if (!payOSPaymentGateway.verifyWebhook(rawBody)) {
            log.warn("Invalid PayOS webhook signature");
            return "{\"error\":\"Invalid signature\"}";
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(rawBody);
            String code = node.path("code").asText("");
            JsonNode data = node.path("data");
            String orderCode = data.path("orderCode").asText("");
            String transactionId = data.path("transactionId").asText(null);

            Payment payment = paymentRepository.findByTransactionId(orderCode).orElse(null);
            if (payment == null) {
                log.warn("PayOS payment not found for orderCode: {}", orderCode);
                return "{\"error\":\"Not found\"}";
            }
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                return "{\"success\":true}";
            }
            // PayOS báo thanh toán thành công khi code == "00"
            if ("00".equals(code)) {
                payment.setStatus(PaymentStatus.SUCCESS);
                if (transactionId != null && !transactionId.isBlank()) {
                    payment.setTransactionId(transactionId);
                }
                payment.setPaidAt(LocalDateTime.now());
                paymentRepository.save(payment);
                Order order = payment.getOrder();
                activateOrder(order);
                log.info("PAYMENT_SUCCESS payos orderId={} orderCode={} buyerId={} buyerEmail={} server={} amount={}",
                        order.getId(), orderCode, order.getUser().getId(), order.getUser().getEmail(),
                        order.getServer().getName(), payment.getAmount());
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
                log.info("PayOS payment FAILED orderCode: {}", orderCode);
            }
            return "{\"success\":true}";
        } catch (Exception e) {
            log.error("PayOS webhook parse error", e);
            return "{\"error\":\"Invalid data\"}";
        }
    }

    private void activateOrder(Order order) {
        if (order.getStatus() != OrderStatus.PENDING) {
            log.warn("activateOrder skipped: order {} status={} (cancelled/expired by scheduler)", order.getId(), order.getStatus());
            return;
        }
        order.setStatus(OrderStatus.ACTIVE);
        orderRepository.save(order);

        var server = order.getServer();
        if (server != null) {
            server.setStatus(ServerStatus.RENTED);
            serverRepository.save(server);
        }
    }

    @Transactional
    public PaymentDTO.PaymentResponse confirm(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return paymentMapper.toResponse(payment);
        }
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new BadRequestException("Chỉ có thể xác nhận giao dịch đang chờ xử lý");
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        activateOrder(order);

        log.info("PAYMENT_SUCCESS manual-confirm paymentId={} orderId={} buyerId={} buyerEmail={} server={} amount={}",
                payment.getId(), order.getId(), order.getUser().getId(), order.getUser().getEmail(),
                order.getServer() != null ? order.getServer().getName() : null, payment.getAmount());

        return paymentMapper.toResponse(payment);
    }

    @Transactional
    public PaymentDTO.PaymentResponse reject(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new BadRequestException("Chỉ có thể từ chối giao dịch đang chờ xử lý");
        }

        payment.setStatus(PaymentStatus.FAILED);
        paymentRepository.save(payment);

        log.info("PAYMENT_REJECTED paymentId={} orderId={}", payment.getId(), payment.getOrder().getId());

        return paymentMapper.toResponse(payment);
    }

    @Transactional
    public String handleMoMoIpn(Map<String, String> params) {
        log.info("MoMo IPN received: {}", params);

        if (!moMoPaymentGateway.verifySignature(params)) {
            log.warn("Invalid MoMo signature");
            return "{\"RspCode\":\"99\",\"Message\":\"Invalid signature\"}";
        }

        int resultCode = Integer.parseInt(params.getOrDefault("resultCode", "-1"));

        Payment payment = paymentRepository.findByRequestId(params.get("requestId"))
                .orElse(null);

        if (payment == null) {
            log.warn("Payment not found for requestId: {}", params.get("requestId"));
            return "{\"RspCode\":\"01\",\"Message\":\"Payment not found\"}";
        }

        if (payment.getStatus() == PaymentStatus.SUCCESS
                || payment.getStatus() == PaymentStatus.FAILED) {
            log.info("Payment already processed, skipping. Status: {}", payment.getStatus());
            return "{\"RspCode\":\"00\",\"Message\":\"Already processed\"}";
        }

        if (resultCode == 0) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setTransactionId(params.get("transId") != null
                    ? params.get("transId") : payment.getTransactionId());
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);

            Order order = payment.getOrder();
            if (order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.ACTIVE);
                orderRepository.save(order);

                var server = order.getServer();
                server.setStatus(ServerStatus.RENTED);
                serverRepository.save(server);
                log.info("PAYMENT_SUCCESS momo orderId={} transId={} buyerId={} buyerEmail={} server={} amount={}",
                        order.getId(), params.get("transId"), order.getUser().getId(), order.getUser().getEmail(),
                        server.getName(), payment.getAmount());
            } else {
                log.warn("MoMo IPN: order {} already {} - not reactivated", order.getId(), order.getStatus());
            }

            log.info("Payment SUCCESS for orderId: {}", params.get("orderId"));
            return "{\"RspCode\":\"00\",\"Message\":\"Success\"}";
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            log.info("Payment FAILED for orderId: {}, resultCode: {}", params.get("orderId"), resultCode);
            return "{\"RspCode\":\"00\",\"Message\":\"Failed\"}";
        }
    }

    public List<PaymentDTO.PaymentResponse> getByUser(Long userId) {
        return paymentRepository.findByUserId(userId).stream()
                .map(paymentMapper::toResponse)
                .toList();
    }

    public Page<PaymentDTO.PaymentResponse> getAll(Pageable pageable) {
        return paymentRepository.findAllWithOrder(pageable)
                .map(paymentMapper::toResponse);
    }

    public List<PaymentDTO.PaymentResponse> getAll() {
        return paymentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(paymentMapper::toResponse)
                .toList();
    }
}

