// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/* global window */
import { TestRunner } from "./test-runner.js";
import { getBoundingBoxInPage } from "./utils/dom.js";
const DEFAULT_TEST_OPTIONS = {
    imageDiffOptions: {}
};
const DEFAULT_TEST_CASE = {
    name: 'Unnamed snapshot test',
    props: {},
    onBeforeRender: ({ deck, layers }) => {
        // eslint-disable-line
    },
    onAfterRender: ({ deck, layers, done }) => {
        if (
        // @ts-expect-error accessing private
        !deck.layerManager?.needsUpdate() &&
            layers.every(layer => layer.isLoaded)) {
            done(); // eslint-disable-line
        }
    },
    goldenImage: ''
};
export class SnapshotTestRunner extends TestRunner {
    constructor(props) {
        super(props, DEFAULT_TEST_OPTIONS);
        this._isDiffing = false;
        this._isDiffing = false;
    }
    get defaultTestCase() {
        return DEFAULT_TEST_CASE;
    }
    initTestCase(testCase) {
        super.initTestCase(testCase);
        if (!testCase.goldenImage) {
            throw new Error(`Test case ${testCase.name} does not have golden image`);
        }
    }
    runTestCase(testCase) {
        const deck = this.deck;
        return new Promise(resolve => {
            deck.setProps({
                ...this.props,
                ...testCase,
                onBeforeRender: () => {
                    testCase.onBeforeRender({
                        deck,
                        // @ts-expect-error Accessing protected layerManager
                        layers: this.deck.layerManager.getLayers()
                    });
                },
                onAfterRender: () => {
                    testCase.onAfterRender({
                        deck,
                        // @ts-expect-error Accessing protected layerManager
                        layers: this.deck.layerManager.getLayers(),
                        done: resolve
                    });
                }
            });
        });
    }
    async assert(testCase) {
        if (this._isDiffing) {
            // already performing diffing
            return;
        }
        this._isDiffing = true;
        const diffOptions = {
            ...this.testOptions.imageDiffOptions,
            ...testCase.imageDiffOptions,
            goldenImage: testCase.goldenImage,
            region: getBoundingBoxInPage(this.deck.getCanvas())
        };
        // Take screenshot and compare
        const result = await window.browserTestDriver_captureAndDiffScreen(diffOptions);
        // If failed, try if we have a platform specific golden image
        let resultOverride;
        const platform = this.testOptions.imageDiffOptions?.platform?.toLowerCase();
        if (!result.success) {
            diffOptions.goldenImage = diffOptions.goldenImage.replace('golden-images/', `golden-images/platform-overrides/${platform}/`);
            resultOverride = await window.browserTestDriver_captureAndDiffScreen(diffOptions);
        }
        // invoke user callback
        if (result.success || resultOverride.success) {
            this.pass(result);
        }
        else {
            this.fail(result);
        }
        this._isDiffing = false;
    }
}
//# sourceMappingURL=snapshot-test-runner.js.map