package com.greencity.backend.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/**
 * @author Anton Gorokh
 */
public record GeoPositionRadiusDto(
		@NotNull @Valid
		GeoPosition position,
		@NotNull
		Double radius
) {
}
