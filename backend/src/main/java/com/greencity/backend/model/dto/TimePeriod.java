package com.greencity.backend.model.dto;

import java.time.LocalTime;

/**
 * @author Anton Gorokh
 */
public record TimePeriod(
		LocalTime from,
		LocalTime to
) {
}
