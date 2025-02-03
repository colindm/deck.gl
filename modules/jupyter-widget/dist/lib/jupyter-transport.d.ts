/**
 * A Transport subclass for communicating with Jupyter kernels
 * via the Jupyter Widget API.
 */
export default class JupyterTransport extends Transport {
    constructor();
    jupyterModel: any;
    jupyterView: any;
    getRootDOMElement(): any;
    /**
     * back-channel messaging for event handling etc
     */
    sendJSONMessage(type: any, data: any): void;
}
import { Transport } from '@deck.gl/json';
//# sourceMappingURL=jupyter-transport.d.ts.map