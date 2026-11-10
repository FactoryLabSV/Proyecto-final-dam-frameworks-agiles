package com.tamachihua_erp.api.repository;

import com.tamachihua_erp.api.entity.ProductLot;
import com.tamachihua_erp.api.repository.projection.PresentationStockProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ProductLotRepository
        extends JpaRepository<ProductLot, Long> {

    // Existencia por presentación: suma de lotes activos con cantidad disponible > 0 (RN-09)
    @Query("""
            select l.productPresentation.id as productPresentationId,
                   sum(l.availableQuantity) as stock
            from ProductLot l
            where l.productPresentation.id in :productPresentationIds
              and l.isActive = true
              and l.availableQuantity > 0
            group by l.productPresentation.id
            """)
    List<PresentationStockProjection> sumStockByProductPresentationIds(
            @Param("productPresentationIds") Collection<Long> productPresentationIds
    );

    // Regla D-01: no se cambia requiresExpiration a FALSE si el producto tiene lotes activos
    @Query("""
            select count(l)
            from ProductLot l
            where l.productPresentation.product.id = :productId
              and l.isActive = true
              and l.availableQuantity > 0
            """)
    long countActiveLotsByProductId(@Param("productId") Long productId);
}
