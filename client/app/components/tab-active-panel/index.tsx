import { GearSixIcon } from "@phosphor-icons/react";
import CurrentChat from "./current-chat";
import { useChats } from "~/context/hooks";
import { useMediaQuery } from "react-responsive";

export default function TabActivePanel() {
	const { current } = useChats();
	const isLg = useMediaQuery({ query: "(min-width: 48rem)" });

	if (!current && !isLg) {
		return null;
	}

	return (
		<section
			className={`h-full w-full bg-black/90 flex flex-col justify-center items-center gap-4`}
		>
			{current ? (
				<CurrentChat />
			) : (
				<>
					<GearSixIcon className="size-10 text-gray-400" />
					<p className="text-white text-3xl capitalize">Chats</p>
				</>
			)}
		</section>
	);
}
