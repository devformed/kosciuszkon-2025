package com.greencity.backend.model.dto;

/**
 * @author Anton Gorokh
 */
public record TimePeriodSetting(
		String from,
		String to,
		Double brightness
) {
}
