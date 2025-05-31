package com.greencity.backend.controller.light;

import com.greencity.backend.model.dto.LightEntry;
import com.greencity.backend.model.dto.GeoPositionRadiusDto;
import com.greencity.backend.service.light.LightService;
import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * @author Anton Gorokh
 */
@RestController
@RequestMapping(path = "/lights", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
@AllArgsConstructor
public class LightController {

	private final LightService service;

	@PostMapping("/nearest")
	public List<LightEntry> getNearest(GeoPositionRadiusDto geo) {
		return service.getNearest(geo.position(), geo.radius());
	}

	@PutMapping("/heartbeat")
	public void heartbeat(@RequestParam UUID lightUuid) {
		/* if there is no heartbeat for 30 seconds, the sensor will be considered as corrupted.
		In that case, the light should be ON until the heartbeat is received again to ensure
		the street's security - AG :) */
	}

	@PutMapping("/motion-detected")
	public void motionDetected(@RequestParam UUID lightUuid, @RequestParam @Nullable String pedestrianId) {

	}
}
