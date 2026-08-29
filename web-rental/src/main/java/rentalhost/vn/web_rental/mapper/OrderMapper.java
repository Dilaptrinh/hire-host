package rentalhost.vn.web_rental.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import rentalhost.vn.web_rental.dto.OrderDTO;
import rentalhost.vn.web_rental.model.Order;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "serverId", source = "server.id")
    @Mapping(target = "serverName", source = "server.name")
    @Mapping(target = "status", expression = "java(order.getStatus().name())")
    OrderDTO.OrderResponse toResponse(Order order);
}
