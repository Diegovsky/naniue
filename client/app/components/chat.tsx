import { formatTime } from "~/utils";
import Profile from "./profile";
import { UsersThreeIcon } from "@phosphor-icons/react";
import MessageStatusIcon from "./message-status-icon";
import type { Chat } from "types";

const getMetaMessage = (chat: Chat): string => {
	if (chat?.typing) {
		return "typing...";
	}
	return chat.messages[chat.messages.length - 1].message;
};

export function ChatComponent({
	chat,
	selected,
	onClick,
}: {
	chat: Chat;
	selected: boolean;
	onClick: (chatId: string) => void;
}) {
	const lastMessage = chat.messages[chat.messages.length - 1];
	return (
		<button
			type="button"
			onClick={() => onClick(chat.id)}
			className={`outline-none grid grid-cols-6 w-full gap-4 p-2.5 hover:bg-white/10 rounded-xl cursor-pointer ${
				selected ? "bg-white/10" : ""
			}`}
		>
			<div className="col-span-1">
				{chat.avatar ? (
					<Profile size="12" url={chat.avatar} />
				) : (
					<Profile size="12">
						<div className="h-full w-full flex justify-center items-center bg-white/50">
							<UsersThreeIcon className="size-7 text-white" weight="fill" />
						</div>
					</Profile>
				)}
			</div>
			<div className="col-span-3 flex flex-col justify-center items-start w-full">
				<p className="text-white">{chat.name}</p>
				<div className="flex justify-start items-center gap-1 w-full">
					<MessageStatusIcon message={lastMessage} />
					{chat?.typing ? (
						<p className="text-emerald-500 text-sm">{getMetaMessage(chat)}</p>
					) : (
						<p
							className={`text-sm ${
								chat.read || lastMessage.isFromSelf
									? "text-white/55"
									: "text-white font-semibold"
							} whitespace-nowrap truncate text-ellipsis overflow-hidden`}
						>
							{getMetaMessage(chat)}
						</p>
					)}
				</div>
			</div>
			<div className="col-span-2 flex flex-col justify-center items-end">
				<p
					className={`text-xs font-semibold ${
						chat.read || lastMessage.isFromSelf
							? "text-white/55"
							: "text-emerald-400"
					}`}
				>
					{formatTime(lastMessage.timestamp)}
				</p>
			</div>
		</button>
	);
}
