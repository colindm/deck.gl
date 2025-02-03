export default widgetPlugin;
declare namespace widgetPlugin {
    export { EXTENSION_ID as id };
    export let requires: import("@lumino/coreutils").Token<IJupyterWidgetRegistry>[];
    export { activateWidgetExtension as activate };
    export let autoStart: boolean;
}
declare const EXTENSION_ID: "@deck.gl/jupyter-widget:plugin";
import { IJupyterWidgetRegistry } from '@jupyter-widgets/base';
declare function activateWidgetExtension(app: any, registry: any): void;
//# sourceMappingURL=plugin.d.ts.map