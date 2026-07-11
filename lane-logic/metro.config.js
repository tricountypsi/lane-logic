const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Metro bundler config.
 *
 * `withNativeWind` wires the Tailwind build (driven by global.css) into
 * Metro's transform pipeline so class names used across the app are
 * compiled into the platform style objects NativeWind ships at runtime.
 */
const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
