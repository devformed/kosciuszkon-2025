package com.greencity.backend.config.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * @author Anton Gorokh
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

	private final String[] origins;
	private final WebsocketStompErrorHandler stompErrorHandler;

	@Autowired
	public WebSocketConfig(@Value("${com.greencity.web-socket.allowed-origins:*}") String[] origins,
						   WebsocketStompErrorHandler stompErrorHandler) {
		this.origins = origins;
		this.stompErrorHandler = stompErrorHandler;
	}

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		registry.addEndpoint("/ws").setAllowedOrigins(origins);
		registry.setErrorHandler(stompErrorHandler);
	}

	@Override
	public void configureMessageBroker(MessageBrokerRegistry config) {
		config.enableSimpleBroker("/client");
		config.setApplicationDestinationPrefixes("/app");
	}
}
