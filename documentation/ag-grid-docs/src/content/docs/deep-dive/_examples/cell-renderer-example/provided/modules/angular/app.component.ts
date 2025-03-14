import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { ModuleRegistry, GridReadyEvent, ColDef, ValueFormatterParams, ICellRendererParams} from '@ag-grid-community/core';
import { AgGridAngular, ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
ModuleRegistry.registerModules([ ClientSideRowModelModule ]);

// Row Data Interface
interface IRow {
  mission: string;
  company: string;
  location: string;
  date: string;
  time: string;
  rocket: string;
  price: number;
  successful: boolean;
}

// Custom Cell Renderer Component
@Component({
  selector: 'app-company-logo-renderer',
  standalone: true,
  template: `
  <span >
    @if (value) {
      <img [alt]="value" [src]="'https://www.ag-grid.com/example-assets/space-company-logos/' + value.toLowerCase() + '.png'" />
      <p>{{ value }}</p>
    }
  </span>
  `,
  styles: ["img {display: block; width: 25px; height: auto; max-height: 50%; margin-right: 12px; filter: brightness(1.2);} span {display: flex; height: 100%; width: 100%; align-items: center} p { text-overflow: ellipsis; overflow: hidden; white-space: nowrap }"]
})
export class CompanyLogoRenderer implements ICellRendererAngularComp {
  // Init Cell Value
  public value!: string;
  agInit(params: ICellRendererParams): void {
    this.value = params.value;
  }

  // Return Cell Value
  refresh(params: ICellRendererParams): boolean {
    this.value = params.value;
    return true;
  }
}

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [AgGridAngular, HttpClientModule],
  template: `
  <div class="content">
    <!-- The AG Grid component, with Dimensions, CSS Theme, Row Data, and Column Definition -->
    <ag-grid-angular
      style="width: 100%; height: 550px;"
      [class]="themeClass"
      [rowData]="rowData"
      [columnDefs]="colDefs"
      [defaultColDef]="defaultColDef" 
      (gridReady)="onGridReady($event)"
      [pagination]="true"
    />
  </div>
  `
})
export class AppComponent {
  themeClass = /** DARK MODE START **/document.documentElement?.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/;

  // Row Data: The data to be displayed.
  rowData: IRow[] = [];

  // Column Definitions: Defines & controls grid columns.
  colDefs: ColDef[] = [
    { 
      field: "mission", 
      filter: true 
    },
    { 
      field: "company",
      cellRenderer: CompanyLogoRenderer 
    },
    { 
      field: "location"
    },
    { field: "date" },
    { 
      field: "price",
      valueFormatter: (params: ValueFormatterParams) => { return '£' + params.value.toLocaleString(); } 
    },
    { field: "successful" },
    { field: "rocket" }
  ];

  // Default Column Definitions: Apply configuration across all columns
  defaultColDef: ColDef = {
    filter: true
  }

  // Load data into grid when ready
  constructor(private http: HttpClient) {}
  onGridReady(params: GridReadyEvent) {
    this.http
      .get<any[]>('https://www.ag-grid.com/example-assets/space-mission-data.json')
      .subscribe(data => this.rowData = data);
  }
}
