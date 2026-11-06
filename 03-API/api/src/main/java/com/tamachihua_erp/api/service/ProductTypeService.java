package com.tamachihua_erp.api.service;

import com.tamachihua_erp.api.dto.producttype.ProductTypeResponseDto;

import java.util.List;

// Tipos de producto: solo options por ahora (HU-20 aplazada; los tipos vienen en los datos iniciales)
public interface ProductTypeService {

    List<ProductTypeResponseDto> findActiveOptions();
}
