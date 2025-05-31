package com.greencity.backend.config.web;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.java.Log;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;
import java.util.logging.Level;
import java.util.stream.Collectors;

/**
 * @author Anton Gorokh
 */
@ControllerAdvice
@Controller
@Log
public class WebExceptionHandler {

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Object> handleConstraintViolations(Exception e) {
		log.log(Level.WARNING, e.getMessage(), e);
		Object body = switch (e) {
			case MethodArgumentNotValidException ex -> {
				yield ex.getBindingResult()
						.getFieldErrors()
						.stream()
						.collect(Collectors.toMap(
								FieldError::getField,
								FieldError::getDefaultMessage,
								(msg1, msg2) -> msg1 + "; " + msg2
						));
			}
			case ConstraintViolationException ex -> {
				yield ex.getConstraintViolations()
						.stream()
						.collect(Collectors.toMap(
								v -> v.getPropertyPath().toString(),
								v -> v.getMessage(),
								(msg1, msg2) -> msg1 + "; " + msg2
						));
			}
			default -> ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
		};
		return ResponseEntity.badRequest().body(body);
	}
}