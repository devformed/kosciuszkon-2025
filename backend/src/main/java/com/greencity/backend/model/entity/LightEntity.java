package com.greencity.backend.model.entity;

import com.greencity.backend.model.dto.TimePeriod;
import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
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

import java.math.BigDecimal;
import java.util.Map;

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
public class LightEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(nullable = false, unique = true, updatable = false)
	private String uuid;

	@Column(nullable = false)
	private BigDecimal longitude;

	@Column(nullable = false)
	private BigDecimal latitude;

	@Nullable
	private String note;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(nullable = false)
	private Map<TimePeriod, Double> config;
}
