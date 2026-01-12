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
					const login = await client.login({});
					console.log(login);
					if (login.result.case != "alive") {
						return
					}
					const r = client.subscribeMessages({});
					console.log("Subscribed! Listening for messages!");
					for await (const msg of r) {
						console.log(msg);
					}
				}}
			>
				Login
			</Button>

		<Button action={async() => {
			console.log('requesting contacts...');
			console.log('contacts', await client.getContacts({}))
		}}>
			Contacts
		</Button>

			</div>
	);
}
