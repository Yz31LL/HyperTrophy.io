/** @type {import("eslint").Linter.Config} */
// @ts-nocheck

module.exports = {
  root: true,
  extends: ["@repo/eslint-config/index.js", "plugin:storybook/recommended"],
}
