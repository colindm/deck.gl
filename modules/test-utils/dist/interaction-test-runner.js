// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/* global window */
import { TestRunner } from "./test-runner.js";
const DEFAULT_TEST_CASE = {
    name: 'Unnamed interaction test',
    events: [],
    onBeforeEvents: ({ deck }) => { },
    onAfterEvents: ({ deck, layers, context }) => { }
};
function sleep(timeout) {
    return new Promise(resolve => window.setTimeout(resolve, timeout));
}
export class InteractionTestRunner extends TestRunner {
    get defaultTestCase() {
        return DEFAULT_TEST_CASE;
    }
    // chain events
    async runTestCase(testCase) {
        testCase.context = testCase.onBeforeEvents({
            deck: this.deck
        });
        for (const event of testCase.events) {
            if (event.wait) {
                await sleep(event.wait);
            }
            else {
                await window.browserTestDriver_emulateInput(event);
            }
        }
    }
    async assert(testCase) {
        testCase.onAfterEvents({
            deck: this.deck,
            // @ts-expect-error Accessing protected layerManager
            layers: this.deck.layerManager.getLayers(),
            context: testCase.context
        });
    }
}
//# sourceMappingURL=interaction-test-runner.js.map