package com.greencity.backend.service.light;

import com.greencity.backend.model.dto.GeoPosition;
import com.greencity.backend.model.dto.LightEntry;
import com.greencity.backend.model.entity.LightEntity;
import com.greencity.backend.model.entity.LightEntity_;
import com.greencity.backend.model.repository.LightRepository;
import com.greencity.backend.model.repository.Specs;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * @author Anton Gorokh
 */
@Service
public class LightService {

	private final int heartbeatSecondsMax;
	private final LightRepository repository;
	private final LightWebSocket webSocket;

	@Autowired
	public LightService(@Value("${com.greencity.light.heartbeat.tolerate-max-seconds:45}") int heartbeatSecondsMax,
						LightRepository repository, LightWebSocket webSocket) {
		this.heartbeatSecondsMax = heartbeatSecondsMax;
		this.repository = repository;
		this.webSocket = webSocket;
	}

	public List<LightEntry> getNearest(GeoPosition position, Double radius) {
		// todo add max radius validation
		return repository
				.findNearest(position.longitude(), position.latitude(), radius)
				.stream()
				.map(entity -> LightMapper.INSTANCE.toEntry(entity, heartbeatSecondsMax))
				.toList();
	}

	public void heartbeatCheck() {
		repository.findAll(Specs.lt(LightEntity_.heartbeatAt, Instant.now().minusSeconds(heartbeatSecondsMax)))
				.stream()
				.map(entity -> LightMapper.INSTANCE.toEntry(entity, heartbeatSecondsMax))
				.forEach(webSocket::sendUpdate);
	}
}
