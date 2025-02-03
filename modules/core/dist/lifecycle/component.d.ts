import { COMPONENT_SYMBOL, PROP_TYPES_SYMBOL, ASYNC_ORIGINAL_SYMBOL, ASYNC_RESOLVED_SYMBOL, ASYNC_DEFAULTS_SYMBOL } from "./constants.js";
import { PropType } from "./prop-types.js";
export type StatefulComponentProps<PropsT extends {}> = PropsT & {
    id: string;
    [COMPONENT_SYMBOL]: Component<PropsT>;
    [PROP_TYPES_SYMBOL]: Record<string, PropType>;
    [ASYNC_DEFAULTS_SYMBOL]: Partial<PropsT>;
    [ASYNC_ORIGINAL_SYMBOL]: Partial<PropsT>;
    [ASYNC_RESOLVED_SYMBOL]: Partial<PropsT>;
};
export default class Component<PropsT extends {} = {}> {
    static componentName: string;
    static defaultProps: Readonly<{}>;
    id: string;
    props: StatefulComponentProps<PropsT>;
    count: number;
    constructor(...propObjects: Partial<PropsT>[]);
    clone(newProps: Partial<PropsT>): any;
}
//# sourceMappingURL=component.d.ts.map