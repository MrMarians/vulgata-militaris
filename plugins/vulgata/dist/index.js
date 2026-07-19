// Pre-built marker for the plugin installer (needsBuild checks for dist/).
// Real entry points are ./src (see package.json exports) so edits are live
// through the .quartz/plugins symlink without a rebuild step.
export * from "../src/index.js"
