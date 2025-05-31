package com.greencity.backend.controller.light;

import com.greencity.backend.model.dto.LightEntry;
import com.greencity.backend.service.light.LightWebSocket;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * @author Anton Gorokh
 */
@Component
@RequiredArgsConstructor
public class LightWebSocketImpl implements LightWebSocket {

	private final SimpMessagingTemplate messaging;

	public void sendUpdate(LightEntry entry) {
		messaging.convertAndSend("/websocket/region/%s/light".formatted(toRegionHash(entry)), entry);
	}

	private String toRegionHash(LightEntry entry) {
		return "-"; // todo replace with region hash
	}
}
