// @ag-grid-community/react v31.1.0
import { CustomComponentWrapper } from "./customComponentWrapper.mjs";
export class NoRowsOverlayComponentWrapper extends CustomComponentWrapper {
    refresh(params) {
        this.sourceParams = params;
        this.refreshProps();
    }
}
