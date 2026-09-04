package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import rentalhost.vn.web_rental.dto.ServerDTO;
import rentalhost.vn.web_rental.enums.OrderStatus;
import rentalhost.vn.web_rental.enums.ServerStatus;
import rentalhost.vn.web_rental.mapper.ServerMapper;
import rentalhost.vn.web_rental.model.Server;
import rentalhost.vn.web_rental.repository.OrderRepository;
import rentalhost.vn.web_rental.repository.ServerRepository;

import java.util.List;

/**
 * Dữ liệu catalogue công khai được cache bằng Redis (tăng tốc trang hosting).
 * Tách bean riêng để @Cacheable hoạt động qua proxy (tránh self-invocation)
 * và tránh cache đối tượng Page (khó serialize).
 */
@Service
@RequiredArgsConstructor
public class PublicCatalogService {

    private final ServerRepository serverRepository;
    private final OrderRepository orderRepository;
    private final ServerMapper serverMapper;

    @Cacheable(value = "servers")
    public List<ServerDTO.ServerResponse> availableServers() {
        return serverRepository.findByStatus(ServerStatus.AVAILABLE).stream()
                .map(this::toResponse)
                .toList();
    }

    private ServerDTO.ServerResponse toResponse(Server server) {
        ServerDTO.ServerResponse resp = serverMapper.toResponse(server);
        if (server.getQuantity() != null) {
            long active = orderRepository.countByServerAndStatus(server, OrderStatus.ACTIVE);
            resp.setRemaining(Math.max(0, server.getQuantity().longValue() - active));
        }
        return resp;
    }
}
