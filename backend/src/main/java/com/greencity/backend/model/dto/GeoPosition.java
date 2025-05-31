package com.greencity.backend.model.dto;

import java.math.BigDecimal;

/**
 * @author Anton Gorokh
 */
public record GeoPosition(
		BigDecimal longitude,
		BigDecimal latitude
) {
}
