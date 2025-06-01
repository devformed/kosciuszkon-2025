package com.greencity.backend.controller.light;

import com.greencity.backend.model.dto.GeoPositionRadiusDto;
import com.greencity.backend.model.dto.LightDto;
import com.greencity.backend.model.dto.LightEntry;
import com.greencity.backend.model.dto.TimePeriodPreference;
import com.greencity.backend.service.light.LightChatService;
import com.greencity.backend.service.light.LightService;
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
@RequestMapping(path = "/lights", consumes = MediaType.ALL_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
@AllArgsConstructor
public class LightController {

	private final LightService service;
	private final LightChatService chatService;

	@PostMapping(path = "/nearest")
	public List<LightEntry> getNearest(@RequestBody @Validated GeoPositionRadiusDto geo) {
		return service.getNearest(geo.position(), geo.radius());
	}

	@PostMapping("/gen-brightness-config")
	public List<TimePeriodPreference> generateBrightnessConfig(@RequestBody String prompt) {
		return chatService.promptToConfiguration(prompt);
	}

	@PostMapping
	public LightEntry create(@RequestBody @Validated LightDto dto) {
		return service.create(dto);
	}

	@PostMapping(path = "/{uuid}")
	public void update(@PathVariable UUID uuid, @Validated @RequestBody LightDto dto) {
		service.update(uuid, dto);
	}

	@DeleteMapping(path = "/{uuid}")
	public void delete(@PathVariable UUID uuid) {
		service.delete(uuid);
	}

	@PutMapping(path = "/{uuid}/heartbeat")
	public void heartbeat(@PathVariable UUID uuid) {
		service.heartbeat(uuid);
	}

	@PutMapping(path = "/{uuid}/motion-detected")
	public void motionDetected(@PathVariable UUID uuid, @RequestBody String pedestrianId) {
		service.motionDetected(uuid, pedestrianId);
	}
}
