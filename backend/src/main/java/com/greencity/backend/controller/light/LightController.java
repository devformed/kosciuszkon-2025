package com.greencity.backend.controller.light;

import com.greencity.backend.model.dto.GeoPositionRadiusDto;
import com.greencity.backend.model.dto.LightDto;
import com.greencity.backend.model.dto.LightEntry;
import com.greencity.backend.service.light.LightService;
import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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

	@PostMapping(path = "/nearest")
	public List<LightEntry> getNearest(@Validated GeoPositionRadiusDto geo) {
		return service.getNearest(geo.position(), geo.radius());
	}

	@PostMapping
	public LightEntry create(@RequestBody @Validated LightDto dto) {
		return service.create(dto);
	}

	@PostMapping(path = "/{uuid}")
	public void update(@PathVariable UUID uuid, @Validated @RequestBody LightDto dto) {
		service.update(uuid, dto);
	}

	@DeleteMapping(path = "/{uuid}=")
	public void delete(@PathVariable UUID uuid) {
		service.delete(uuid);
	}

	@PutMapping(path = "/{uuid}/heartbeat", consumes = MediaType.ALL_VALUE)
	public void heartbeat(@PathVariable UUID uuid) {
		service.heartbeat(uuid);
	}

	@PutMapping(path = "/{uuid}/motion-detected", consumes = MediaType.TEXT_PLAIN_VALUE)
	public void motionDetected(@PathVariable UUID uuid, @RequestBody String pedestrianId) {
		service.motionDetected(uuid, pedestrianId);
	}
}
