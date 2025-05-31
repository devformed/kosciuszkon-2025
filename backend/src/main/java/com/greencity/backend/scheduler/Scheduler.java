package com.greencity.backend.scheduler;

import com.greencity.backend.service.light.LightService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * @author Anton Gorokh
 */
@Component
@RequiredArgsConstructor
public class Scheduler {

	private final LightService lightService;

	@Scheduled(cron = "${com.greencity.scheduler.light.heartbeat.check-cron:0/5 * * * * ?}")
	public void lightHeartbeatCheck() {
		lightService.heartbeatCheck();
	}
}
