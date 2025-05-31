package com.greencity.backend.service.light;

import com.greencity.backend.model.dto.LightEntry;

/**
 * @author Anton Gorokh
 */
public interface LightWebSocket {
	void sendUpdate(LightEntry entry);
}
