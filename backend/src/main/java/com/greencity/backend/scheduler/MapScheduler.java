package com.greencity.backend.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * @author Anton Gorokh
 */
@Component
public class MapScheduler {

	@Scheduled(fixedRateString = "${com.sencity.map.tick-rate:500}")
	public void tick() {

	}
}
