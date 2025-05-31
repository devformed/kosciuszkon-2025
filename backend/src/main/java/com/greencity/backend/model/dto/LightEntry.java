package com.greencity.backend.model.dto;

import java.util.Map;

/**
 * @author Anton Gorokh
 */
public record LightEntry(
		String uuid,
		Map<TimePeriod, Double> brightness,
		String note,
		String address,
		GeoPosition position,
		boolean heartbeatReceived
) {
}
