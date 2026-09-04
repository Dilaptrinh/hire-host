package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rentalhost.vn.web_rental.dto.ServerDTO;
import rentalhost.vn.web_rental.enums.OrderStatus;
import rentalhost.vn.web_rental.enums.ServerStatus;
import rentalhost.vn.web_rental.exception.ResourceNotFoundException;
import rentalhost.vn.web_rental.mapper.ServerMapper;
import rentalhost.vn.web_rental.model.Server;
import rentalhost.vn.web_rental.model.ServerCategory;
import rentalhost.vn.web_rental.repository.OrderRepository;
import rentalhost.vn.web_rental.repository.ServerCategoryRepository;
import rentalhost.vn.web_rental.repository.ServerRepository;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServerService {

    private final ServerRepository serverRepository;
    private final ServerCategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final ServerMapper serverMapper;
    private final PublicCatalogService publicCatalogService;

    private ServerDTO.ServerResponse toResponse(Server server) {
        ServerDTO.ServerResponse resp = serverMapper.toResponse(server);
        if (server.getQuantity() != null) {
            long active = orderRepository.countByServerAndStatus(server, OrderStatus.ACTIVE);
            resp.setRemaining(Math.max(0, server.getQuantity().longValue() - active));
        }
        return resp;
    }

    public List<ServerDTO.ServerResponse> getAllAvailable() {
        return publicCatalogService.availableServers();
    }

    public Page<ServerDTO.ServerResponse> getAllAvailable(Pageable pageable) {
        List<ServerDTO.ServerResponse> all = new ArrayList<>(publicCatalogService.availableServers());
        int total = all.size();
        int pageSize = pageable.getPageSize();
        int pageNumber = Math.max(pageable.getPageNumber(), 0);
        int from = Math.min(pageNumber * pageSize, total);
        int to = Math.min(from + pageSize, total);
        return new PageImpl<>(all.subList(from, to), pageable, total);
    }

    public Page<ServerDTO.ServerResponse> getAll(Pageable pageable) {
        return serverRepository.findAllWithCategory(pageable)
                .map(this::toResponse);
    }

    public List<ServerDTO.ServerResponse> getAll() {
        return serverRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public ServerDTO.ServerResponse getById(Long id) {
        Server server = serverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Server", id));
        return toResponse(server);
    }

    public List<ServerDTO.ServerResponse> getByCategory(Long categoryId) {
        return publicCatalogService.availableServers().stream()
                .filter(s -> categoryId.equals(s.getCategoryId()))
                .toList();
    }

    @Transactional
    @CacheEvict(cacheNames = "servers", allEntries = true)
    public ServerDTO.ServerResponse create(ServerDTO.ServerRequest request) {
        ServerCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
        }

        Server server = Server.builder()
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .cpu(request.getCpu())
                .ram(request.getRam())
                .storage(request.getStorage())
                .bandwidth(request.getBandwidth())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .status(ServerStatus.AVAILABLE)
                .build();
        server = serverRepository.save(server);
        return toResponse(server);
    }

    @Transactional
    @CacheEvict(cacheNames = "servers", allEntries = true)
    public ServerDTO.ServerResponse update(Long id, ServerDTO.ServerRequest request) {
        Server server = serverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Server", id));

        ServerCategory category = server.getCategory();
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
        }

        server.setCategory(category);
        server.setName(request.getName());
        server.setDescription(request.getDescription());
        server.setCpu(request.getCpu());
        server.setRam(request.getRam());
        server.setStorage(request.getStorage());
        server.setBandwidth(request.getBandwidth());
        server.setPrice(request.getPrice());
        server.setQuantity(request.getQuantity());
        server = serverRepository.save(server);
        return toResponse(server);
    }

    @Transactional
    @CacheEvict(cacheNames = "servers", allEntries = true)
    public void delete(Long id) {
        if (!serverRepository.existsById(id)) {
            throw new ResourceNotFoundException("Server", id);
        }
        serverRepository.deleteById(id);
    }
}
