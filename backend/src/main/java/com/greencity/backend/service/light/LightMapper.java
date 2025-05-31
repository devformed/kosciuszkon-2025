package com.greencity.backend.service.light;

import com.greencity.backend.model.dto.LightDto;
import com.greencity.backend.model.dto.LightEntry;
import com.greencity.backend.model.entity.LightEntity;
import org.mapstruct.InheritConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

/**
 * @author Anton Gorokh
 */
@Mapper
public interface LightMapper {

	LightMapper INSTANCE = Mappers.getMapper(LightMapper.class);

	@Mapping(target = "position.longitude", source = "entity.longitude")
	@Mapping(target = "position.latitude", source = "entity.latitude")
	LightEntry toEntry(LightEntity entity);

	@Mapping(target = "longitude", source = "dto.position.longitude")
	@Mapping(target = "latitude", source = "dto.position.latitude")
	@Mapping(target = "brightness", constant = "1.0")
	@Mapping(target = "uuid", ignore = true)
	@Mapping(target = "heartbeatAt", ignore = true)
	@Mapping(target = "motionAt", ignore = true)
	@Mapping(target = "disableAt", ignore = true)
	LightEntity toEntity(LightDto dto);

	@InheritConfiguration(name = "toEntity")
	void updateEntity(@MappingTarget LightEntity entity, LightDto dto);
}
