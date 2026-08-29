package rentalhost.vn.web_rental.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import rentalhost.vn.web_rental.dto.ServerDTO;
import rentalhost.vn.web_rental.model.Server;

@Mapper(componentModel = "spring")
public interface ServerMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "status", expression = "java(server.getStatus().name())")
    ServerDTO.ServerResponse toResponse(Server server);
}
