// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Deck, assert } from '@deck.gl/core';
import { getViewState, getDefaultView, getDeckInstance, removeDeckInstance, getDefaultParameters } from "./deck-utils.js";
import { log } from '@deck.gl/core';
import { resolveLayers } from "./resolve-layers.js";
/**
 * Implements Mapbox [IControl](https://docs.mapbox.com/mapbox-gl-js/api/markers/#icontrol) interface
 * Renders deck.gl layers over the base map and automatically synchronizes with the map's camera
 */
export default class MapboxOverlay {
    constructor(props) {
        this._handleStyleChange = () => {
            resolveLayers(this._map, this._deck, this._props.layers, this._props.layers);
        };
        this._updateContainerSize = () => {
            if (this._map && this._container) {
                const { clientWidth, clientHeight } = this._map.getContainer();
                Object.assign(this._container.style, {
                    width: `${clientWidth}px`,
                    height: `${clientHeight}px`
                });
            }
        };
        this._updateViewState = () => {
            const deck = this._deck;
            const map = this._map;
            if (deck && map) {
                deck.setProps({
                    views: this._props.views || getDefaultView(map),
                    viewState: getViewState(map)
                });
                // Redraw immediately if view state has changed
                if (deck.isInitialized) {
                    deck.redraw();
                }
            }
        };
        // eslint-disable-next-line complexity
        this._handleMouseEvent = (event) => {
            const deck = this._deck;
            if (!deck || !deck.isInitialized) {
                return;
            }
            const mockEvent = {
                type: event.type,
                offsetCenter: event.point,
                srcEvent: event
            };
            const lastDown = this._lastMouseDownPoint;
            if (!event.point && lastDown) {
                // drag* events do not contain a `point` field
                mockEvent.deltaX = event.originalEvent.clientX - lastDown.clientX;
                mockEvent.deltaY = event.originalEvent.clientY - lastDown.clientY;
                mockEvent.offsetCenter = {
                    x: lastDown.x + mockEvent.deltaX,
                    y: lastDown.y + mockEvent.deltaY
                };
            }
            switch (mockEvent.type) {
                case 'mousedown':
                    deck._onPointerDown(mockEvent);
                    this._lastMouseDownPoint = {
                        ...event.point,
                        clientX: event.originalEvent.clientX,
                        clientY: event.originalEvent.clientY
                    };
                    break;
                case 'dragstart':
                    mockEvent.type = 'panstart';
                    deck._onEvent(mockEvent);
                    break;
                case 'drag':
                    mockEvent.type = 'panmove';
                    deck._onEvent(mockEvent);
                    break;
                case 'dragend':
                    mockEvent.type = 'panend';
                    deck._onEvent(mockEvent);
                    break;
                case 'click':
                    mockEvent.tapCount = 1;
                    deck._onEvent(mockEvent);
                    break;
                case 'dblclick':
                    mockEvent.type = 'click';
                    mockEvent.tapCount = 2;
                    deck._onEvent(mockEvent);
                    break;
                case 'mousemove':
                    mockEvent.type = 'pointermove';
                    deck._onPointerMove(mockEvent);
                    break;
                case 'mouseout':
                    mockEvent.type = 'pointerleave';
                    deck._onPointerMove(mockEvent);
                    break;
                default:
                    return;
            }
        };
        const { interleaved = false, ...otherProps } = props;
        this._interleaved = interleaved;
        this._props = otherProps;
    }
    /** Update (partial) props of the underlying Deck instance. */
    setProps(props) {
        if (this._interleaved && props.layers) {
            resolveLayers(this._map, this._deck, this._props.layers, props.layers);
        }
        Object.assign(this._props, props);
        if (this._deck && this._map) {
            this._deck.setProps({
                ...this._props,
                parameters: {
                    ...getDefaultParameters(this._map, this._interleaved),
                    ...this._props.parameters
                }
            });
        }
    }
    /** Called when the control is added to a map */
    onAdd(map) {
        this._map = map;
        return this._interleaved ? this._onAddInterleaved(map) : this._onAddOverlaid(map);
    }
    _onAddOverlaid(map) {
        /* global document */
        const container = document.createElement('div');
        Object.assign(container.style, {
            position: 'absolute',
            left: 0,
            top: 0,
            textAlign: 'initial',
            pointerEvents: 'none'
        });
        this._container = container;
        this._deck = new Deck({
            ...this._props,
            parent: container,
            parameters: { ...getDefaultParameters(map, false), ...this._props.parameters },
            views: this._props.views || getDefaultView(map),
            viewState: getViewState(map)
        });
        map.on('resize', this._updateContainerSize);
        map.on('render', this._updateViewState);
        map.on('mousedown', this._handleMouseEvent);
        map.on('dragstart', this._handleMouseEvent);
        map.on('drag', this._handleMouseEvent);
        map.on('dragend', this._handleMouseEvent);
        map.on('mousemove', this._handleMouseEvent);
        map.on('mouseout', this._handleMouseEvent);
        map.on('click', this._handleMouseEvent);
        map.on('dblclick', this._handleMouseEvent);
        this._updateContainerSize();
        return container;
    }
    _onAddInterleaved(map) {
        // @ts-ignore non-public map property
        const gl = map.painter.context.gl;
        if (gl instanceof WebGLRenderingContext) {
            log.warn('Incompatible basemap library. See: https://deck.gl/docs/api-reference/mapbox/overview#compatibility')();
        }
        this._deck = getDeckInstance({
            map,
            gl,
            deck: new Deck({
                ...this._props,
                gl
            })
        });
        map.on('styledata', this._handleStyleChange);
        resolveLayers(map, this._deck, [], this._props.layers);
        return document.createElement('div');
    }
    /** Called when the control is removed from a map */
    onRemove() {
        const map = this._map;
        if (map) {
            if (this._interleaved) {
                this._onRemoveInterleaved(map);
            }
            else {
                this._onRemoveOverlaid(map);
            }
        }
        this._deck = undefined;
        this._map = undefined;
        this._container = undefined;
    }
    _onRemoveOverlaid(map) {
        map.off('resize', this._updateContainerSize);
        map.off('render', this._updateViewState);
        map.off('mousedown', this._handleMouseEvent);
        map.off('dragstart', this._handleMouseEvent);
        map.off('drag', this._handleMouseEvent);
        map.off('dragend', this._handleMouseEvent);
        map.off('mousemove', this._handleMouseEvent);
        map.off('mouseout', this._handleMouseEvent);
        map.off('click', this._handleMouseEvent);
        map.off('dblclick', this._handleMouseEvent);
        this._deck?.finalize();
    }
    _onRemoveInterleaved(map) {
        map.off('styledata', this._handleStyleChange);
        resolveLayers(map, this._deck, this._props.layers, []);
        removeDeckInstance(map);
    }
    getDefaultPosition() {
        return 'top-left';
    }
    /** Forwards the Deck.pickObject method */
    pickObject(params) {
        assert(this._deck);
        return this._deck.pickObject(params);
    }
    /** Forwards the Deck.pickMultipleObjects method */
    pickMultipleObjects(params) {
        assert(this._deck);
        return this._deck.pickMultipleObjects(params);
    }
    /** Forwards the Deck.pickObjects method */
    pickObjects(params) {
        assert(this._deck);
        return this._deck.pickObjects(params);
    }
    /** Remove from map and releases all resources */
    finalize() {
        if (this._map) {
            this._map.removeControl(this);
        }
    }
    /** If interleaved: true, returns base map's canvas, otherwise forwards the Deck.getCanvas method. */
    getCanvas() {
        if (!this._map) {
            return null;
        }
        return this._interleaved ? this._map.getCanvas() : this._deck.getCanvas();
    }
}
//# sourceMappingURL=mapbox-overlay.js.map