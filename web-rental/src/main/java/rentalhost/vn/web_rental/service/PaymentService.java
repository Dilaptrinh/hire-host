package rentalhost.vn.web_rental.service;

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
import rentalhost.vn.web_rental.mapper.PaymentMapper;
import rentalhost.vn.web_rental.model.Order;
import rentalhost.vn.web_rental.model.Payment;
import rentalhost.vn.web_rental.repository.OrderRepository;
import rentalhost.vn.web_rental.repository.PaymentRepository;
import rentalhost.vn.web_rental.repository.ServerRepository;

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

        if (method == PaymentMethod.MOMO) {
            return createMoMoPayment(order, request);
        }

        Payment payment = Payment.builder()
                .order(order)
                .amount(request.getAmount())
                .method(method)
                .status(PaymentStatus.SUCCESS)
                .transactionId(UUID.randomUUID().toString())
                .paidAt(LocalDateTime.now())
                .build();
        payment = paymentRepository.save(payment);

        order.setStatus(OrderStatus.ACTIVE);
        orderRepository.save(order);

        var server = order.getServer();
        server.setStatus(ServerStatus.RENTED);
        serverRepository.save(server);

        return paymentMapper.toResponse(payment);
    }

    @Transactional
    protected PaymentDTO.PaymentResponse createMoMoPayment(Order order, PaymentDTO.PaymentRequest request) {
        String requestId = UUID.randomUUID().toString();
        String orderId = "ORDER_" + order.getId() + "_" + System.currentTimeMillis();
        String orderInfo = "Thanh toan thue server #" + order.getId();

        String returnUrl = request.getReturnUrl() != null
                ? request.getReturnUrl()
                : paymentConfig.getMomo().getReturnUrl();

        MoMoPaymentGateway.MomoCreatePaymentResponse momoResponse = moMoPaymentGateway.createPayment(
                orderId,
                requestId,
                request.getAmount(),
                orderInfo,
                returnUrl,
                paymentConfig.getMomo().getNotifyUrl()
        );

        if (momoResponse.getResultCode() != 0) {
            throw new BadRequestException("MoMo error: " + momoResponse.getMessage());
        }

        Payment payment = Payment.builder()
                .order(order)
                .amount(request.getAmount())
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
            order.setStatus(OrderStatus.ACTIVE);
            orderRepository.save(order);

            var server = order.getServer();
            server.setStatus(ServerStatus.RENTED);
            serverRepository.save(server);

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

