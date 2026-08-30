package rentalhost.vn.web_rental.mapper;

import org.mapstruct.Mapper;
import rentalhost.vn.web_rental.dto.AnnouncementDTO;
import rentalhost.vn.web_rental.model.Announcement;

@Mapper(componentModel = "spring")
public interface AnnouncementMapper {

    AnnouncementDTO.AnnouncementResponse toResponse(Announcement announcement);
}
