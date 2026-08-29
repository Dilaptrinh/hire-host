package rentalhost.vn.web_rental.mapper;

import org.mapstruct.Mapper;
import rentalhost.vn.web_rental.dto.CategoryDTO;
import rentalhost.vn.web_rental.model.ServerCategory;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryDTO.CategoryResponse toResponse(ServerCategory category);
}
