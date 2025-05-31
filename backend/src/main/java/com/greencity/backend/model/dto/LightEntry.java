package com.greencity.backend.model.dto;

import java.util.List;

/**
 * @author Anton Gorokh
 */
public record LightEntry(
		String uuid,
		Double brightness,
		String note,
		String address,
		GeoPosition position,
		List<TimePeriodSetting> brightnessConfig
) {
}
