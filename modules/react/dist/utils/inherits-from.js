// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// Check if one JavaScript class inherits from another
export function inheritsFrom(Type, ParentType) {
    while (Type) {
        if (Type === ParentType) {
            return true;
        }
        Type = Object.getPrototypeOf(Type);
    }
    return false;
}
//# sourceMappingURL=inherits-from.js.map