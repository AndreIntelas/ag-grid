import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {field: 'athlete', minWidth: 200},
        {field: 'age'},
        {field: 'country', minWidth: 200},
        {field: 'year'},
        {field: 'date', minWidth: 180},
        {field: 'sport', minWidth: 200},
        {field: 'gold'},
        {field: 'silver'},
        {field: 'bronze'},
        {field: 'total'},
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
    },
}

function onBtShowLoading() {
    gridApi!.showLoadingOverlay()
}

function onBtShowNoRows() {
    gridApi!.showNoRowsOverlay()
}

function onBtHide() {
    gridApi!.hideOverlay()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    gridApi = createGrid(gridDiv, gridOptions);
})