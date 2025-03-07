import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';
import { getData } from "./data";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnsToolPanelModule, MenuModule, RowGroupingModule, SetFilterModule]);


let gridApi: GridApi;

const gridOptions: GridOptions = {
  columnDefs: [
    {
      field: 'year',
      rowGroup: true,
      sortable: true,
      sort: 'desc',
    },
    {
      field: 'handset',
      rowGroup: true,
      sortable: true,
      sort: 'asc',
    },
    { field: 'salesRep' },
    { field: 'month' },
    { field: 'sale' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    filter: true,
    sortable: false,
  },
  autoGroupColumnDef: {
    minWidth: 300,
    sortable: true,
  },
  groupDefaultExpanded: 1,
  rowData: getData(),
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})