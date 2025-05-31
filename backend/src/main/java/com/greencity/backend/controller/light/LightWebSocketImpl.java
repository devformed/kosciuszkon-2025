package com.greencity.backend.controller.light;

import ch.hsr.geohash.GeoHash;
import com.greencity.backend.model.dto.LightEntry;
import com.greencity.backend.service.light.LightWebSocket;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * @author Anton Gorokh
 */
@Component
public class LightWebSocketImpl implements LightWebSocket {

	private final int hashPrecision;
	private final SimpMessagingTemplate messaging;

	public LightWebSocketImpl(@Value("${com.greencity.web-socket.light.hash-precision:6}") int hashPrecision, SimpMessagingTemplate messaging) {
		this.hashPrecision = hashPrecision;
		this.messaging = messaging;
	}

	public void sendUpdate(LightEntry entry) {
		messaging.convertAndSend("/client/region/%s/light".formatted(toRegionHash(entry)), entry);
	}

	/*
	 * To not update websocket clients world-wide, we split the longitude/latitude
	 * into 'chunks' of a given size so that
	 * precision	5 ≈ 4.9×4.9 km,	6≈1.2×0.61 km,	7≈153×153 m, etc.
	 */
	private String toRegionHash(LightEntry entry) {
		var lat = entry.position().latitude().doubleValue();
		var lon = entry.position().longitude().doubleValue();
		GeoHash hash = GeoHash.withCharacterPrecision(lat, lon, this.hashPrecision);
		return hash.toBase32();
	}
}
