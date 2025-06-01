package com.greencity.backend.model.dto;

/**
 * @author Anton Gorokh
 */
public record TimePeriodPreference(
		String from,
		String to,
		Double brightness
) {
}
