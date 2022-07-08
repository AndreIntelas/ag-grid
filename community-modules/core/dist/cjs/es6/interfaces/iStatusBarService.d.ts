// Type definitions for @ag-grid-community/core v28.0.2
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IStatusPanelComp } from "./iStatusPanel";
export interface IStatusBarService {
    registerStatusPanel(key: string, component: IStatusPanelComp): void;
    getStatusPanel(key: string): IStatusPanelComp;
}
