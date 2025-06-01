package com.greencity.backend.service.remote.llm;

import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * @author Anton Gorokh
 */
@Bulkhead(name = "backend-ai-llm")
@CircuitBreaker(name = "backend-ai-llm")
@FeignClient(name = "backend-ai-llm", url = "${com.greencity.llm.url}", configuration = ChatFeignClientConfig.class)
public interface ChatFeignClient {

	@PostMapping(value = "/chat", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	ChatResponse send(@RequestBody ChatRequest request);
}
