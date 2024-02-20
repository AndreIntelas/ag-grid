// Type definitions for @ag-grid-community/core v31.1.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare function iterateObject<T>(object: {
    [p: string]: T;
} | T[] | null | undefined, callback: (key: string, value: T) => void): void;
export declare function cloneObject<T extends {}>(object: T): T;
export declare function deepCloneDefinition<T>(object: T, keysToSkip?: string[]): T | undefined;
export declare function getAllValuesInObject<T extends Object>(obj: T): any[];
export declare function mergeDeep(dest: any, source: any, copyUndefined?: boolean, makeCopyOfSimpleObjects?: boolean): void;
export declare function getValueUsingField(data: any, field: string, fieldContainsDots: boolean): any;
export declare function removeAllReferences<T>(obj: any, preserveKeys: (keyof T)[] | undefined, preDestroyLink: string): void;
export declare function isNonNullObject(value: any): boolean;
