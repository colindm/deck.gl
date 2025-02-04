// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
export { getLayerUniforms } from "./utils/layer.js";
export { toLowPrecision } from "./utils/precision.js";
export { gl, device } from "./utils/setup-gl.js";
// Utilities for update tests (lifecycle tests)
export { testLayer, testLayerAsync, testInitializeLayer, testInitializeLayerAsync } from "./lifecycle-test.js";
export { generateLayerTests } from "./generate-layer-tests.js";
// Basic utility for rendering multiple scenes (could go into "deck.gl/core")
export { TestRunner } from "./test-runner.js";
// A utility that renders a list of scenes and compares against golden images
export { SnapshotTestRunner } from "./snapshot-test-runner.js";
// A utility that emulates input events
export { InteractionTestRunner } from "./interaction-test-runner.js";
//# sourceMappingURL=index.js.map