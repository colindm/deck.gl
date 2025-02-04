import { TestRunner } from "./test-runner.js";
import type { DeckProps, Deck, Layer } from '@deck.gl/core';
type ImageDiffOptions = {
    saveOnFail?: boolean;
    saveAs?: string;
    threshold?: number;
    createDiffImage?: boolean;
    tolerance?: number;
    includeAA?: boolean;
    includeEmpty?: boolean;
    platform?: string;
};
type DiffImageResult = {
    headless: boolean;
    match: string | number;
    matchPercentage: string;
    success: boolean;
    error: Error | string | null;
};
export type SnapshotTestCase = {
    name: string;
    props: DeckProps;
    goldenImage: string;
    onBeforeRender?: (params: {
        deck: Deck;
        layers: Layer[];
    }) => void;
    onAfterRender?: (params: {
        deck: Deck;
        layers: Layer[];
        done: () => void;
    }) => void;
    timeout?: number;
    imageDiffOptions?: ImageDiffOptions;
};
export declare class SnapshotTestRunner extends TestRunner<SnapshotTestCase, DiffImageResult, {
    imageDiffOptions: ImageDiffOptions;
}> {
    private _isDiffing;
    constructor(props: any);
    get defaultTestCase(): SnapshotTestCase;
    initTestCase(testCase: SnapshotTestCase): void;
    runTestCase(testCase: SnapshotTestCase): Promise<void>;
    assert(testCase: SnapshotTestCase): Promise<void>;
}
export {};
//# sourceMappingURL=snapshot-test-runner.d.ts.map