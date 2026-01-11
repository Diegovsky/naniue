import { Outlet } from "react-router";
import { AppProvider } from "./context/app";

export default function Layout() {
	return (
		<AppProvider>
			<Outlet />
		</AppProvider>
	);
}
