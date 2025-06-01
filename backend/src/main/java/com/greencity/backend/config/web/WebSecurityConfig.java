package com.greencity.backend.config.web;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * @author Anton Gorokh
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		return http.csrf(AbstractHttpConfigurer::disable)
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				// if we had time we'd definitely go with keycloak oauth2
				.authorizeHttpRequests(httpRequests -> httpRequests
						.requestMatchers("/ws/**").permitAll()
						.anyRequest().permitAll()
				)
				.cors(cors -> cors.configurationSource(request -> {
					var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
					corsConfiguration.addAllowedOrigin("*");
					corsConfiguration.addAllowedHeader("*");
					corsConfiguration.addAllowedMethod("*");
					return corsConfiguration;
				}))
				.build();
	}
}
