import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';
import { getData } from "./data";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

import { MyInnerRenderer } from "./myInnerRenderer_typescript";


let gridApi: GridApi;


const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
        { field: 'bronze', aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    autoGroupColumnDef: {
        minWidth: 300,
        cellRendererParams: {
            innerRenderer: MyInnerRenderer
        }
    },
    groupTotalRow: 'bottom',
    grandTotalRow: 'bottom',
    rowData: getData(),
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
})