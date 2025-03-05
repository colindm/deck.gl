// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {MapboxOverlay as DeckOverlay} from '@deck.gl/mapbox';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {line, lineConnect, lineConnect2, lineConnect3, line2} from './constants';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: [9, 48],
  zoom: 5.5,
  bearing: 0,
  // pitch: 30,
  antialias: true
});

let offset = 0;

const createLayers = () => [
  new GeoJsonLayer({
    id: 'line-connect',
    data: lineConnect,
    getLineColor: [200, 0, 128],
    lineWidthMinPixels: 10,
    getSingleOffset: () => offset,
    extensions: [new PathStyleExtension({singleOffset: true})]
  }),
  new GeoJsonLayer({
    id: 'line2',
    data: line2,
    getLineColor: [128, 0, 200],
    lineWidthMinPixels: 10
  })
];

const deckOverlay = new DeckOverlay({
  interleaved: true,
  layers: createLayers()
});

map.addControl(deckOverlay);
map.addControl(new maplibregl.NavigationControl());

// add offset input control slider
if (typeof document !== 'undefined') {
  const offsetInput = document.createElement('input');
  offsetInput.type = 'range';
  offsetInput.min = -10;
  offsetInput.max = 10;
  offsetInput.value = offset;
  offsetInput.style.position = 'absolute';
  offsetInput.style.top = '20px';
  offsetInput.style.left = '20px';
  offsetInput.style.zIndex = '1';

  document.body.appendChild(offsetInput);

  offsetInput.addEventListener('input', e => {
    offset = Number(e.target.value);
    deckOverlay.setProps({
      layers: createLayers()
    });
  });
}
