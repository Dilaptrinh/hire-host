package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rentalhost.vn.web_rental.dto.ServerDTO;
import rentalhost.vn.web_rental.enums.ServerStatus;
import rentalhost.vn.web_rental.exception.ResourceNotFoundException;
import rentalhost.vn.web_rental.mapper.ServerMapper;
import rentalhost.vn.web_rental.model.Server;
import rentalhost.vn.web_rental.model.ServerCategory;
import rentalhost.vn.web_rental.repository.ServerCategoryRepository;
import rentalhost.vn.web_rental.repository.ServerRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServerService {

    private final ServerRepository serverRepository;
    private final ServerCategoryRepository categoryRepository;
    private final ServerMapper serverMapper;

    public List<ServerDTO.ServerResponse> getAllAvailable() {
        return serverRepository.findByStatus(ServerStatus.AVAILABLE).stream()
                .map(serverMapper::toResponse)
                .toList();
    }

    public Page<ServerDTO.ServerResponse> getAllAvailable(Pageable pageable) {
        return serverRepository.findByStatus(ServerStatus.AVAILABLE, pageable)
                .map(serverMapper::toResponse);
    }

    public Page<ServerDTO.ServerResponse> getAll(Pageable pageable) {
        return serverRepository.findAllWithCategory(pageable)
                .map(serverMapper::toResponse);
    }

    public List<ServerDTO.ServerResponse> getAll() {
        return serverRepository.findAll().stream()
                .map(serverMapper::toResponse)
                .toList();
    }

    public ServerDTO.ServerResponse getById(Long id) {
        Server server = serverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Server", id));
        return serverMapper.toResponse(server);
    }

    public List<ServerDTO.ServerResponse> getByCategory(Long categoryId) {
        return serverRepository.findByCategoryId(categoryId).stream()
                .map(serverMapper::toResponse)
                .toList();
    }

    @Transactional
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
                .status(ServerStatus.AVAILABLE)
                .build();
        server = serverRepository.save(server);
        return serverMapper.toResponse(server);
    }

    @Transactional
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
        server = serverRepository.save(server);
        return serverMapper.toResponse(server);
    }

    @Transactional
    public void delete(Long id) {
        if (!serverRepository.existsById(id)) {
            throw new ResourceNotFoundException("Server", id);
        }
        serverRepository.deleteById(id);
    }
}
