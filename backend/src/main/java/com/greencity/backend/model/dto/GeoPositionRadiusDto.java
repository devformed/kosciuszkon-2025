package com.greencity.backend.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * @author Anton Gorokh
 */
public record GeoPositionRadiusDto(
		@NotNull @Valid
		GeoPosition position,
		@NotNull @PositiveOrZero
		Double radius
) {
}
