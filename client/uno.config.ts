import { defineConfig, presetWind4 } from "unocss";
import { symbols } from "unocss";

export default defineConfig({
	rules: [
		[
			"stack",
			{
				[symbols.body]: `
  display: grid;
  grid-template-areas: "cell";

  &>* {
    grid-area: cell;

  }

  &>:not(:last-child) {
    visibility: hidden;
  }

  &>:last-child {
    z-index: 10;
  }`,
			},
		],
	],
	presets: [presetWind4()],
});
