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

	@Mapping(target = "position.lng", source = "entity.lng")
	@Mapping(target = "position.lat", source = "entity.lat")
	LightEntry toEntry(LightEntity entity);

	@Mapping(target = "lng", source = "dto.position.lng")
	@Mapping(target = "lat", source = "dto.position.lat")
	@Mapping(target = "brightness", constant = "1.0")
	@Mapping(target = "uuid", ignore = true)
	@Mapping(target = "heartbeatAt", ignore = true)
	@Mapping(target = "motionAt", ignore = true)
	@Mapping(target = "disableAt", ignore = true)
	LightEntity toEntity(LightDto dto);

	@InheritConfiguration(name = "toEntity")
	void updateEntity(@MappingTarget LightEntity entity, LightDto dto);
}
