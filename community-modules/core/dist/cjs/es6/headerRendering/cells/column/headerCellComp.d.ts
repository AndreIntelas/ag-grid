// Type definitions for @ag-grid-community/core v28.0.2
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../../../entities/column";
import { AbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellComp";
import { HeaderCellCtrl } from "./headerCellCtrl";
export declare class HeaderCellComp extends AbstractHeaderCellComp<HeaderCellCtrl> {
    private static TEMPLATE;
    private eResize;
    private eHeaderCompWrapper;
    protected readonly column: Column;
    protected readonly pinned: string | null;
    private headerComp;
    private headerCompGui;
    private headerCompVersion;
    constructor(ctrl: HeaderCellCtrl);
    private postConstruct;
    private destroyHeaderComp;
    private setUserCompDetails;
    private afterCompCreated;
}
