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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    @Cacheable(value = "servers", sync = true)
    public List<ServerDTO.ServerResponse> availableServers() {
        List<Server> servers = serverRepository.findByStatus(ServerStatus.AVAILABLE);
        Map<Long, Long> activeByServer = activeCountByServer();
        return servers.stream()
                .map(server -> toResponse(server, activeByServer))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private Map<Long, Long> activeCountByServer() {
        return orderRepository.countByServerGroupByStatus(OrderStatus.ACTIVE).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> ((Number) row[1]).longValue()));
    }

    private ServerDTO.ServerResponse toResponse(Server server, Map<Long, Long> activeByServer) {
        ServerDTO.ServerResponse resp = serverMapper.toResponse(server);
        if (server.getQuantity() != null) {
            long active = activeByServer.getOrDefault(server.getId(), 0L);
            resp.setRemaining(Math.max(0, server.getQuantity().longValue() - active));
        }
        return resp;
    }
}
