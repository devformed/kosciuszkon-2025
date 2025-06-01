package com.greencity.backend.service.light;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.greencity.backend.model.dto.TimePeriodPreference;
import com.greencity.backend.service.remote.llm.ChatFeignClient;
import com.greencity.backend.service.remote.llm.ChatRequest;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

/**
 * @author Anton Gorokh
 */
@Service
public class LightChatService {

	private final static ObjectMapper OBJECT_MAPPER = new ObjectMapper();

	private final String chatSystemMsg;
	private final String chatModel;
	private final ChatFeignClient client;

	@Autowired
	public LightChatService(@Value("${com.greencity.llm.light.system-message}") String chatSystemMsg,
							@Value("${com.greencity.llm.light.chat-model:o4-mini}") String chatModel,
							ChatFeignClient client) {
		this.chatSystemMsg = chatSystemMsg;
		this.chatModel = chatModel;
		this.client = client;
	}

	@SneakyThrows(IOException.class)
	public List<TimePeriodPreference> promptToConfiguration(String prompt) {
		ChatRequest request = new ChatRequest(chatSystemMsg, prompt, chatModel);
		String response = client.send(request).response();
		return OBJECT_MAPPER.readValue(response, new TypeReference<>() {});
	}
}
