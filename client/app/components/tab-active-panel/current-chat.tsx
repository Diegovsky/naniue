import Reaction from "../message/reaction";
import ContactHeader from "./contact-header";
import ChatMessage from "./chat-message";
import MessageReactions from "./message-reactions";
import { useChats } from "~/context/hooks";
import type { Message } from "types";

export default function CurrentChat() {
	const { current, isLoading, addNewMessage } = useChats();

	if (!current) {
		return (
			<section className="w-full h-full text-white flex justify-center items-center">
				Please select a chat to see messages
			</section>
		);
	}

	const messages = current.messages;

	const getMessageSpacing = (
		index: number,
		reactionsCount?: number,
	): string => {
		if (index === messages.length - 1) {
			return "mb-0";
		} else if (reactionsCount && reactionsCount > 0) {
			return "mb-4";
		} else if (messages[index].contactId === messages[index + 1]?.contactId) {
			return "mb-0.5";
		}
		return "mb-4";
	};

	return (
		<section className="w-full h-full flex flex-col">
			<ContactHeader current={current} />
			<div className="h-full w-full flex flex-col justify-end items-center relative">
				<div className="absolute background-custom h-full w-full" />

				<section className="p-4 pb-0 w-full max-h-[710px] flex flex-col justify-end items-center relative grow overflow-y-scroll">
					<div className="w-full flex justify-center items-center">
						<div className="rounded-full overflow-hidden bg-black z-20 w-fit">
							<p className="bg-white/20 text-white/55 h-full w-full text-xs p-1 px-2">
								Today
							</p>
						</div>
					</div>
					{isLoading && <div className="text-white">Loading...</div>}
					{messages.map((message: Message, index: number) => (
						<div
							className={`w-full flex items-center ${
								message.isFromSelf ? "justify-end" : "justify-start"
							}`}
							key={index}
						>
							<div
								className={`flex justify-between gap-2 items-center ${getMessageSpacing(
									index,
									message.reactions?.length,
								)} relative`}
							>
								{message.isFromSelf && <Reaction isSentFromUser={true} />}
								<ChatMessage message={message} />
								{message.isFromSelf && <Reaction isSentFromUser={false} />}
								{message.reactions?.length && (
									<MessageReactions
										reactions={message.reactions}
										isSentFromUser={message.isFromSelf}
									/>
								)}
							</div>
						</div>
					))}
				</section>

				<section className="w-full z-50 h-auto p-4">
					<div className="bg-black rounded-full overflow-hidden">
						<div className="bg-white/15 rounded-full">
							<input
								onInput={(ev) => {
									console.log(ev);
									addNewMessage(ev.target.value);
								}}
								className="w-full outline-none p-3 px-4 text-white placeholder-white/60 caret-green-400 text-sm rounded-full"
								placeholder="Type a message"
							/>
						</div>
					</div>
				</section>
			</div>
		</section>
	);
}
