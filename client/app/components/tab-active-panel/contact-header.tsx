import Profile from "../profile";
import {
	CaretDownIcon,
	CaretLeftIcon,
	DotsThreeVerticalIcon,
	MagnifyingGlassIcon,
	UsersThreeIcon,
	VideoCameraIcon,
} from "@phosphor-icons/react";
import TooltipWrapper from "../tooltip-wrapper";
import { useChats, useContacts, useProfile } from "~/context/hooks";
import type { Chat, Contact } from "types";

export default function ContactHeader({ current }: { current: Chat }) {
	const { id } = useProfile();
	const { getContact } = useContacts();
	const { setCurrent } = useChats();
	const group = current.group;

	const renderContactStatus = () => {
		return current?.typing ? "typing" : "online";
	};

	const renderChatOptions = () => {
		return (
			<section className="flex justify-end items-center gap-2">
				<TooltipWrapper showTooltip={false}>
					<MagnifyingGlassIcon className="text-white size-5" weight="bold" />
				</TooltipWrapper>
				<TooltipWrapper showTooltip={false}>
					<DotsThreeVerticalIcon className="text-white size-5" weight="bold" />
				</TooltipWrapper>
			</section>
		);
	};

	const renderGroupContactNames = (): string => {
		if (current.group === null) throw "wat";
		return Object.values(current.group.contacts)
			.map((contactId) =>
				contactId === id ? "You" : getContact(contactId)?.displayName,
			)
			.join(", ");
	};

	return (
		<div className="w-full h-fit z-50 flex gap-0 bg-white/10 items-center p-3 px-4 text-white">
			<div
				className="lg:hidden p-2 mr-2 cursor-pointer hover:bg-white/20
				rounded-full"
			>
				<CaretLeftIcon
					onClick={() => {
						setCurrent(null);
					}}
				/>
			</div>
			<div className="flex gap-4 justify-start items-center mr-auto">
				<Profile size="10" url={current?.avatar} />
				<div className="flex flex-col">
					<p>{current?.name}</p>
					<p className="text-xs text-white/50">
						{!current.group ? renderContactStatus() : renderGroupContactNames()}
					</p>
				</div>
			</div>
			<div>{renderChatOptions()}</div>
		</div>
	);
}
