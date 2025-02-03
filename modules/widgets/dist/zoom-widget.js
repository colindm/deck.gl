import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/* global document */
import { FlyToInterpolator, _deepEqual as deepEqual, _applyStyles as applyStyles, _removeStyles as removeStyles } from '@deck.gl/core';
import { render } from 'preact';
import { ButtonGroup, GroupedIconButton } from "./components.js";
export class ZoomWidget {
    constructor(props) {
        this.id = 'zoom';
        this.placement = 'top-left';
        this.viewId = null;
        this.viewports = {};
        this.id = props.id ?? this.id;
        this.viewId = props.viewId ?? this.viewId;
        this.placement = props.placement ?? this.placement;
        this.props = {
            ...props,
            orientation: props.orientation ?? 'vertical',
            transitionDuration: props.transitionDuration ?? 200,
            zoomInLabel: props.zoomInLabel ?? 'Zoom In',
            zoomOutLabel: props.zoomOutLabel ?? 'Zoom Out',
            style: props.style ?? {}
        };
    }
    onAdd({ deck }) {
        const { style, className } = this.props;
        const element = document.createElement('div');
        element.classList.add('deck-widget', 'deck-widget-zoom');
        if (className)
            element.classList.add(className);
        applyStyles(element, style);
        this.deck = deck;
        this.element = element;
        this.update();
        return element;
    }
    onRemove() {
        this.deck = undefined;
        this.element = undefined;
    }
    setProps(props) {
        this.placement = props.placement ?? this.placement;
        this.viewId = props.viewId ?? this.viewId;
        const oldProps = this.props;
        const el = this.element;
        if (el) {
            if (oldProps.className !== props.className) {
                if (oldProps.className)
                    el.classList.remove(oldProps.className);
                if (props.className)
                    el.classList.add(props.className);
            }
            if (!deepEqual(oldProps.style, props.style, 1)) {
                removeStyles(el, oldProps.style);
                applyStyles(el, props.style);
            }
        }
        Object.assign(this.props, props);
        this.update();
    }
    onViewportChange(viewport) {
        this.viewports[viewport.id] = viewport;
    }
    handleZoom(viewport, nextZoom) {
        const viewId = this.viewId || viewport?.id || 'default-view';
        const nextViewState = {
            ...viewport,
            zoom: nextZoom,
            transitionDuration: this.props.transitionDuration,
            transitionInterpolator: new FlyToInterpolator()
        };
        // @ts-ignore Using private method temporary until there's a public one
        this.deck._onViewStateChange({ viewId, viewState: nextViewState, interactionState: {} });
    }
    handleZoomIn() {
        for (const viewport of Object.values(this.viewports)) {
            this.handleZoom(viewport, viewport.zoom + 1);
        }
    }
    handleZoomOut() {
        for (const viewport of Object.values(this.viewports)) {
            this.handleZoom(viewport, viewport.zoom - 1);
        }
    }
    update() {
        const element = this.element;
        if (!element) {
            return;
        }
        const ui = (_jsxs(ButtonGroup, { orientation: this.props.orientation, children: [_jsx(GroupedIconButton, { onClick: () => this.handleZoomIn(), label: this.props.zoomInLabel, className: "deck-widget-zoom-in" }), _jsx(GroupedIconButton, { onClick: () => this.handleZoomOut(), label: this.props.zoomOutLabel, className: "deck-widget-zoom-out" })] }));
        render(ui, element);
    }
}
//# sourceMappingURL=zoom-widget.js.map