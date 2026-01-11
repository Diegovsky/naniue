import type { ComponentProps } from "react";
import { useApp } from "./context/app";

function Button({
	action,
	...props
}: { action: () => Promise<any> } & ComponentProps<"button">) {
	return (
		<button
			className="bg-green-800 text-white p-1 cursor-pointer hover:scale-110 active:scale-90 transition"
			onClick={() => {
				action();
			}}
			{...props}
		/>
	);
}

export default function Repl() {
	const {
		client: { wpp: client },
	} = useApp();
	return (
		<div className="flex flex-row gap-1 m-2">
			<Button
				action={async () => {
					const r = await client.login({ base: { userPn: "" } }).response;
					console.log(r);
				}}
			>
				Login
			</Button>

			<Button
				action={async () => {
					const r = client.subscribeMessages({ userPn: "" });
					console.log("Subscribed! Listening for messages!");
					for await (const msg of r.responses) {
						console.log(msg);
					}
				}}
			>
				Subscribe
			</Button>
		</div>
	);
}
