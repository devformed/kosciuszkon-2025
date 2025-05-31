package com.greencity.backend.model.repository;

import jakarta.persistence.metamodel.SingularAttribute;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.Specification;

/**
 * @author Anton Gorokh
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Specs {

	public static <E, V> Specification<E> has(SingularAttribute<? super E, V> attribute, V value) {
		return (root, query, cb) -> cb.equal(root.get(attribute), value);
	}

	public static <E, V extends Comparable<V>> Specification<E> lt(SingularAttribute<? super E, V> attribute, V value) {
		return (root, query, cb) -> cb.lessThanOrEqualTo(root.get(attribute), value);
	}
}
