import { Config } from "@remotion/cli/config";

// Configure Remotion for server-side rendering
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(1);
Config.setChromiumOpenGlRenderer("angle");
Config.setDelayRenderTimeoutInMilliseconds(120000);

// Set webpack overrides if needed
Config.overrideWebpackConfig((currentConfiguration) => {
	return {
		...currentConfiguration,
		module: {
			...currentConfiguration.module,
			rules: [
				...(currentConfiguration.module?.rules ?? []),
				// Add any custom webpack rules here
			],
		},
		resolve: {
			...currentConfiguration.resolve,
			alias: {
				...currentConfiguration.resolve?.alias,
				"@": "/src",
				"@designcombo": "/src/vendor/designcombo",
			},
		},
	};
});
