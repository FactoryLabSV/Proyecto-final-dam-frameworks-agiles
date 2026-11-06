package com.tamachihua_erp.api.service.impl;

import com.tamachihua_erp.api.dto.producttype.ProductTypeResponseDto;
import com.tamachihua_erp.api.mapper.ProductTypeMapper;
import com.tamachihua_erp.api.repository.ProductTypeRepository;
import com.tamachihua_erp.api.service.ProductTypeService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductTypeServiceImpl implements ProductTypeService {

    private final ProductTypeRepository repository;
    private final ProductTypeMapper mapper;

    @Override
    public List<ProductTypeResponseDto> findActiveOptions() {

        return repository.findAllByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(mapper::toResponseDto)
                .toList();
    }
}
