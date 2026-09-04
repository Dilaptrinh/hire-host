package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rentalhost.vn.web_rental.dto.AnnouncementDTO;
import rentalhost.vn.web_rental.exception.ResourceNotFoundException;
import rentalhost.vn.web_rental.mapper.AnnouncementMapper;
import rentalhost.vn.web_rental.model.Announcement;
import rentalhost.vn.web_rental.repository.AnnouncementRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final AnnouncementMapper announcementMapper;

    @Cacheable(value = "announcements")
    @Transactional(readOnly = true)
    public List<AnnouncementDTO.AnnouncementResponse> getAll() {
        return announcementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(announcementMapper::toResponse)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @Transactional(readOnly = true)
    public Page<AnnouncementDTO.AnnouncementResponse> getAll(Pageable pageable) {
        return announcementRepository.findAll(pageable)
                .map(announcementMapper::toResponse);
    }

    @Transactional
    @CacheEvict(cacheNames = "announcements", allEntries = true)
    public AnnouncementDTO.AnnouncementResponse create(AnnouncementDTO.AnnouncementRequest request) {
        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .build();
        return announcementMapper.toResponse(announcementRepository.save(announcement));
    }

    @Transactional
    @CacheEvict(cacheNames = "announcements", allEntries = true)
    public AnnouncementDTO.AnnouncementResponse update(Long id, AnnouncementDTO.AnnouncementRequest request) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", id));
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        return announcementMapper.toResponse(announcementRepository.save(announcement));
    }

    @Transactional
    @CacheEvict(cacheNames = "announcements", allEntries = true)
    public void delete(Long id) {
        if (!announcementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Announcement", id);
        }
        announcementRepository.deleteById(id);
    }
}
