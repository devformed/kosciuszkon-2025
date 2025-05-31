package com.greencity.backend.model.dto;

/**
 * @author Anton Gorokh
 */
public record PedestrianEntry(
		String uuid,
		GeoPosition position
) {
}
