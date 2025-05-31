package com.greencity.backend.model.entity;

import com.greencity.backend.model.dto.GeoPosition;
import com.greencity.backend.model.dto.TimePeriodSetting;
import com.greencity.backend.util.Identifiable;
import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.Accessors;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.jpa.convert.threeten.Jsr310JpaConverters;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * @author Anton Gorokh
 */
@Accessors(chain = true)
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

	// assumes the server received localtime already converted to UTC
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(nullable = false)
	private List<TimePeriodSetting> brightnessConfig;

	@Column(nullable = false)
	private Double brightness;

	@Nullable
	@Convert(converter = Jsr310JpaConverters.InstantConverter.class)
	private Instant heartbeatAt;

	@Nullable
	@Convert(converter = Jsr310JpaConverters.InstantConverter.class)
	private Instant motionAt;

	@Nullable
	@Convert(converter = Jsr310JpaConverters.InstantConverter.class)
	private Instant disableAt;

	@NotNull
	private Integer disableAfterSeconds;

	@Column(nullable = false)
	private Double proximityActivationRadius;

	private GeoPosition getPosition() {
		return new GeoPosition(longitude, latitude);
	}

	@Override
	public UUID getId() {
		return this.getUuid();
	}
}
