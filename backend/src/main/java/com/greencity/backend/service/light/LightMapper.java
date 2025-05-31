package com.greencity.backend.service.light;

import com.greencity.backend.model.dto.LightEntry;
import com.greencity.backend.model.entity.LightEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.time.Instant;

/**
 * @author Anton Gorokh
 */
@Mapper
public interface LightMapper {

	LightMapper INSTANCE = Mappers.getMapper(LightMapper.class);

	@Mapping(target = "position.longitude", source = "entity.longitude")
	@Mapping(target = "position.latitude", source = "entity.latitude")
	@Mapping(target = "heartbeatReceived", expression = "java(heartbeatReceived(entity, heartbeatTolerateSecondsMax))")
	LightEntry toEntry(LightEntity entity, int heartbeatTolerateSecondsMax);

	default boolean heartbeatReceived(LightEntity entity, int heartbeatTolerateSecondsMax) {
		Instant heartbeatAt = entity.getHeartbeatAt();
		return heartbeatAt != null && Instant.now().minusSeconds(heartbeatTolerateSecondsMax).isBefore(heartbeatAt);
	}
}
