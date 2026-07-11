/**
 * Babel config for the Lane Logic app.
 *
 * `jsxImportSource: "nativewind"` redirects JSX createElement calls through
 * NativeWind's runtime so that `className` props on RN components resolve
 * to actual style objects. The `nativewind/babel` preset must come AFTER
 * `babel-preset-expo` in the presets array.
 *
 * `module-resolver` makes the `@/*` import alias (declared in
 * tsconfig.json's `paths`) actually resolve at bundle time — TypeScript's
 * `paths` field only affects type-checking, not Metro's module resolution,
 * so both halves are needed for `@/features/...` imports to work.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: { '@': './src' },
        },
      ],
    ],
  };
};
