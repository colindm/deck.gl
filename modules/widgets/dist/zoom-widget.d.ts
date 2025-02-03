import type { Deck, Viewport, Widget, WidgetPlacement } from '@deck.gl/core';
export type ZoomWidgetProps = {
    id?: string;
    /**
     * Widget positioning within the view. Default 'top-left'.
     */
    placement?: WidgetPlacement;
    /**
     * View to attach to and interact with. Required when using multiple views.
     */
    viewId?: string | null;
    /**
     * Button orientation.
     */
    orientation?: 'vertical' | 'horizontal';
    /**
     * Tooltip message on zoom in button.
     */
    zoomInLabel?: string;
    /**
     * Tooltip message on zoom out button.
     */
    zoomOutLabel?: string;
    /**
     * Zoom transition duration in ms.
     */
    transitionDuration?: number;
    /**
     * CSS inline style overrides.
     */
    style?: Partial<CSSStyleDeclaration>;
    /**
     * Additional CSS class.
     */
    className?: string;
};
export declare class ZoomWidget implements Widget<ZoomWidgetProps> {
    id: string;
    props: ZoomWidgetProps;
    placement: WidgetPlacement;
    viewId?: string | null;
    viewports: {
        [id: string]: Viewport;
    };
    deck?: Deck<any>;
    element?: HTMLDivElement;
    constructor(props: ZoomWidgetProps);
    onAdd({ deck }: {
        deck: Deck<any>;
    }): HTMLDivElement;
    onRemove(): void;
    setProps(props: Partial<ZoomWidgetProps>): void;
    onViewportChange(viewport: Viewport): void;
    handleZoom(viewport: Viewport, nextZoom: number): void;
    handleZoomIn(): void;
    handleZoomOut(): void;
    private update;
}
//# sourceMappingURL=zoom-widget.d.ts.map