import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Filters, type Chat, type Contact, type Profile } from "types";
import { Client } from "~/api/client";
import { useAsync } from "~/utils";

export interface Chats {
	openNewChatWindow(): void;
	isNewChatWindowOpen: boolean;
	closeNewChatWindow(): void;

	get(i: string): Chat | null;

	isLoading: boolean;
	setCurrent(chatId: string | null): void;
	current: Chat | null;

	addNewMessage(message: string): void;

	chats: {
		filter: string;
		updateFilter(v: string): void;
		filtered: Chat[];
		isLoading: boolean;
	};
}

export interface Contacts {
	getContact(i: string): Contact | null;
	contacts: Contact[];
}

export interface App {
	client: Client;
	Chats: Chats;
	Contacts: Contacts;
	Profile: Profile;
}

const AppContext = createContext<App | undefined>(undefined);

export function useApp(): App {
	const app = useContext(AppContext);
	if (!app) {
		throw "Missing app context";
	}
	return app;
}

export function AppProvider({ children }) {
	const client = useMemo(() => new Client(), []);
	const [winOpen, setWinOpen] = useState(false);
	const [currentChat, setCurrentChat] = useState<Chat | null>(null);

	const [filter, setFilter] = useState(Filters.ALL);
	const allChats = useAsync<Chat[]>(client.getChats.bind(client), {
		value: [],
	});

	const allContacts = useAsync<Contact[]>(client.getContacts.bind(client), {
		value: [],
	});

	const chats = useMemo(() => {
		const filtered = allChats.value.filter((chat) => {
			if (filter === Filters.UNREAD && !chat.read) {
				return chat;
			} else if (filter === Filters.FAVORITES && chat.favorite) {
				return chat;
			} else if (filter === Filters.GROUPS && chat.group) {
				return chat;
			} else if (filter === Filters.ALL) {
				return chat;
			}
			return false;
		});

		return filtered;
	}, [allChats, filter]);

	const profile = useAsync(client.getProfile.bind(client), {
		value: {
			avatarUrl: "public/ah.jpeg",
			blueTickEnabled: false,
			id: "null",
			name: "loading...",
		},
	});

	const getChat = (chatId: string) =>
		chats.find((i) => i.id === chatId) || null;

	const app: App = {
		client,
		Chats: {
			isNewChatWindowOpen: winOpen,
			openNewChatWindow() {
				setWinOpen(true);
			},
			closeNewChatWindow() {
				setWinOpen(false);
			},
			addNewMessage(msg) {
				alert("EM BREVE!!");
			},

			get: getChat,

			isLoading: false,
			setCurrent(chatId) {
				if (chatId) {
					setCurrentChat(getChat(chatId));
				} else {
					setCurrentChat(null);
				}
			},
			current: currentChat,

			chats: {
				filtered: chats,
				filter,
				updateFilter: setFilter,
				isLoading: false,
			},
		},
		Contacts: {
			contacts: allContacts.value,
			getContact(i) {
				return allContacts.value.find((c) => c.id === i) || null;
			},
		},
		Profile: profile.value,
	};
	return <AppContext value={app}>{children}</AppContext>;
}
