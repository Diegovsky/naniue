import TabActivePanel from "./components/tab-active-panel";
import TabPanel from "./components/tab-panel";
import { AppProvider } from "./context/app";

// @unocss-include

export default function Home() {
	return (
		<section className="h-full w-full max-md:stack md:flex md:flex-row">
			<TabPanel />
			<TabActivePanel />
		</section>
	);
}
