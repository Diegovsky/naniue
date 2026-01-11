import type { Chat, Contact, Profile } from "types";
import { WppClient } from "./pb/naniue-client";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";

export class Client {
	wpp: WppClient;

	constructor() {
		this.wpp = new WppClient(
			new GrpcWebFetchTransport({
				format: "binary",
				baseUrl: "http://localhost:8000/",
			}),
		);
	}

	async getContacts(): Promise<Contact[]> {
		return contacts;
	}

	async getChats(): Promise<Chat[]> {
		return chats;
	}

	async getProfile(): Promise<Profile> {
		return {
			id: "9tkhacj",
			displayName: "Jimmy Mann",
			contactAvatar: "",
			statusMessage: "",
		};
	}
}

const contacts: Contact[] = [
	{
		id: "F66d8fn",
		displayName: "Linnie Frazier",
		contactAvatar: "/lf.jpg",
		statusMessage: "Hey there, I am using App",
	},
	{
		id: "ZeEMJ5a",
		displayName: "Victoria Mason",
		contactAvatar: "/vm.jpg",
		statusMessage: "Hey there, I am using App",
	},
	{
		id: "HdoSv2h",
		displayName: "Lettie Graves",
		contactAvatar: "/lg.jpg",
		statusMessage: "Hey there, I am using App",
	},
	{
		id: "pOtsxq8",
		displayName: "Sue Saunders",
		contactAvatar: "/ss.jpg",
		statusMessage: "Hey there, I am using App",
	},
	{
		id: "8KYNlgL",
		displayName: "Alfred Howard",
		contactAvatar: "/ah.jpg",
		statusMessage: "Hey there, I am using App",
	},
	{
		id: "rYChRQg",
		displayName: "Maude Holloway",
		contactAvatar: "/mh.jpg",
		statusMessage: "Hey there, I am using App",
	},
	{
		id: "LqN7Cf7",
		displayName: "Isabella Burton",
		contactAvatar: "",
		statusMessage: "Hey there, I am using App",
	},
	{
		id: "c3xMk2F",
		displayName: "Katherine Hines",
		contactAvatar: "",
		statusMessage: "Hey there, I am using App",
	},
	{
		id: "wehzYOZ",
		displayName: "Olivia Alexander",
		contactAvatar: "",
		statusMessage: "Hey there, I am using App",
	},
	{
		id: "4k3FCtC",
		displayName: "Lelia Bowman",
		contactAvatar: "",
		statusMessage: "Hey there, I am using App",
	},
	{
		id: "9tkhacj",
		displayName: "Jimmy Mann",
		contactAvatar: "",
		statusMessage: "Hey there, I am using App",
	},
];

function getContactInfo(i: string): {
	contactId: string;
	avatar: string;
	name: string;
	typing: boolean;
} {
	const c = contacts.find((c) => c.id === i);
	if (!c) throw "failed miserably";
	return {
		contactId: c.id,
		avatar: c.contactAvatar,
		name: c.displayName,
		typing: false,
	};
}

const chats: Chat[] = [
	{
		id: "8KERck9",
		...getContactInfo("F66d8fn"),
		read: true,
		group: null,
		favorite: true,
		typing: false,
		messages: [
			{
				contactId: "F66d8fn",
				message: "Hi",
				timestamp: 1747662290,
				delivered: true,
				sent: true,
				read: true,
			},
			{
				contactId: "F66d8fn",
				message: "When do you want me to send the documents?",
				timestamp: 1747662290,
				delivered: true,
				sent: true,
				read: true,
				reactions: [
					{
						emoji: "😮",
						count: 1,
					},
				],
			},
			{
				contactId: "F66d8fn",
				message: "Could you please send them right now?",
				timestamp: 1747662290,
				reactions: [
					{
						emoji: "👍🏼",
						count: 1,
					},
				],
			},
		],
	},
	{
		id: "052e1pz",
		...getContactInfo("ZeEMJ5a"),
		read: true,
		group: null,
		favorite: true,
		messages: [
			{
				contactId: "ZeEMJ5a",
				message: "Hey there!",
				timestamp: 1747662290,
				delivered: true,
				sent: true,
				read: true,
			},
		],
	},
	{
		id: "o9tumiu",
		...getContactInfo("HdoSv2h"),
		read: true,
		group: null,
		favorite: true,
		messages: [
			{
				contactId: "HdoSv2h",
				message: "Hello!",
				timestamp: 1747662290,
				delivered: false,
				sent: true,
				read: false,
			},
		],
	},
	{
		id: "r7zgvio",
		...getContactInfo("pOtsxq8"),
		read: false,
		group: null,
		favorite: true,
		messages: [
			{
				contactId: "pOtsxq8",
				message: "This is an urgent message!",
				timestamp: 1747662290,
			},
		],
	},
	{
		id: "8ennzs2",
		...getContactInfo("8KYNlgL"),
		read: true,
		group: null,
		favorite: false,
		messages: [
			{
				contactId: "8KYNlgL",
				message: "This message won't send!",
				timestamp: 1747662290,
				sent: false,
			},
		],
	},
	{
		id: "zm08t63",
		contactId: null,
		typing: false,
		name: "Three of us",
		avatar: "/ah.jpg",
		read: true,
		group: {
			contacts: ["8KYNlgL", "LqN7Cf7", "9tkhacj"],
		},
		favorite: true,
		messages: [
			{
				contactId: "9tkhacj",
				message: "This message is from Me",
				timestamp: 1747662290,
				sent: true,
				delivered: true,
				read: false,
			},
			{
				contactId: "8KYNlgL",
				message: "This message is from a Alfred",
				timestamp: 1747662290,
			},
			{
				contactId: "LqN7Cf7",
				message: "This message is from Isabella",
				timestamp: 1747662290,
			},
		],
	},
];
