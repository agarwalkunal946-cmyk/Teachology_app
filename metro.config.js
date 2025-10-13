const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

// Ensure Metro can resolve and transform TypeScript files that some packages
// (like certain versions of `expo-file-system`) ship in `node_modules`.
const config = {
	resolver: {
		sourceExts: Array.from(new Set([...(defaultConfig.resolver.sourceExts || []), 'ts', 'tsx'])),
	},
};

module.exports = mergeConfig(defaultConfig, config);
