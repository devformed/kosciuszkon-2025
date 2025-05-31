package com.greencity.backend.controller;

import com.greencity.backend.model.dto.MapEntry;
import com.greencity.backend.service.MapService;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Anton Gorokh
 */
@RestController
@RequestMapping(path = "/map", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
@AllArgsConstructor
public class MapController {

	private final MapService service;

	// todo replace with filter by longlat in future
	@GetMapping
	public MapEntry getCurrent() {
		return null;
	}
}
