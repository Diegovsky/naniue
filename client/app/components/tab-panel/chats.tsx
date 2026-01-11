import { ChatDotsIcon, DotsThreeVerticalIcon } from "@phosphor-icons/react";
import TooltipWrapper from "../tooltip-wrapper";
import { ChatComponent } from "../chat";
import { useChats } from "~/context/hooks";
import { Filters } from "types";

export default function Chats() {
	const {
		openNewChatWindow,
		chats: { filter, updateFilter, filtered, isLoading },
		setCurrent,
		current,
	} = useChats();

	const RenderChats = () => {
		if (isLoading) {
			return (
				<div className="w-full h-full flex justify-center items-center text-white/50">
					Loading...
				</div>
			);
		}

		return filtered.map((chat) => (
			<ChatComponent
				key={chat.id}
				chat={chat}
				selected={chat.contactId === current?.id}
				onClick={() => setCurrent(chat.id)}
			/>
		));
	};

	return (
		<section className="flex h-full flex-col gap-3 p-4 relative">
			<section className="flex justify-between items-center">
				<p className="text-white text-2xl font-semibold capitalize">Chats</p>
				<section className="flex justify-between items-center gap-2">
					<TooltipWrapper showTooltip={false} onClick={openNewChatWindow}>
						<ChatDotsIcon className="text-white size-6" weight="bold" />
					</TooltipWrapper>
					<TooltipWrapper showTooltip={false}>
						<DotsThreeVerticalIcon
							className="text-white size-6"
							weight="bold"
						/>
					</TooltipWrapper>
				</section>
			</section>
			<section className="w-full flex flex-col gap-1">
				<input
					className="rounded-full w-full p-2 px-4 outline-none bg-white/10 hover:ring-[1px] hover:ring-gray-600 focus:ring-2 focus:ring-green-500 ring-0 ring-transparent focus:bg-transparent placeholder-gray-400 focus:placeholder-gray-400 text-white"
					placeholder="Search or start a new chat"
				/>
				<div className="flex justify-start items-center text-white gap-2 mt-2">
					{Object.values(Filters).map((f: string) => (
						<button
							type="button"
							key={f}
							className={`${
								f === filter
									? "bg-green-700/30 text-green-100 border-green-600/30"
									: "border-white/20 hover:bg-white/10"
							} text-sm p-1 px-3 border-[1px] rounded-full cursor-pointer capitalize`}
							onClick={() => updateFilter(f)}
						>
							{f}
						</button>
					))}
				</div>
			</section>
			<section className="w-full h-full overflow-y-auto sm:grid grid-cols-2 content-start md:flex flex-col gap-1">
				<RenderChats />
			</section>
		</section>
	);
}
