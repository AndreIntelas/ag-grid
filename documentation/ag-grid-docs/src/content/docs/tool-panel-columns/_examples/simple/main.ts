import { GridApi, createGrid, ColDef, ColGroupDef, GridOptions } from '@ag-grid-community/core';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnsToolPanelModule, MenuModule, RowGroupingModule, SetFilterModule]);

const columnDefs: (ColDef | ColGroupDef)[] = [
  {
    headerName: 'Athlete',
    children: [
      { field: 'athlete', filter: 'agTextColumnFilter', enableRowGroup: true, enablePivot: true, minWidth: 150 },
      { field: 'age', enableRowGroup: true, enablePivot: true, },
      { field: 'country', enableRowGroup: true, enablePivot: true, minWidth: 125 },
    ],
  },
  {
    headerName: 'Competition',
    children: [{ field: 'year', enableRowGroup: true, enablePivot: true, }, { field: 'date', enableRowGroup: true, enablePivot: true, minWidth: 180 }],
  },
  { field: 'sport', enableRowGroup: true, enablePivot: true, minWidth: 125 },
  {
    headerName: 'Medals',
    children: [
      { field: 'gold', enableValue: true, },
      { field: 'silver', enableValue: true, },
      { field: 'bronze', enableValue: true, },
      { field: 'total', enableValue: true, },
    ],
  },
]

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    filter: true,
  },
  autoGroupColumnDef: {
    minWidth: 200,
  },
  sideBar: 'columns',
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data))
})