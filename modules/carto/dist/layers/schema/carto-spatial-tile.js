// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { readPackedTypedArray } from "./fast-pbf.js";
import { NumericPropKeyValueReader, PropertiesReader } from "./carto-tile.js";
// Indices =====================================
export class IndicesReader {
    static read(pbf, end) {
        return pbf.readFields(IndicesReader._readField, { value: [] }, end);
    }
    static _readField(tag, obj, pbf) {
        if (tag === 1)
            readPackedTypedArray(BigUint64Array, pbf, obj);
    }
}
class CellsReader {
    static read(pbf, end) {
        return pbf.readFields(CellsReader._readField, { indices: null, properties: [], numericProps: {} }, end);
    }
    static _readField(tag, obj, pbf) {
        if (tag === 1)
            obj.indices = IndicesReader.read(pbf, pbf.readVarint() + pbf.pos);
        else if (tag === 2)
            obj.properties.push(PropertiesReader.read(pbf, pbf.readVarint() + pbf.pos));
        else if (tag === 3) {
            const entry = NumericPropKeyValueReader.read(pbf, pbf.readVarint() + pbf.pos);
            obj.numericProps[entry.key] = entry.value;
        }
    }
}
export class TileReader {
    static read(pbf, end) {
        return pbf.readFields(TileReader._readField, { scheme: 0, cells: null }, end);
    }
    static _readField(tag, obj, pbf) {
        if (tag === 1)
            obj.scheme = pbf.readVarint();
        else if (tag === 2)
            obj.cells = CellsReader.read(pbf, pbf.readVarint() + pbf.pos);
    }
}
//# sourceMappingURL=carto-spatial-tile.js.map