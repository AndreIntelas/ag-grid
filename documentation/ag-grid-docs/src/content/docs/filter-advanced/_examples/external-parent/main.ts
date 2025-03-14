import { GridApi, createGrid, GridOptions, GridReadyEvent } from '@ag-grid-community/core';

import { AdvancedFilterModule } from '@ag-grid-enterprise/advanced-filter';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.registerModules([AdvancedFilterModule, ClientSideRowModelModule, MenuModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'athlete' },
    { field: 'country' },
    { field: 'sport' },
    { field: 'age', minWidth: 100 },
    { field: 'gold', minWidth: 100 },
    { field: 'silver', minWidth: 100 },
    { field: 'bronze', minWidth: 100 },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 180,
    filter: true,
  },
  enableAdvancedFilter: true,
  popupParent: document.body,
  onGridReady: (params: GridReadyEvent) => {
    // could also be provided via grid option `advancedFilterParent`
    params.api.setGridOption('advancedFilterParent', document.getElementById('advancedFilterParent'));
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data))
})