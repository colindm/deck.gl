import { Layer } from '@deck.gl/core';
import type { LayerTestCase, LayerClass } from "./lifecycle-test.js";
export declare function generateLayerTests<LayerT extends Layer>({ Layer, sampleProps, assert, onBeforeUpdate, onAfterUpdate, runDefaultAsserts }: {
    Layer: LayerClass<LayerT>;
    /**
     * Override default props during the test
     */
    sampleProps?: Partial<LayerT['props']>;
    assert?: (condition: any, comment: string) => void;
    onBeforeUpdate?: LayerTestCase<LayerT>['onBeforeUpdate'];
    onAfterUpdate?: LayerTestCase<LayerT>['onAfterUpdate'];
    /**
     * Test some typical assumptions after layer updates
     * For primitive layers, assert that layer has model(s).
     * For composite layers, assert that layer has sublayer(s).
     * @default true
     */
    runDefaultAsserts?: boolean;
}): LayerTestCase<LayerT>[];
//# sourceMappingURL=generate-layer-tests.d.ts.map