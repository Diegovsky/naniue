export enum Filters {
	ALL = "all",
	UNREAD = "unread",
	FAVORITES = "favorites",
	GROUPS = "groups",
}

export interface ReactionType {
	emoji: string;
	count: number;
}

export interface Message {
	contactId: string;
	message: string;
	timestamp: number;
	isFromSelf: boolean;

	read?: boolean;
	sent?: boolean;
	delivered?: boolean;
	reactions?: ReactionType[];
}

export interface Group {
	contacts: string[];
}

export interface Chat {
	id: string;
	avatar: string;
	contactId: string | null;

	group: Group | null;

	typing: boolean;
	name: string;
	read: boolean;
	favorite: boolean;
	messages: Message[];
}

export type Profile = Contact;

export interface Contact {
	id: string;
	displayName: string;
	contactAvatar: string;
	statusMessage: string;
}
