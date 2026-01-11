import { useChats, useContacts, useProfile } from "~/context/hooks";

import {
	ArrowLeftIcon,
	UserPlusIcon,
	UsersIcon,
	UsersThreeIcon,
} from "@phosphor-icons/react";
import TooltipWrapper from "../tooltip-wrapper";
import { AnimatePresence, motion } from "motion/react";
import Profile from "../profile";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Contact } from "types";
const renderDictionary = (entries: [string, Contact[]], index: number) => {
	return (
		<section key={index} className="pt-4 px-4 w-full flex flex-col gap-1">
			{entries[1].length >= 1 && (
				<p className="font-semibold text-white/50 pl-4 mb-4">{entries[0]}</p>
			)}
			{entries[1].map((contact: Contact) => (
				<div
					key={contact.id}
					className="flex w-full justify-start items-center gap-4 p-2.5 hover:bg-white/10 rounded-xl cursor-pointer"
				>
					<Profile size="12" url={contact.contactAvatar} />
					<div className="flex flex-col justify-center items-start">
						<p className="text-white">{contact.displayName}</p>
						<p className="text-white/55">{contact.statusMessage}</p>
					</div>
				</div>
			))}
		</section>
	);
};

export default function NewChatWindow() {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const { isNewChatWindowOpen, closeNewChatWindow } = useChats();
	const { contacts } = useContacts();
	const { profile } = useProfile();
	const [filter, setFilter] = useState("");

	const dictionary = useMemo(() => {
		const obj: Record<string, Contact[]> = {};
		for (var c of contacts) {
			const letter = c.displayName.charAt(0).toLowerCase();
			if (obj[letter] === undefined) {
				obj[letter] = [];
			}
			obj[letter].push(c);
		}
		return Object.entries(obj);
	}, [contacts]);

	useEffect(() => {
		if (isNewChatWindowOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isNewChatWindowOpen]);

	return (
		<AnimatePresence>
			{isNewChatWindowOpen && (
				<motion.section
					className="h-full w-full absolute top-0 bg-white z-10"
					initial={{ left: "-100%" }}
					animate={{ left: 0 }}
					exit={{ left: "-100%" }}
					transition={{ duration: 0.15, ease: "easeIn" }}
				>
					<section className="w-full h-full bg-black/90 flex flex-col">
						<section className="flex justify-start items-center gap-2 pt-4 px-4 w-full">
							<TooltipWrapper onClick={closeNewChatWindow} showTooltip={false}>
								<ArrowLeftIcon className="size-6 text-white" />
							</TooltipWrapper>
							<p className="text-white ml-2">New Chat</p>
						</section>
						<section className="pt-4 px-4 w-full">
							<input
								className="rounded-full w-full p-2 px-4 outline-none bg-white/10 hover:ring-[1px] hover:ring-gray-600 focus:ring-2 focus:ring-green-500 ring-0 ring-transparent focus:bg-transparent placeholder-gray-400 focus:placeholder-gray-400 text-white"
								placeholder="Search for name or number"
								onChange={(event) => setFilter(event.target.value)}
								ref={inputRef}
							/>
						</section>
						<section className="w-full h-full overflow-y-scroll scrollbar-hide pb-4">
							{filter.length === 0 && (
								<section className="pt-4 px-4 w-full flex flex-col gap-1">
									<div className="flex w-full justify-start items-center gap-4 p-2.5 hover:bg-white/10 rounded-xl cursor-pointer">
										<div className="size-12 rounded-full bg-green-500 flex justify-center items-center">
											<UsersIcon className="text-white size-6" weight="fill" />
										</div>
										<div className="flex flex-col justify-center items-start">
											<p className="text-white font-semibold">New Group</p>
										</div>
									</div>
									<div className="flex w-full justify-start items-center gap-4 p-2.5 hover:bg-white/10 rounded-xl cursor-pointer">
										<div className="size-12 rounded-full bg-green-500 flex justify-center items-center">
											<UserPlusIcon
												className="text-white size-6"
												weight="fill"
											/>
										</div>
										<div className="flex flex-col justify-center items-start">
											<p className="text-white font-semibold">New Contact</p>
										</div>
									</div>
									<div className="flex w-full justify-start items-center gap-4 p-2.5 hover:bg-white/10 rounded-xl cursor-pointer">
										<div className="size-12 rounded-full bg-green-500 flex justify-center items-center">
											<UsersThreeIcon
												className="text-white size-6"
												weight="fill"
											/>
										</div>
										<div className="flex flex-col justify-center items-start">
											<p className="text-white font-semibold">New Community</p>
										</div>
									</div>
								</section>
							)}
							<section className="pt-4 px-4 w-full flex flex-col gap-1">
								<p className="font-semibold text-white/50 pl-4 mb-4">
									Contacts on App
								</p>
								{profile.name.includes(filter) && (
									<div className="flex w-full justify-start items-center gap-4 p-2.5 hover:bg-white/10 rounded-xl cursor-pointer">
										<Profile size="12" />
										<div className="flex flex-col justify-center items-start">
											<p className="text-white">{profile.name} (You)</p>
											<p className="text-white/55">Message yourself</p>
										</div>
									</div>
								)}
							</section>
							{dictionary.map(renderDictionary)}
						</section>
					</section>
				</motion.section>
			)}
		</AnimatePresence>
	);
}
