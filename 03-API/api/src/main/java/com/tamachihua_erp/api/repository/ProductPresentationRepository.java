package com.tamachihua_erp.api.repository;

import com.tamachihua_erp.api.entity.ProductPresentation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProductPresentationRepository
        extends JpaRepository<ProductPresentation, Long> {

    // Presentaciones de un producto (panel), incluye inactivas
    @EntityGraph(attributePaths = {"presentation", "presentation.measureUnit"})
    List<ProductPresentation> findByProductIdOrderByPresentationNameAsc(Long productId);

    // Presentaciones activas de un producto (app y stock del listado)
    @EntityGraph(attributePaths = {"presentation", "presentation.measureUnit"})
    List<ProductPresentation> findByProductIdAndIsActiveTrueOrderByPresentationNameAsc(Long productId);

    // Presentaciones activas de varios productos (evita N+1 en el listado)
    @EntityGraph(attributePaths = {"presentation", "presentation.measureUnit"})
    List<ProductPresentation> findByProductIdInAndIsActiveTrueOrderByPresentationNameAsc(
            Collection<Long> productIds
    );

    // Verifica que la presentación del producto pertenezca al producto de la ruta
    Optional<ProductPresentation> findByProductIdAndId(Long productId, Long id);

    // Combinación producto + presentación única (uq_product_presentations_product_presentation)
    boolean existsByProductIdAndPresentationId(Long productId, Long presentationId);

    // Código único en todo el sistema (uq_product_presentations_code)
    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);

    // Bloquea la fila de la presentación al cambiar el precio (contrato 5.3)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select pp from ProductPresentation pp where pp.id = :id")
    Optional<ProductPresentation> findByIdForUpdate(@Param("id") Long id);

    // Búsqueda de la app por código exacto de presentación (sin distinguir mayúsculas)
    @Query("""
            select distinct pp.product.id
            from ProductPresentation pp
            where lower(pp.code) = lower(:code)
            """)
    List<Long> findProductIdsByPresentationCode(@Param("code") String code);
}
