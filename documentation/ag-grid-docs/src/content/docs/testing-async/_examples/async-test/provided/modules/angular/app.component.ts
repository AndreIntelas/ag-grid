
import { ColDef, ModelUpdatedEvent } from '@ag-grid-community/core';
import { FormsModule } from '@angular/forms';
import '@ag-grid-community/styles/ag-grid.css';
import './styles.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { Component, OnInit, ViewChild } from '@angular/core';
import { AgGridAngular } from '@ag-grid-community/angular';
import { getData } from './data';

import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
ModuleRegistry.registerModules([ClientSideRowModelModule]);

@Component({
    standalone: true,
    imports: [AgGridAngular, FormsModule],
    selector: 'my-app',
    template: `<div class="example-wrapper">
    <div class="example-header">
      <input type="text" id="quickFilter" placeholder="Filter..." [(ngModel)]="quickFilterText">
      <div id="numberOfRows">Number of rows: {{displayedRows}}</div>
    </div>
    <ag-grid-angular style="width: 100%; height: 100%;" [class]="themeClass" [columnDefs]="columnDefs"
      [rowData]="rowData" [quickFilterText]="quickFilterText" (modelUpdated)="onModelUpdated($event)" />
  </div>`
})

export class AppComponent implements OnInit {
    public themeClass = /** DARK MODE START **/document.documentElement?.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/;
    public displayedRows: number = 10;
    public quickFilterText: string = '';

    public columnDefs: ColDef[] = [
        { field: 'name' },
        { headerName: 'Age', field: 'person.age' },
        { headerName: 'Country', field: "person.country" },
    ];
    public rowData: any[] | null = null;

    @ViewChild('myGrid') grid!: AgGridAngular;

    ngOnInit(): void {
        this.rowData = getData();
    }

    onModelUpdated(params: ModelUpdatedEvent) {
        this.displayedRows = params.api.getDisplayedRowCount();
    }
}
