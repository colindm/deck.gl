import { TestRunner } from "./test-runner.js";
import type { Deck, Layer } from '@deck.gl/core';
type InteractionEvent = {
    type: string;
    [key: string]: any;
} | {
    wait: number;
};
export type InteractionTestCase = {
    name: string;
    events: InteractionEvent[];
    timeout?: number;
    context?: any;
    onBeforeEvents: (params: {
        deck: Deck;
    }) => any;
    onAfterEvents: (params: {
        deck: Deck;
        layers: Layer[];
        context: any;
    }) => void;
};
export declare class InteractionTestRunner extends TestRunner<InteractionTestCase, {}> {
    get defaultTestCase(): InteractionTestCase;
    runTestCase(testCase: InteractionTestCase): Promise<void>;
    assert(testCase: any): Promise<void>;
}
export {};
//# sourceMappingURL=interaction-test-runner.d.ts.map