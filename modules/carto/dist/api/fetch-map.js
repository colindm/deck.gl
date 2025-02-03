// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { DEFAULT_API_BASE_URL, CartoAPIError, buildPublicMapUrl, buildStatsUrl, h3QuerySource, h3TableSource, quadbinQuerySource, quadbinTableSource, vectorQuerySource, vectorTableSource, vectorTilesetSource, requestWithParameters } from '@carto/api-client';
import { parseMap } from "./parse-map.js";
import { assert } from "../utils.js";
import { fetchBasemapProps } from "./basemap.js";
/* global clearInterval, setInterval, URL */
/* eslint-disable complexity, max-statements, max-params */
async function _fetchMapDataset(dataset, context) {
    const { aggregationExp, aggregationResLevel, connectionName, columns, format, geoColumn, source, type, queryParameters } = dataset;
    const cache = {};
    const globalOptions = {
        ...context,
        cache,
        connectionName,
        format
    };
    if (type === 'tileset') {
        // TODO do we want a generic tilesetSource?
        // @ts-ignore
        dataset.data = await vectorTilesetSource({ ...globalOptions, tableName: source });
    }
    else {
        const [spatialDataType, spatialDataColumn] = geoColumn ? geoColumn.split(':') : ['geom'];
        if (spatialDataType === 'geom') {
            const options = { ...globalOptions, spatialDataColumn };
            if (type === 'table') {
                dataset.data = await vectorTableSource({ ...options, columns, tableName: source });
            }
            else if (type === 'query') {
                dataset.data = await vectorQuerySource({
                    ...options,
                    columns,
                    sqlQuery: source,
                    queryParameters
                });
            }
        }
        else if (spatialDataType === 'h3') {
            const options = { ...globalOptions, aggregationExp, aggregationResLevel, spatialDataColumn };
            if (type === 'table') {
                dataset.data = await h3TableSource({ ...options, tableName: source });
            }
            else if (type === 'query') {
                dataset.data = await h3QuerySource({ ...options, sqlQuery: source, queryParameters });
            }
        }
        else if (spatialDataType === 'quadbin') {
            const options = { ...globalOptions, aggregationExp, aggregationResLevel, spatialDataColumn };
            if (type === 'table') {
                dataset.data = await quadbinTableSource({ ...options, tableName: source });
            }
            else if (type === 'query') {
                dataset.data = await quadbinQuerySource({ ...options, sqlQuery: source, queryParameters });
            }
        }
    }
    let cacheChanged = true;
    if (cache.value) {
        cacheChanged = dataset.cache !== cache.value;
        dataset.cache = cache.value;
    }
    return cacheChanged;
}
async function _fetchTilestats(attribute, dataset, context) {
    const { connectionName, data, id, source, type, queryParameters } = dataset;
    const { apiBaseUrl } = context;
    const errorContext = {
        requestType: 'Tile stats',
        connection: connectionName,
        type,
        source
    };
    if (!('tilestats' in data)) {
        throw new CartoAPIError(new Error(`Invalid dataset for tilestats: ${id}`), errorContext);
    }
    const baseUrl = buildStatsUrl({ attribute, apiBaseUrl, ...dataset });
    const client = new URLSearchParams(data.tiles[0]).get('client');
    const headers = { Authorization: `Bearer ${context.accessToken}` };
    const parameters = {};
    if (client) {
        parameters.client = client;
    }
    if (type === 'query') {
        parameters.q = source;
        if (queryParameters) {
            parameters.queryParameters = JSON.stringify(queryParameters);
        }
    }
    const stats = await requestWithParameters({
        baseUrl,
        headers,
        parameters,
        errorContext,
        maxLengthURL: context.maxLengthURL
    });
    // Replace tilestats for attribute with value from API
    const { attributes } = data.tilestats.layers[0];
    const index = attributes.findIndex(d => d.attribute === attribute);
    attributes[index] = stats;
    return true;
}
async function fillInMapDatasets({ datasets }, context) {
    const promises = datasets.map(dataset => _fetchMapDataset(dataset, context));
    return await Promise.all(promises);
}
async function fillInTileStats({ datasets, keplerMapConfig }, context) {
    const attributes = [];
    const { layers } = keplerMapConfig.config.visState;
    for (const layer of layers) {
        for (const channel of Object.keys(layer.visualChannels)) {
            const attribute = layer.visualChannels[channel]?.name;
            if (attribute) {
                const dataset = datasets.find(d => d.id === layer.config.dataId);
                if (dataset && dataset.type !== 'tileset' && dataset.data.tilestats) {
                    // Only fetch stats for QUERY & TABLE map types
                    attributes.push({ attribute, dataset });
                }
            }
        }
    }
    // Remove duplicates to avoid repeated requests
    const filteredAttributes = [];
    for (const a of attributes) {
        if (!filteredAttributes.find(({ attribute, dataset }) => attribute === a.attribute && dataset === a.dataset)) {
            filteredAttributes.push(a);
        }
    }
    const promises = filteredAttributes.map(({ attribute, dataset }) => _fetchTilestats(attribute, dataset, context));
    return await Promise.all(promises);
}
/* eslint-disable max-statements */
export async function fetchMap({ accessToken, apiBaseUrl = DEFAULT_API_BASE_URL, cartoMapId, clientId, headers, autoRefresh, onNewData, maxLengthURL }) {
    assert(cartoMapId, 'Must define CARTO map id: fetchMap({cartoMapId: "XXXX-XXXX-XXXX"})');
    if (accessToken) {
        headers = { Authorization: `Bearer ${accessToken}`, ...headers };
    }
    if (autoRefresh || onNewData) {
        assert(onNewData, 'Must define `onNewData` when using autoRefresh');
        assert(typeof onNewData === 'function', '`onNewData` must be a function');
        assert(typeof autoRefresh === 'number' && autoRefresh > 0, '`autoRefresh` must be a positive number');
    }
    const baseUrl = buildPublicMapUrl({ apiBaseUrl, cartoMapId });
    const errorContext = { requestType: 'Public map', mapId: cartoMapId };
    const map = await requestWithParameters({ baseUrl, headers, errorContext, maxLengthURL });
    const context = {
        accessToken: map.token || accessToken,
        apiBaseUrl,
        clientId,
        headers,
        maxLengthURL
    };
    // Periodically check if the data has changed. Note that this
    // will not update when a map is published.
    let stopAutoRefresh;
    if (autoRefresh) {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        const intervalId = setInterval(async () => {
            const changed = await fillInMapDatasets(map, {
                ...context,
                headers: {
                    ...headers,
                    'If-Modified-Since': new Date().toUTCString()
                }
            });
            if (onNewData && changed.some(v => v === true)) {
                onNewData(parseMap(map));
            }
        }, autoRefresh * 1000);
        stopAutoRefresh = () => {
            clearInterval(intervalId);
        };
    }
    const geojsonLayers = map.keplerMapConfig.config.visState.layers.filter(({ type }) => type === 'geojson' || type === 'point');
    const geojsonDatasetIds = geojsonLayers.map(({ config }) => config.dataId);
    map.datasets.forEach(dataset => {
        if (geojsonDatasetIds.includes(dataset.id)) {
            const { config } = geojsonLayers.find(({ config }) => config.dataId === dataset.id);
            dataset.format = 'geojson';
            // Support for very old maps. geoColumn was not stored in the past
            if (!dataset.geoColumn && config.columns.geojson) {
                dataset.geoColumn = config.columns.geojson;
            }
        }
    });
    const [basemap] = await Promise.all([
        fetchBasemapProps({ config: map.keplerMapConfig.config, errorContext }),
        // Mutates map.datasets so that dataset.data contains data
        fillInMapDatasets(map, context)
    ]);
    // Mutates attributes in visualChannels to contain tile stats
    await fillInTileStats(map, context);
    const out = { ...parseMap(map), basemap, ...{ stopAutoRefresh } };
    const textLayers = out.layers.filter(layer => {
        const pointType = layer.props.pointType || '';
        return pointType.includes('text');
    });
    /* global FontFace, window, document */
    if (textLayers.length && window.FontFace && !document.fonts.check('12px Inter')) {
        // Fetch font needed for labels
        const font = new FontFace('Inter', 'url(https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2)');
        await font.load().then(f => document.fonts.add(f));
    }
    return out;
}
//# sourceMappingURL=fetch-map.js.map