package com.greencity.backend.model.repository;

import com.greencity.backend.model.entity.LightEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * @author Anton Gorokh
 */
// todo replace all native sql with criteria builder + postgresql function contributor
public interface LightRepository extends JpaRepository<LightEntity, UUID>, JpaSpecificationExecutor<LightEntity> {

	@Query(
			value = """
					SELECT *
					FROM light_entity le
					WHERE ST_DWithin(
					  ST_SetSRID(ST_MakePoint(le.longitude, le.latitude), 4326)::geography,
					  ST_SetSRID(ST_MakePoint(:longitude, :latitude),    4326)::geography,
					  :radius
					)
					""",
			nativeQuery = true
	)
	List<LightEntity> findNearest(@Param("lng") BigDecimal longitude,
								  @Param("lat") BigDecimal latitude,
								  @Param("radius") Double radius);
}
