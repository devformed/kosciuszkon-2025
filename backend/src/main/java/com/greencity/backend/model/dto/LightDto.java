package com.greencity.backend.model.dto;

import jakarta.validation.Valid;

import java.util.Map;

/**
 * @author Anton Gorokh
 */
public record LightDto(
		@Valid GeoPosition position,
		String address,
		String note,
		Integer disableAfterSeconds,
		Double proximityActivationRadius,
		Map<TimePeriod, Double> brightnessConfig
) {
}
