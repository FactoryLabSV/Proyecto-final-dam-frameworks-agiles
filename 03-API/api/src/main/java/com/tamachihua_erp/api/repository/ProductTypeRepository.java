package com.tamachihua_erp.api.repository;

import com.tamachihua_erp.api.entity.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// Tipos de producto: por ahora solo lectura (options). El mantenimiento (HU-20) quedó aplazado.
public interface ProductTypeRepository extends JpaRepository<ProductType, Long> {

    List<ProductType> findAllByIsActiveTrueOrderByNameAsc();
}
