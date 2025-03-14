import {createGrid, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent} from '@ag-grid-community/core';
import {getData} from './data';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule, MenuModule, RowGroupingModule]);


let gridApi: GridApi;

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', chartDataType: 'category', width: 150 },
    { field: 'gold', chartDataType: 'series' },
    { field: 'silver', chartDataType: 'series' },
    { field: 'bronze', chartDataType: 'series' },
  ],
  defaultColDef: { flex: 1 },
  enableRangeSelection: true,
  popupParent: document.body,
  enableCharts: true,
  chartToolPanelsDef: {
    defaultToolPanel: 'data',
    dataPanel: {
      groups: [
        { type: 'seriesChartType', isOpen: true },
        { type: 'series', isOpen: false },
      ],
    },
  },
  onGridReady : (params: GridReadyEvent) => {
    getData().then(rowData => params.api.setGridOption('rowData', rowData));
  },
  onFirstDataRendered,
};



function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api.createRangeChart({
    cellRange: {
      rowStartIndex: 0,
      rowEndIndex: 4,
      columns: ['country', 'gold', 'silver', 'bronze'],
    },
    chartType: 'groupedColumn',
  });
}

document.addEventListener('DOMContentLoaded', () => {
  gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});