package com.tamachihua_erp.api.controller;

import com.tamachihua_erp.api.dto.producttype.ProductTypeResponseDto;
import com.tamachihua_erp.api.service.ProductTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Tipos de producto: solo options para el formulario de producto (S2-04).
// El CRUD completo del contrato 4.2 (HU-20) quedó aplazado por decisión del PO.
@RestController
@RequestMapping("/api/product-types")
@RequiredArgsConstructor
public class ProductTypeController {

    private final ProductTypeService service;

    @GetMapping("/options")
    public ResponseEntity<List<ProductTypeResponseDto>> findActiveOptions() {
        return ResponseEntity.ok(service.findActiveOptions());
    }
}
