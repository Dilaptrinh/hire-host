package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rentalhost.vn.web_rental.dto.OrderDTO;
import rentalhost.vn.web_rental.enums.OrderStatus;
import rentalhost.vn.web_rental.enums.ServerStatus;
import rentalhost.vn.web_rental.exception.BadRequestException;
import rentalhost.vn.web_rental.exception.ForbiddenException;
import rentalhost.vn.web_rental.exception.ResourceNotFoundException;
import rentalhost.vn.web_rental.mapper.OrderMapper;
import rentalhost.vn.web_rental.model.Order;
import rentalhost.vn.web_rental.model.Server;
import rentalhost.vn.web_rental.model.User;
import rentalhost.vn.web_rental.repository.OrderRepository;
import rentalhost.vn.web_rental.repository.ServerRepository;
import rentalhost.vn.web_rental.repository.UserRepository;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ServerRepository serverRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    @Transactional
    public OrderDTO.OrderResponse create(Long userId, OrderDTO.OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Server server = serverRepository.findById(request.getServerId())
                .orElseThrow(() -> new ResourceNotFoundException("Server", request.getServerId()));

        if (server.getStatus() != ServerStatus.AVAILABLE) {
            throw new BadRequestException("Server is not available");
        }

        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new BadRequestException("End date must be after start date");
        }

        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        BigDecimal totalPrice = server.getPrice().multiply(BigDecimal.valueOf(days));

        Order order = Order.builder()
                .user(user)
                .server(server)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalPrice(totalPrice)
                .status(OrderStatus.PENDING)
                .build();
        order = orderRepository.save(order);

        return orderMapper.toResponse(order);
    }

    public Page<OrderDTO.OrderResponse> getByUser(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(orderMapper::toResponse);
    }

    public List<OrderDTO.OrderResponse> getByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    public OrderDTO.OrderResponse getByIdAndUser(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        if (userId != null && !order.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }
        return orderMapper.toResponse(order);
    }

    public Page<OrderDTO.OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAllWithServer(pageable)
                .map(orderMapper::toResponse);
    }

    public List<OrderDTO.OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Transactional
    public OrderDTO.OrderResponse cancel(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        if (!order.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Only pending orders can be cancelled");
        }
        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        Server server = order.getServer();
        server.setStatus(ServerStatus.AVAILABLE);
        serverRepository.save(server);

        return orderMapper.toResponse(order);
    }
}
