package com.greencity.backend.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.Collection;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * @author Anton Gorokh
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Commons {

	public static <T> Set<T> ids(Collection<Identifiable<T>> items) {
		return toSet(items, Identifiable::getId);
	}

	public static <T, R> Set<R> toSet(Collection<T> items, Function<T, R> mapper) {
		return toStream(items, mapper)
				.collect(Collectors.toSet());
	}

	private static <T, R> Stream<R> toStream(Collection<T> items, Function<T, R> mapper) {
		return items == null
				? Stream.empty()
				: items.stream().map(mapper);
	}
}
