package com.greencity.backend.service.light;

import com.greencity.backend.model.dto.GeoPosition;
import com.greencity.backend.model.dto.LightDto;
import com.greencity.backend.model.dto.LightEntry;
import com.greencity.backend.model.dto.TimePeriodPreference;
import com.greencity.backend.model.entity.LightEntity;
import com.greencity.backend.model.entity.LightEntity_;
import com.greencity.backend.model.repository.LightRepository;
import com.greencity.backend.model.repository.Specs;
import jakarta.validation.ValidationException;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/**
 * @author Anton Gorokh
 */
@Log
@Service
@Transactional
public class LightService {

	private final int heartbeatSecondsMax;
	private final double searchRadiusMetersMax;
	private final LightRepository repository;
	private final LightWebSocket webSocket;

	@Autowired
	public LightService(@Value("${com.greencity.light.heartbeat.heartbeat-tolerate-max-seconds:12}") int heartbeatSecondsMax,
						@Value("${com.greencity.light.heartbeat.search-radius-meters-max:9999}") double searchRadiusMetersMax,
						LightRepository repository, LightWebSocket webSocket) {
		this.heartbeatSecondsMax = heartbeatSecondsMax;
		this.searchRadiusMetersMax = searchRadiusMetersMax;
		this.repository = repository;
		this.webSocket = webSocket;
	}

	public List<LightEntry> getNearest(GeoPosition position, Double radius) {
		if (radius > searchRadiusMetersMax) {
			throw new ValidationException("Search radius exceeds search radius of %f".formatted(searchRadiusMetersMax));
		}
		return repository
				.findNearest(position.lng(), position.lat(), radius)
				.stream()
				.map(LightMapper.INSTANCE::toEntry)
				.toList();
	}

	public LightEntry create(LightDto dto) {
		LightEntity entity = repository.save(LightMapper.INSTANCE.toEntity(dto));
		return LightMapper.INSTANCE.toEntry(entity);
	}

	public void update(UUID uuid, LightDto dto) {
		LightEntity entity = repository.getReferenceById(uuid);
		LightMapper.INSTANCE.updateEntity(entity, dto);
		repository.save(entity);
	}

	public void delete(UUID uuid) {
		repository.deleteById(uuid);
	}

	public void heartbeat(UUID uuid) {
		LightEntity entity = repository.getReferenceById(uuid);
		entity.setHeartbeatAt(Instant.now());
		updateBrightness(entity);
		repository.save(entity);
		sendWebSocketUpdate(entity);
	}

	// pedestrian might be used in future to collect better stats
	public void motionDetected(UUID lightUuid, String pedestrianId) {
		LightEntity entity = repository.getReferenceById(lightUuid);
		Instant now = Instant.now();
		entity.setMotionAt(now);
		entity.setHeartbeatAt(now);
		entity.setDisableAt(now.plusSeconds(entity.getDisableAfterSeconds()));

		repository.findNearest(entity.getLongitude(), entity.getLatitude(), entity.getProximityActivationRadius())
				.forEach(this::updateBrightnessAndSend);
	}

	public void checkActivity() {
		/*
			we want to check lights that are either
			1. no heartbeat lately + inactive (possible sensor corruption)
			2. no motion lately + active (then disable)
		*/
		repository.findAll(
						Specs.or(
								Specs.and(
										Specs.lt(LightEntity_.heartbeatAt, Instant.now().minusSeconds(heartbeatSecondsMax)),
										Specs.has(LightEntity_.brightness, 0.)
								),
								Specs.and(
										Specs.lt(LightEntity_.disableAt, Instant.now()),
										Specs.not(Specs.has(LightEntity_.brightness, 0.))
								)
						)
				)
				.forEach(this::updateBrightnessAndSend);
	}

	private void sendWebSocketUpdate(LightEntity entity) {
		webSocket.sendUpdate(LightMapper.INSTANCE.toEntry(entity));
	}

	private void updateBrightness(LightEntity entity) {
		// no heartbeat - probably corrupt sensor - enable
		if (entity.getHeartbeatAt() == null || Instant.now().isAfter(entity.getHeartbeatAt().plusSeconds(heartbeatSecondsMax))) {
			System.out.println(1);
			enableBrightness(entity);
			return;
		}
		if (entity.getDisableAt() != null && Instant.now().isBefore(entity.getDisableAt())) {
			System.out.println(2);
			enableBrightness(entity);
			return;
		}
		System.out.println(3);
		entity.setBrightness(0.);
	}

	private void updateBrightnessAndSend(LightEntity entity) {
		updateBrightness(entity);
		webSocket.sendUpdate(LightMapper.INSTANCE.toEntry(entity));
	}

	private void enableBrightness(LightEntity entity) {
		var brightnessConfig = entity.getBrightnessConfig();
		if (brightnessConfig.isEmpty()) {
			entity.setBrightness(1.);
			return;
		}
		LocalTime time = LocalTime.now();
		brightnessConfig.stream()
				.filter(period -> isBetween(time, period))
				.findAny()
				.ifPresent(period -> entity.setBrightness(period.brightness()));
	}

	private boolean isBetween(LocalTime time, TimePeriodPreference period) {
		LocalTime from = toLocalTime(period.from());
		LocalTime to = toLocalTime(period.to());

		if (from.equals(to)) { // full-day shortcut?
			return true;
		}
		if (!from.isAfter(to)) { // normal interval: e.g. 06:00–18:00
			return !time.isBefore(from) && time.isBefore(to);
		}
		return !time.isBefore(from) || time.isBefore(to); // wraps midnight: e.g. 20:00–04:00
	}

	private LocalTime toLocalTime(String str) {
		String[] parts = str.split(":");
		return LocalTime.of(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]));
	}
}
