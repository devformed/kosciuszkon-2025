package com.greencity.backend.model.dto;

import jakarta.annotation.Nullable;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * @author Anton Gorokh
 */
public record LightDto(
		@Valid
		GeoPosition position,
		@NotNull
		String address,
		@Nullable
		String note,
		@NotNull
		Integer disableAfterSeconds,
		@NotNull
		Double proximityActivationRadius,
		@NotNull @NotEmpty
		List<TimePeriodSetting> brightnessConfig
) {
}
