package com.greencity.backend.model.entity;

import com.greencity.backend.model.dto.GeoPosition;
import com.greencity.backend.model.dto.TimePeriod;
import com.greencity.backend.util.Identifiable;
import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.jpa.convert.threeten.Jsr310JpaConverters;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * @author Anton Gorokh
 */
@Getter
@Setter
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table
public class LightEntity implements Identifiable<UUID> {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(nullable = false, unique = true, updatable = false)
	private UUID uuid;

	@Column(nullable = false)
	private String address;

	@Column(nullable = false)
	private BigDecimal longitude;

	@Column(nullable = false)
	private BigDecimal latitude;

	@Nullable
	private String note;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(nullable = false)
	private Map<TimePeriod, Double> brightness;

	@Nullable
	@Convert(converter = Jsr310JpaConverters.InstantConverter.class)
	private Instant heartbeatAt;

	private GeoPosition getPosition() {
		return new GeoPosition(longitude, latitude);
	}

	@Override
	public UUID getId() {
		return this.getUuid();
	}
}
