package com.greencity.backend.config.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.Nullable;
import lombok.SneakyThrows;
import lombok.extern.java.Log;
import org.apache.logging.log4j.util.Strings;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.StompSubProtocolErrorHandler;

/**
 * @author Anton Gorokh
 */
@Log
@Component
public class WebsocketStompErrorHandler extends StompSubProtocolErrorHandler {

	private final static ObjectMapper OBJECT_MAPPER = new ObjectMapper();

	@SneakyThrows(JsonProcessingException.class)
	@Override
	public Message<byte[]> handleClientMessageProcessingError(Message<byte[]> clientMessage, Throwable thrown) {
		Throwable cause = unwrapCause(thrown);
		String payload = clientMessage != null ? new String(clientMessage.getPayload()) : Strings.EMPTY;
		String headers = clientMessage != null ? OBJECT_MAPPER.writeValueAsString(clientMessage.getHeaders()) : Strings.EMPTY;

		log.warning("Websocket error cause: %s, payload: %s, headers: %s".formatted(cause.getMessage(), payload, headers));
		return super.handleClientMessageProcessingError(clientMessage, thrown);
	}

	private Throwable unwrapCause(Throwable thrown) {
		if (thrown.getCause() == null || thrown.getCause() == thrown) {
			return thrown;
		}
		// dont like recursion but its at most 3-4 iterations so stack should be fine fr fr
		return unwrapCause(thrown.getCause());
	}
}
