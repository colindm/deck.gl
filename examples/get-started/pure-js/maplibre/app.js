// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {MapboxOverlay as DeckOverlay} from '@deck.gl/mapbox';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: [4.45, 51.47],
  zoom: 5.5,
  bearing: 0,
  // pitch: 30,
  antialias: true
});

// basic feature collection with line from london to zurcich
const line = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [1.46, 52.46],
          [9.54, 48.37]
        ]
      }
    }
  ]
};

const lineConnect = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [9.54, 48.37],
          [11, 47.6]
        ]
      }
    }
  ]
};
const lineConnect2 = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [11, 47.6],
          [12, 47.0]
        ]
      }
    }
  ]
};
const lineConnect3 = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [12, 47.0],
          [13, 45.4]
        ]
      }
    }
  ]
};

const line2 = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [9.64, 48.67],
          [1.66, 52.66]
        ]
      }
    }
  ]
};

const deckOverlay = new DeckOverlay({
  interleaved: true,
  layers: [
    new GeoJsonLayer({
      id: 'line',
      data: line,
      getLineColor: [200, 0, 128],
      lineWidthMinPixels: 2
    }),
    new GeoJsonLayer({
      id: 'line-connect',
      data: lineConnect,
      getLineColor: [200, 0, 128],
      lineWidthMinPixels: 2,
      getMultiOffset: f => [0, 3],
      extensions: [new PathStyleExtension({multiOffset: true})]
    }),
    new GeoJsonLayer({
      id: 'line-connect2',
      data: lineConnect2,
      getLineColor: [200, 0, 128],
      lineWidthMinPixels: 2,
      getSingleOffset: f => -3,
      extensions: [new PathStyleExtension({singleOffset: true})]
    }),
    new GeoJsonLayer({
      id: 'line-connect3',
      data: lineConnect3,
      getLineColor: [200, 0, 128],
      lineWidthMinPixels: 2,
      getSingleOffset: f => -3,
      extensions: [new PathStyleExtension({singleOffset: true})]
    }),
    // new GeoJsonLayer({
    //   id: 'line-parallel',
    //   data: line,
    //   getLineColor: [128, 0, 200],
    //   getLineWidth: 10,
    //   lineWidthMinPixels: 10,
    //   getOffset: f => [1, -1],
    //   extensions: [new PathStyleExtension({offset: true})]
    // }),

    // new GeoJsonLayer({
    //   id: 'line3',
    //   data: line,
    //   getLineColor: [128, 0, 200],
    //   getLineWidth: 7,
    //   lineWidthMinPixels: 5,
    //   getOffset: (f) => [2,2],
    //   extensions: [new PathStyleExtension({ offset: true })],
    // }),

    new GeoJsonLayer({
      id: 'line2',
      data: line2,
      getLineColor: [128, 0, 200],
      // getLineWidth: 8,
      lineWidthMinPixels: 10
      // getOffset: (f) => [0,0],
      // extensions: [new PathStyleExtension({ offset: true })],
    })
  ]
});

map.addControl(deckOverlay);
map.addControl(new maplibregl.NavigationControl());
