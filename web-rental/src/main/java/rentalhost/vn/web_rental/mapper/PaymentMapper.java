package rentalhost.vn.web_rental.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import rentalhost.vn.web_rental.dto.PaymentDTO;
import rentalhost.vn.web_rental.model.Payment;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "method", expression = "java(payment.getMethod().name())")
    @Mapping(target = "status", expression = "java(payment.getStatus().name())")
    @Mapping(target = "paymentUrl", source = "paymentUrl")
    PaymentDTO.PaymentResponse toResponse(Payment payment);
}
