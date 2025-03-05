// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map, NavigationControl, useControl} from 'react-map-gl/maplibre';
import {GeoJsonLayer} from 'deck.gl';
import {MapboxOverlay as DeckOverlay} from '@deck.gl/mapbox';
import {PathStyleExtension} from '@deck.gl/extensions';
import {curvedLine, curvedLine2} from './constants';
import 'maplibre-gl/dist/maplibre-gl.css';

const INITIAL_VIEW_STATE = {
  latitude: 48,
  longitude: 10,
  zoom: 6,
  bearing: 0,
  pitch: 30
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

function DeckGLOverlay(props) {
  const overlay = useControl(() => new DeckOverlay(props));
  overlay.setProps(props);
  return null;
}

function Root() {
  const [offset, setOffset] = useState(1);
  const [segmentNum, setSegmentNum] = useState(0);

  /** The offsets for each segment */
  const segmentOffsets = {
    segmentOffsets: [1, 0.75, 0.5, 0.25, 0, 0, 0, 0, 0, 0]
  };

  // Simple test path

  const layers = [
    // new GeoJsonLayer({
    //   id: 'line1',
    //   data: curvedLine,
    //   getLineColor: [200, 0, 128],
    //   lineWidthMinPixels: 5,
    //   getSingleOffset: () => Number(offset),
    //   extensions: [new PathStyleExtension({singleOffset: true})],
    //   updateTriggers: {
    //     getSingleOffset: offset
    //   }
    // }),
    // new GeoJsonLayer({
    //   id: 'line2',
    //   data: curvedLine,
    //   getLineColor: [128, 0, 200],
    //   lineWidthMinPixels: 5,
    //   getSingleOffset: () => -Number(offset),
    //   extensions: [new PathStyleExtension({singleOffset: true})],
    //   updateTriggers: {
    //     getSingleOffset: offset
    //   }
    // }),
    new GeoJsonLayer({
      id: 'line1-extension-offset',
      data: curvedLine2,
      getLineColor: [200, 0, 128],
      lineWidthMinPixels: 5,
      getSingleOffset: () => Number(offset),
      extensions: [new PathStyleExtension({singleOffset: true})],
      updateTriggers: {
        getSingleOffset: segmentOffsets
      }
    }),
    // new GeoJsonLayer({
    //   id: 'line1-extension',
    //   data: curvedLine2,
    //   getLineColor: [200, 0, 128],
    //   lineWidthMinPixels: 5,
    //   opacity: 0.5
    //   // getSingleOffset: () => Number(offset),
    //   // extensions: [new PathStyleExtension({singleOffset: true})],
    //   // updateTriggers: {
    //   //   getSingleOffset: offset
    //   // }
    // }),
    // new GeoJsonLayer({
    //   id: 'variable-offset-line-ref',
    //   data: curvedLine,
    //   getLineColor: [0, 0, 200],
    //   lineWidthMinPixels: 3
    // }),
    new GeoJsonLayer({
      id: 'variable-offset-line',
      data: curvedLine,
      getLineColor: [200, 0, 128],
      lineWidthMinPixels: 5,
      getSegmentOffsets: () => ({
        // offset: Number(offset),
        // segmentNum: Number(segmentNum),
        segmentOffsets
      }),
      extensions: [new PathStyleExtension({variableOffset: true})],
      updateTriggers: {
        getSegmentOffsets: [segmentOffsets]
      }
    })
  ];

  return (
    <>
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          top: 5,
          left: 80,
          zIndex: 1,
          backgroundColor: 'white',
          padding: 5
        }}
      >
        <div>
          <input
            type="range"
            min="-5"
            max="5"
            step={0.5}
            value={offset}
            onChange={e => setOffset(Number(e.target.value))}
          />
          <p>Offset: {offset}</p>
        </div>

        <div>
          <input
            type="range"
            min="0"
            max="10"
            step={1}
            value={segmentNum}
            onChange={e => setSegmentNum(Number(e.target.value))}
          />
          <p>Segment Number: {segmentNum}</p>
        </div>
      </div>

      <Map initialViewState={INITIAL_VIEW_STATE} mapStyle={MAP_STYLE}>
        <DeckGLOverlay layers={layers} interleaved />
        <NavigationControl position="top-left" />
      </Map>
    </>
  );
}

/* global document */
const container = document.body.appendChild(document.createElement('div'));
// make overflow auto
container.style.overflow = 'auto';
createRoot(container).render(<Root />);
