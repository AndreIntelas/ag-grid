import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import './styles.css';

import { ModuleRegistry } from '@ag-grid-community/core';
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const DeltaRenderer = {
    template: `<span>
        <img :src="src" />
        {{displayValue}}
        </span>`,
    data: function () {
        return {
            src: '',
            displayValue: '',
        };
    },
    beforeMount() {
        this.updateDisplay(this.params);
    },
    methods: {
        refresh(params) {
            this.updateDisplayValue(params);
        },
        updateDisplay(params) {
            this.displayValue = params.value;
            if (params.value > 15) {
                this.src = 'https://www.ag-grid.com/example-assets/weather/fire-plus.png'
            } else {
                this.src = 'https://www.ag-grid.com/example-assets/weather/fire-minus.png'
            }
        },
    },
};

const IconRenderer = {
    template: `<span>
        <img v-for="images in arr" :src="src" />
        </span>`,
    data: function () {
        return {
            arr: [],
            src: '',
        };
    },
    beforeMount() {
        this.updateDisplay(this.params);
    },
    methods: {
        refresh(params) {
            this.updateDisplay(params);
        },
        updateDisplay(params) {
            this.src = `https://www.ag-grid.com/example-assets/weather/${params.rendererImage}`;
            this.arr = new Array(
                Math.floor(params.value / (params.divisor || 1))
            );
        },
    },
};

const VueExample = {
    template: `
        <div style="height: 100%">
        <div class="example-wrapper">
            <div style="margin-bottom: 5px;">
                <button v-on:click="randomiseFrost()">Randomise Frost</button>
            </div>
            <ag-grid-vue
                    style="width: 100%; height: 100%;"
                    :class="themeClass"
                    :columnDefs="columnDefs"
                    :rowData="rowData"
                    :defaultColDef="defaultColDef"
                    
                    :components="components"
                    @grid-ready="onGridReady">
            </ag-grid-vue>
        </div>
        </div>
    `,
    components: {
        'ag-grid-vue': AgGridVue,
        "iconRenderer": IconRenderer,
        "deltaRenderer": DeltaRenderer,
    },
    data: function () {
        return {
            components: {
                deltaRenderer: DeltaRenderer,
                iconRenderer: IconRenderer,
            },
            gridApi: null,
            columnDefs: this.getColumnDefs(false),
            defaultColDef: {
                editable: true,flex: 1,
                minWidth: 100,
                filter: true,
                
            },
            rowData: null,
            themeClass: "ag-theme-quartz",
            frostPrefix: false,
        }
    },
    methods: {
        onGridReady(params) {
            this.gridApi = params.api;

            const updateData = (data) => this.gridApi.setGridOption('rowData', data);

            fetch('https://www.ag-grid.com/example-assets/weather-se-england.json')
                .then(resp => resp.json())
                .then(data => updateData(data));
        },
        randomiseFrost() {
            // iterate over "days of air frost" and randomise each value
            this.gridApi.forEachNode(rowNode => {
                rowNode.setDataValue('Days of air frost (days)', (Math.floor(Math.random() * 4) + 1));
            });
        },
        getColumnDefs() {
            return [
                {
                    headerName: "Month",
                    field: "Month",
                    width: 75
                },
                {
                    headerName: "Max Temp",
                    field: "Max temp (C)",
                    width: 120,
                    cellRenderer: "deltaRenderer"
                },
                {
                    headerName: "Min Temp",
                    field: "Min temp (C)",
                    width: 120,
                    cellRenderer: "deltaRenderer"
                },
                {
                    headerName: "Frost",
                    field: "Days of air frost (days)",
                    width: 233,
                    cellRenderer: "iconRenderer",
                    cellRendererParams: { rendererImage: "frost.png" }    // Complementing the Cell Renderer parameters
                },
                {
                    headerName: "Sunshine",
                    field: "Sunshine (hours)",
                    width: 190,
                    cellRenderer: "iconRenderer",
                    cellRendererParams: { rendererImage: "sun.png", divisor: 24 }      // Complementing the Cell Renderer parameters
                },
                {
                    headerName: "Rainfall",
                    field: "Rainfall (mm)",
                    width: 180,
                    cellRenderer: "iconRenderer",
                    cellRendererParams: { rendererImage: "rain.png", divisor: 10 }     // Complementing the Cell Renderer parameters
                }
            ];
        }
    }
}

new Vue({
    el: '#app',
    components: {
        'my-component': VueExample,
    },
});
