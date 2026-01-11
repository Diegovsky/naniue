import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes";

export default [
	layout("./layout.tsx", [index("./index.tsx"), route("/repl", "./repl.tsx")]),
] satisfies RouteConfig;
