package rentalhost.vn.web_rental.mapper;

import org.mapstruct.Mapper;
import rentalhost.vn.web_rental.dto.UserDTO;
import rentalhost.vn.web_rental.model.User;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDTO.UserResponse toResponse(User user);
}
