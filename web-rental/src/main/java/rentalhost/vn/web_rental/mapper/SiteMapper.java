package rentalhost.vn.web_rental.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import rentalhost.vn.web_rental.dto.SiteDTO;
import rentalhost.vn.web_rental.model.Site;

@Mapper(componentModel = "spring")
public interface SiteMapper {

    @Mapping(target = "source", expression = "java(site.getSource().name())")
    @Mapping(target = "status", expression = "java(site.getStatus().name())")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "userFullName", source = "user.fullName")
    SiteDTO.SiteResponse toResponse(Site site);
}
