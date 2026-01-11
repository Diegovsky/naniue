import NewChatWindow from "./new-chat";
import Chats from "./tab-panel/chats";

export default function TabPanel() {
	return (
		<section className="h-full min-w-[400px] bg-black/90 border-r-[1px] border-gray-300/20 flex-3 flex flex-col overflow-hidden">
			<Chats />
			<NewChatWindow />
		</section>
	);
}
