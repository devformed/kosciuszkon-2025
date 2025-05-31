package com.greencity.backend.model.dto;

import java.util.List;

/**
 * @author Anton Gorokh
 */
public record MapEntry(
		List<LightEntry> lights,
		List<PedestrianEntry> pedestrians
) {
}
