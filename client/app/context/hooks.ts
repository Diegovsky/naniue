import { useApp } from "./app";
import type { Chats, Contacts, Profile, Tab } from "./app";

export function useChats(): Chats {
	const app = useApp();
	return app.Chats;
}
export function useContacts(): Contacts {
	const app = useApp();
	return app.Contacts;
}
export function useProfile(): Profile {
	const app = useApp();
	return app.Profile;
}
export function useTab(): Tab {
	const app = useApp();
	return app.Tab;
}
