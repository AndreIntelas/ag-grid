import { Component, ViewChild } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { AgGridAngular } from '@ag-grid-community/angular';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import './styles.css';
import { ModuleRegistry, ColDef, GetRowIdParams, GridApi, GridReadyEvent, ICellRendererParams } from '@ag-grid-community/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

ModuleRegistry.registerModules([ClientSideRowModelModule]);
@Component({
    standalone: true,
    template: `
        <i class="far fa-trash-alt" style="cursor: pointer" (click)="applyTransaction()"></i>`
})
export class SportRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams;
    private value!: string;

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    applyTransaction() {
        this.params.api.applyTransaction({ remove: [this.params.node.data] });
    }

    refresh() {
        return false
    }
}

@Component({
    standalone: true,
    imports: [AgGridAngular, HttpClientModule],
    selector: 'my-app',
    template: /*html */ `
        <div class="top-container">
            <div class="example-toolbar panel panel-default">
                <div class="panel-body">
                    <input type="radio" id="move" name="radio" checked #eMoveRadio>
                    <label for="move">Remove Source Rows</label>
                    <input type="radio" id="deselect" name="radio" #eDeselectRadio>
                    <label for="deselect">Only Deselect Source Rows</label>
                    <input type="radio" id="none" name="radio">
                    <label for="none">None</label>
                    <input type="checkbox" id="toggleCheck" checked #eSelectCheckbox (change)="checkboxSelectChange()">
                    <label for="toggleCheck">Checkbox Select</label>
                    <span class="input-group-button">
                        <button type="button" class="btn btn-default reset" style="margin-left: 5px;" (click)="reset()">
                            <i class="fas fa-redo" style="margin-right: 5px;"></i>Reset
                        </button>
                    </span>
                </div>
            </div>
            <div class="grid-wrapper">
                <div class="panel panel-primary" style="margin-right: 10px;">
                    <div class="panel-heading">Athletes</div>
                    <div class="panel-body">
                        <div id="eLeftGrid">
                            <ag-grid-angular
                                    style="height: 100%;"
                                    [class]="themeClass"
                                    [defaultColDef]="defaultColDef"
                                    rowSelection="multiple"
                                    [rowDragMultiRow]="true"
                                    [suppressRowClickSelection]="true"
                                    [getRowId]="getRowId"
                                    [rowDragManaged]="true"
                                    [suppressMoveWhenRowDragging]="true"
                                    [rowData]="leftRowData"
                                    [columnDefs]="leftColumns"
                                    (gridReady)="onGridReady($event, 0)" />
                        </div>
                    </div>
                </div>
                <div class="panel panel-primary" style="margin-left: 10px;">
                    <div class="panel-heading">Selected Athletes</div>
                    <div class="panel-body">
                        <div id="eRightGrid">
                            <ag-grid-angular
                                    style="height: 100%;"
                                    [class]="themeClass"
                                    [defaultColDef]="defaultColDef"
                                    [getRowId]="getRowId"
                                    [rowDragManaged]="true"
                                    [rowData]="rightRowData"
                                    [columnDefs]="rightColumns"
                                    (gridReady)="onGridReady($event, 1)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>`
})
export class AppComponent {
    themeClass = /** DARK MODE START **/document.documentElement?.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/;
    rawData: any[] = [];
    leftRowData: any[] = [];
    rightRowData: any[] = []
    leftApi!: GridApi;
    rightApi!: GridApi;

    defaultColDef: ColDef = {
        flex: 1,
        minWidth: 100,
        filter: true,
    };

    leftColumns: ColDef[] = [
        {
            rowDrag: true,
            maxWidth: 50,
            suppressHeaderMenuButton: true,
            rowDragText: (params, dragItemCount) => {
                if (dragItemCount > 1) {
                    return dragItemCount + ' athletes';
                }
                return params.rowNode!.data.athlete;
            },
        },
        {
            colId: 'checkbox',
            maxWidth: 50,
            checkboxSelection: true,
            suppressHeaderMenuButton: true,
            headerCheckboxSelection: true
        },
        { field: "athlete" },
        { field: "sport" }
    ];

    rightColumns: ColDef[] = [
        {
            rowDrag: true,
            maxWidth: 50,
            suppressHeaderMenuButton: true,
            rowDragText: (params, dragItemCount) => {
                if (dragItemCount > 1) {
                    return dragItemCount + ' athletes';
                }
                return params.rowNode!.data.athlete;
            },
        },
        { field: "athlete" },
        { field: "sport" },
        {
            suppressHeaderMenuButton: true,
            maxWidth: 50,
            cellRenderer: SportRenderer
        }
    ]

    @ViewChild('eLeftGrid') eLeftGrid: any;
    @ViewChild('eRightGrid') eRightGrid: any;
    @ViewChild('eMoveRadio') eMoveRadio: any;
    @ViewChild('eDeselectRadio') eDeselectRadio: any;
    @ViewChild('eSelectCheckbox') eSelectCheckbox: any;

    constructor(private http: HttpClient) {
        this.http.get('https://www.ag-grid.com/example-assets/olympic-winners.json').subscribe(data => {
            const athletes: any[] = [];
            let i = 0;
            const dataArray = data as any[];

            while (athletes.length < 20 && i < dataArray.length) {
                var pos = i++;
                if (athletes.some(rec => rec.athlete === dataArray[pos].athlete)) {
                    continue;
                }
                athletes.push(dataArray[pos]);
            }
            this.rawData = athletes;
            this.loadGrids();
        });
    }

    loadGrids = () => {
        this.leftRowData = [...this.rawData];
        this.rightRowData = [];
    }

    reset = () => {
        this.eMoveRadio.nativeElement.checked = true;

        if (!this.eSelectCheckbox.nativeElement.checked) {
            this.eSelectCheckbox.nativeElement.click();
        }

        this.loadGrids();
    }

    checkboxSelectChange = () => {
        const checked = this.eSelectCheckbox.nativeElement.checked;
        this.leftApi.setColumnsVisible(['checkbox'], checked);
        this.leftApi.setGridOption('suppressRowClickSelection', checked);
    }

    getRowId = (params: GetRowIdParams) => params.data.athlete;

    onGridReady(params: GridReadyEvent, side: number) {
        if (side === 0) {
            this.leftApi = params.api
        }

        if (side === 1) {
            this.rightApi = params.api;
            this.addGridDropZone();
        }
    }

    addGridDropZone() {
        const dropZoneParams = this.rightApi.getRowDropZoneParams({
            onDragStop: params => {
                var deselectCheck = this.eDeselectRadio.nativeElement.checked;
                var moveCheck = this.eMoveRadio.nativeElement.checked;
                var nodes = params.nodes;

                if (moveCheck) {
                    this.leftApi.applyTransaction({
                        remove: nodes.map(function (node) {
                            return node.data;
                        })
                    });
                } else if (deselectCheck) {
                    this.leftApi.setNodesSelected({ nodes, newValue: false });
                }
            }
        });

        this.leftApi.addRowDropZone(dropZoneParams);
    }

}
