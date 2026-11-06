package com.tamachihua_erp.api.mapper;

import com.tamachihua_erp.api.dto.producttype.ProductTypeResponseDto;
import com.tamachihua_erp.api.entity.ProductType;
import org.springframework.stereotype.Component;

@Component
public class ProductTypeMapper {

    public ProductTypeResponseDto toResponseDto(ProductType type) {

        return new ProductTypeResponseDto(
                type.getId(),
                type.getName(),
                type.getDescription(),
                type.getIsActive(),
                type.getCreatedAt(),
                type.getUpdatedAt()
        );
    }
}
