// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { readPackedTypedArray } from "./fast-pbf.js";
class KeyValueObjectReader {
    static read(pbf, end) {
        return pbf.readFields(KeyValueObjectReader._readField, { key: '', value: null }, end);
    }
    static _readField(tag, obj, pbf) {
        if (tag === 1)
            obj.key = pbf.readString();
        else if (tag === 2)
            obj.value = pbf.readString();
    }
}
// Properties ========================================
export class PropertiesReader {
    static read(pbf, end) {
        return pbf.readFields(PropertiesReader._readField, {}, end);
    }
    static _readField(tag, obj, pbf) {
        if (tag === 1) {
            const { key, value } = KeyValueObjectReader.read(pbf, pbf.readVarint() + pbf.pos);
            obj[key] = value;
        }
    }
}
class DoublesReader {
    static read(pbf, end) {
        const { value, size } = pbf.readFields(DoublesReader._readField, { value: [], size: 0 }, end);
        return { value, size };
    }
    static _readField(tag, obj, pbf) {
        if (tag === 1)
            readPackedTypedArray(Float64Array, pbf, obj);
        else if (tag === 2)
            obj.size = pbf.readVarint(true);
    }
}
class IntsReader {
    static read(pbf, end) {
        const { value, size } = pbf.readFields(IntsReader._readField, { value: [], size: 0 }, end);
        return { value: new Uint32Array(value), size };
    }
    static _readField(tag, obj, pbf) {
        if (tag === 1)
            pbf.readPackedVarint(obj.value);
        else if (tag === 2)
            obj.size = pbf.readVarint(true);
    }
}
class FieldsReader {
    static read(pbf, end) {
        return pbf.readFields(FieldsReader._readField, { id: 0 }, end);
    }
    static _readField(tag, obj, pbf) {
        if (tag === 1)
            obj.id = pbf.readVarint();
    }
}
class NumericPropReader {
    static read(pbf, end) {
        return pbf.readFields(NumericPropReader._readField, { value: [] }, end);
    }
    static _readField(tag, obj, pbf) {
        if (tag === 1)
            readPackedTypedArray(Float64Array, pbf, obj);
    }
}
export class NumericPropKeyValueReader {
    static read(pbf, end) {
        return pbf.readFields(NumericPropKeyValueReader._readField, { key: '', value: null }, end);
    }
    static _readField(tag, obj, pbf) {
        if (tag === 1)
            obj.key = pbf.readString();
        else if (tag === 2)
            obj.value = NumericPropReader.read(pbf, pbf.readVarint() + pbf.pos);
    }
}
class PointsReader {
    static read(pbf, end) {
        return pbf.readFields(PointsReader._readField, {
            positions: null,
            globalFeatureIds: null,
            featureIds: null,
            properties: [],
            numericProps: {},
            fields: []
        }, end);
    }
    static _readField(tag, obj, pbf) {
        if (tag === 1)
            obj.positions = DoublesReader.read(pbf, pbf.readVarint() + pbf.pos);
        else if (tag === 2)
            obj.globalFeatureIds = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
        else if (tag === 3)
            obj.featureIds = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
        else if (tag === 4)
            obj.properties.push(PropertiesReader.read(pbf, pbf.readVarint() + pbf.pos));
        else if (tag === 5) {
            const entry = NumericPropKeyValueReader.read(pbf, pbf.readVarint() + pbf.pos);
            obj.numericProps[entry.key] = entry.value;
        }
        else if (tag === 6)
            obj.fields.push(FieldsReader.read(pbf, pbf.readVarint() + pbf.pos));
    }
}
// Lines ========================================
class LinesReader {
    static read(pbf, end) {
        return pbf.readFields(LinesReader._readField, {
            positions: null,
            pathIndices: null,
            globalFeatureIds: null,
            featureIds: null,
            properties: [],
            numericProps: {},
            fields: []
        }, end);
    }
    static _readField(tag, obj, pbf) {
        if (tag === 1)
            obj.positions = DoublesReader.read(pbf, pbf.readVarint() + pbf.pos);
        else if (tag === 2)
            obj.pathIndices = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
        else if (tag === 3)
            obj.globalFeatureIds = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
        else if (tag === 4)
            obj.featureIds = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
        else if (tag === 5)
            obj.properties.push(PropertiesReader.read(pbf, pbf.readVarint() + pbf.pos));
        else if (tag === 6) {
            const entry = NumericPropKeyValueReader.read(pbf, pbf.readVarint() + pbf.pos);
            obj.numericProps[entry.key] = entry.value;
        }
        else if (tag === 7)
            obj.fields.push(FieldsReader.read(pbf, pbf.readVarint() + pbf.pos));
    }
}
class PolygonsReader {
    static read(pbf, end) {
        return pbf.readFields(PolygonsReader._readField, {
            positions: null,
            polygonIndices: null,
            globalFeatureIds: null,
            featureIds: null,
            primitivePolygonIndices: null,
            triangles: null,
            properties: [],
            numericProps: {},
            fields: []
        }, end);
    }
    static _readField(tag, obj, pbf) {
        if (tag === 1)
            obj.positions = DoublesReader.read(pbf, pbf.readVarint() + pbf.pos);
        else if (tag === 2)
            obj.polygonIndices = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
        else if (tag === 3)
            obj.globalFeatureIds = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
        else if (tag === 4)
            obj.featureIds = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
        else if (tag === 5)
            obj.primitivePolygonIndices = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
        else if (tag === 6)
            obj.triangles = IntsReader.read(pbf, pbf.readVarint() + pbf.pos);
        else if (tag === 7)
            obj.properties.push(PropertiesReader.read(pbf, pbf.readVarint() + pbf.pos));
        else if (tag === 8) {
            const entry = NumericPropKeyValueReader.read(pbf, pbf.readVarint() + pbf.pos);
            obj.numericProps[entry.key] = entry.value;
        }
        else if (tag === 9)
            obj.fields.push(FieldsReader.read(pbf, pbf.readVarint() + pbf.pos));
    }
}
export class TileReader {
    static read(pbf, end) {
        return pbf.readFields(TileReader._readField, { points: null, lines: null, polygons: null }, end);
    }
    static _readField(tag, obj, pbf) {
        if (tag === 1)
            obj.points = PointsReader.read(pbf, pbf.readVarint() + pbf.pos);
        else if (tag === 2)
            obj.lines = LinesReader.read(pbf, pbf.readVarint() + pbf.pos);
        else if (tag === 3)
            obj.polygons = PolygonsReader.read(pbf, pbf.readVarint() + pbf.pos);
    }
}
//# sourceMappingURL=carto-tile.js.map