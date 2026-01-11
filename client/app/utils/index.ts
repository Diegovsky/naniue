import dayjs from "dayjs";
import { useEffect, useState } from "react";

export const formatTime = (timestamp: number) => {
	const now = dayjs(timestamp);
	return now.format("h:mm A");
};

export const getTimestamp = () => {
	const date = new Date();
	const now = dayjs(date).unix();
	return now;
};

export type Async<T, D> =
	| {
			state: "ready";
			value: T;
	  }
	| {
			value: D;
			state: "loading" | "cancelled";
	  };

export function useAsync<T, D = T>(
	cb: () => Promise<T>,
	opts: { value: D; deps?: unknown[] },
): Async<T, D> {
	const { value, deps } = opts || {};
	const [val, setValue] = useState<Async<T, D>>({
		value: value,
		state: "loading",
	});

	useEffect(() => {
		setValue({
			value: value,
			state: "loading",
		});

		cb()
			.then((val) => setValue({ value: val, state: "ready" }))
			.catch(() => setValue({ value: value, state: "cancelled" }));
	}, deps || []);

	return val;
}
