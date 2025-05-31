package com.greencity.backend.service.light;

import com.greencity.backend.model.dto.GeoPosition;
import com.greencity.backend.model.dto.LightDto;
import com.greencity.backend.model.dto.LightEntry;
import com.greencity.backend.model.dto.TimePeriod;
import com.greencity.backend.model.entity.LightEntity;
import com.greencity.backend.model.entity.LightEntity_;
import com.greencity.backend.model.repository.LightRepository;
import com.greencity.backend.model.repository.Specs;
import jakarta.validation.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * @author Anton Gorokh
 */
@Service
@Transactional
public class LightService {

	private final int heartbeatSecondsMax;
	private final double searchRadiusMetersMax;
	private final LightRepository repository;
	private final LightWebSocket webSocket;

	@Autowired
	public LightService(@Value("${com.greencity.light.heartbeat.heartbeat-tolerate-max-seconds:45}") int heartbeatSecondsMax,
						@Value("${com.greencity.light.heartbeat.search-radius-meters-max:9999}") double searchRadiusMetersMax,
						LightRepository repository, LightWebSocket webSocket) {
		this.heartbeatSecondsMax = heartbeatSecondsMax;
		this.searchRadiusMetersMax = searchRadiusMetersMax;
		this.repository = repository;
		this.webSocket = webSocket;
	}

	public List<LightEntry> getNearest(GeoPosition position, Double radius) {
		if (searchRadiusMetersMax > radius) {
			throw new ValidationException("Search radius exceeds search radius of %f".formatted(searchRadiusMetersMax));
		}
		return repository
				.findNearest(position.longitude(), position.latitude(), radius)
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
		// todo add validation here
		repository.save(entity);
	}

	public void delete(UUID uuid) {
		repository.deleteById(uuid);
	}

	public void heartbeat(UUID uuid) {
		LightEntity entity = repository.getReferenceById(uuid);
		entity.setHeartbeatAt(Instant.now());
		repository.save(entity);
		sendWebSocketUpdate(entity);
	}

	public void motionDetected(UUID lightUuid, String pedestrianId) {
		LightEntity entity = repository.getReferenceById(lightUuid);
		Instant now = Instant.now();
		entity.setMotionAt(now);
		entity.setHeartbeatAt(now);
		entity.setDisableAt(now.plusSeconds(entity.getDisableAfterSeconds()));

		repository.findNearest(entity.getLongitude(), entity.getLatitude(), entity.getProximityActivationRadius())
				.stream()
				.map(this::updateBrightness)
				.forEach(this::sendWebSocketUpdate);
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
										Specs.gt(LightEntity_.disableAt, Instant.now()),
										Specs.not(Specs.has(LightEntity_.brightness, 0.))
								)
						)
				)
				.stream()
				.map(this::updateBrightness)
				.forEach(this::sendWebSocketUpdate);
	}

	private void sendWebSocketUpdate(LightEntity entity) {
		webSocket.sendUpdate(LightMapper.INSTANCE.toEntry(entity));
	}

	private LightEntity updateBrightness(LightEntity entity) {
		// if no heartbeat or motion info - probably corrupt sensor - enable
		if (entity.getHeartbeatAt() == null || entity.getMotionAt() == null) {
			enableBrightness(entity);
		}
		// if heartbeat is too old - probably corrupt sensor - enable
		if (Instant.now().isAfter(entity.getHeartbeatAt().plusSeconds(heartbeatSecondsMax))) {
			enableBrightness(entity);
		}
		// if motionAt is too old - disable
		if (entity.getDisableAt() != null && Instant.now().isAfter(entity.getDisableAt())) {
			entity.setBrightness(0.);
		}
		webSocket.sendUpdate(LightMapper.INSTANCE.toEntry(entity));
		return entity;
	}

	private void enableBrightness(LightEntity entity) {
		Map<TimePeriod, Double> brightnessConfig = entity.getBrightnessConfig();
		if (brightnessConfig.isEmpty()) {
			entity.setBrightness(1.);
			return;
		}
		LocalTime time = LocalTime.now();
		brightnessConfig.keySet()
				.stream()
				.filter(period -> isBetween(time, period))
				.findAny()
				.ifPresent(period -> entity.setBrightness(brightnessConfig.get(period)));
	}

	private boolean isBetween(LocalTime time, TimePeriod period) {
		LocalTime from = period.from();
		LocalTime to = period.to();

		if (from.equals(to)) { // full-day shortcut?
			return true;
		}
		if (!from.isAfter(to)) { // normal interval: e.g. 06:00–18:00
			return !time.isBefore(from) && time.isBefore(to);
		}
		return !time.isBefore(from) || time.isBefore(to); // wraps midnight: e.g. 20:00–04:00
	}
}
