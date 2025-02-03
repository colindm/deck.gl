export declare class BandReader {
    static read(pbf: any, end?: number): any;
    static _readField(this: void, tag: any, obj: any, pbf: any): void;
}
export declare class TileReader {
    static compression: null | 'gzip';
    static read(pbf: any, end: any): any;
    static _readField(this: void, tag: any, obj: any, pbf: any): void;
}
//# sourceMappingURL=carto-raster-tile.d.ts.map