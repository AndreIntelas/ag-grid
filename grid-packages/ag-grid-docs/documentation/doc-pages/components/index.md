---
title: "Custom Components"
---

<framework-specific-section frameworks="javascript,vue">
|You can create your own Custom Components to customise the behaviour of the grid. For example you can customise how cells are rendered, how values are edited and also create your own filters.
</framework-specific-section>

<framework-specific-section frameworks="react">
<video-section id="eglfpHRpcu0" title="React Custom Components" header="true">
You can create your own Custom Components to customise the behaviour of the grid. For example you can customise how cells are rendered, how values are edited and also create your own filters.
</video-section>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<video-section id="A5-Li_9oPSE" title="Angular Custom Components" header="true">
You can create your own Custom Components to customise the behaviour of the grid. For example you can customise how cells are rendered, how values are edited and also create your own filters.
</video-section>
</framework-specific-section>


The full list of component types you can provide in the grid are as follows:

- [Cell Component](/component-cell-renderer/): To customise the contents of a cell.
- [Edit Component](/cell-editors/): To customise the editing of a cell.
- [Date Component](/filter-date/#custom-selection-component): To customise the date selection component in the date filter.
- [Filter Component](/component-filter/): For custom column filter that appears inside the column menu.
- [Floating Filter](/component-floating-filter/): For custom column floating filter that appears inside the column menu.
- [Header Component](/column-headers/): To customise the header of a column and column groups.
- [Loading Component](/component-loading-cell-renderer/): To customise the loading cell row when using Server Side row model.
- [Overlay Component](/overlays/): To customise loading and no rows overlay components.
- [Status Bar Component](/status-bar/): For custom status bar components.
- [Tool Panel Component](/component-tool-panel/): For custom tool panel components.
- [Tooltip Component](/tooltips/): For custom cell tooltip components.

The remainder of this page gives information that is common across all the component types.

md-include:declare-vue.md

## Registering Custom Components

md-include:register-javascript.md
md-include:register-angular.md 
md-include:register-react.md 
md-include:register-vue.md
  
<grid-example title='Registering Components' name='register' type='generated' options='{ "exampleHeight": 580 }'></grid-example>

md-include:advantages-vue.md

## Providing Additional Parameters  

Each Custom Component gets a set of parameters from the grid. For example, for Cell Component the grid provides, among other things, the value to be rendered. You can provide additional properties to the Custom Component (e.g. what currency symbol to use) by providing additional parameters specific to your application.

To provide additional parameters, use the property `[prop-name]Params`, e.g. `cellRendererParams`.

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        { 
            field: 'price',
            cellRenderer: PriceCellRenderer,
            cellRendererParams: {
                currency: 'EUR'
            }
        },
    ],
}
</snippet>

md-include:js-fw-angular.md
md-include:js-fw-react.md
md-include:js-fw-vue.md
md-include:js-fw-common-end.md

<framework-specific-section frameworks="react">
<h2 id="higher-order-components">Higher Order Components</h2>
</framework-specific-section>

<framework-specific-section frameworks="react">
<note>
|We provide a guide on how to use AG Grid with Redux in our [React/Redux Integration Guide.](../redux-integration-pt1/)
</note>
</framework-specific-section>

<framework-specific-section frameworks="react">
|If you use `connect` to use Redux, or if you're using a Higher Order Component (HOC) to wrap the grid React component, you'll also need to ensure the grid can get access to the newly created component. To do this you need to ensure `forwardRef` is set:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|export default connect((state) => {
|    return {
|        currencySymbol: state.currencySymbol,
|        exchangeRate: state.exchangeRate
|    }
|}, null, null, { forwardRef: true } // must be supplied for react/redux when using AgGridReact
|)(PriceRenderer);
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular,vue">
<h2 id="higher-order-components">Child to Parent Communication</h2>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|There are a variety of ways to manage component communication in Angular (shared service,
|local variables etc), but you often need a simple way to let a "parent" component know
|that something has happened on a "child" component. In this case the simplest route is
|to use the Grid's `context` feature to hold a reference to the parent, which the child can
|then access.
</framework-specific-section>


<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|//...other imports
|import {Component} from '@angular/core';
|import {ICellRendererAngularComp} from 'ag-grid-angular';
|import {CubeComponent} from './cube.component';
|
|@Component({
|   selector: 'app-root',
|   template: `
|       &lt;ag-grid-angular [context]="context" /* ...other properties */>
|       &lt;/ag-grid-angular>
|   `
|})
|export class AppComponent {
|   constructor() {
|       this.context = {
|           componentParent: this
|       }
|   }
|
|   parentMethod() {
|       // do something
|   }
|   //...other properties & methods
|}
|
|@Component({
|   selector: 'cell-renderer',
|   template: `
|       ...component template...
|   `
|})
|export class CellRendererComponent implements ICellRendererAngularComp {
|   params: any;
|   componentParent: any;
|
|   agInit(params) {
|       this.params = params;
|       this.componentParent = this.params.context.componentParent;
|       // the grid component can now be accessed - for example: this.componentParent.parentMethod()
|   }
|
|   //...other properties & methods
|}
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
|Note that although we've used `componentParent` as the property name here it can
|be anything - the main point is that you can use the `context` mechanism to share
|information between the components.
|A working example of this can be found in the [Cell Renderer](/component-cell-renderer/#example-dynamic-components) docs.
</framework-specific-section>

<framework-specific-section frameworks="vue">
|There are a variety of ways to manage component communication in Vue (shared service,
|local variables etc), but you often need a simple way to let a "parent" component know
|that something has happened on a "child" component. In this case the simplest route is
|to use the Grid's `context` feature to hold a reference to the parent, which the child can
|then access.
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false}>
|// Parent Grid Component
|&lt;template>
|   &lt;ag-grid-vue :context="context" ...other properties>
|   &lt;/ag-grid-vue>
|&lt;/template>
|
|&lt;script>
|//...other imports
|import {AgGridVue} from "ag-grid-vue3";
|import CubeComponent from './CubeComponent.vue';
|
|export default {
|   components: {
|       AgGridVue
|   }
|   data() {
|       return {
|           context: {}
|       }
|   },
|   beforeMount() {
|       this.context = {
|           componentParent: this
|       }
|   },
|   methods: {
|       parentMethod() {
|           // do something
|       }
|   }
|   //...other properties & methods
|}
|&lt;/script>
|
|// Child Grid Component
|&lt;template>
|   &lt;ag-grid-vue ...other properties>
|   &lt;/ag-grid-vue>
|&lt;/template>
|
|&lt;script>
|//...other imports
|
|export default {
|   methods: {
|       doSomethingOnGrid() {
|           // the grid component can now be accessed via this.params.context.componentParent
|           this.params.context.componentParent.parentMethod()
|       }
|   }
|   //...other properties & methods
|}
|&lt;/script>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
|Note that although we've used `componentParent` as the property name here it can
|be anything - the main point is that you can use the `context` mechanism to share
|information between the components.
|
|A working example of this can be found in the [Cell Renderer](/component-cell-renderer/#example-dynamic-components) docs.
</framework-specific-section>

<framework-specific-section frameworks="vue">
<h2 id="higher-order-components">Provide/Inject</h2>
When using Vue Components within AG Grid you are able to use `provide` / `context`, but only in the `Options` format below:
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="jsx">
|// Parent Grid
|const VueExample = {
|    template: `
|        <ag-grid-vue
|                style="width: 100%; height: 100%;"
|                class="ag-theme-quartz"
|                :columnDefs="columnDefs"
|                :rowData="rowData">
|        </ag-grid-vue>
|    `,
|    components: {
|        'ag-grid-vue': AgGridVue,
|        'myRenderer': MyRenderer
|    },
|    provide: {
|        'providedValue': 'testValue' // provide this value to grid components
|    },
| 
|    //...rest of the component definition
|}
|
|// Child Grid Component
|export default {
|    name: 'myRenderer',
|    template: `<span>{{ value }} {{ test }}</span>`,
|    inject: ['providedValue'],   // retrieve/inject the provided value
|    
|    //...rest of the component definition
|};
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
|You cannot use the new Composition API (inject/provide) as this is not supported by Vue when using createNode `createVNode`, but the above is a workable alternative.
|
|Alternatively you could consider using the Grid's [Context](/context/) mechanism to share data with child components.
</framework-specific-section>

## Component Usage

The below table gives a summary of the components, where they are configured and using what attribute.

| Component                     | Where                     | Attribute | 
| ----------------------------- | ------------------------- | ------------------------ | 
| Cell Component                 | Column Definition         | cellRenderer<br/>cellRendererParams<br/>cellRendererSelector         | 
| Editor Component                   | Column Definition         | cellEditor<br />cellEditorParams<br/>cellEditorSelector| 
| Filter                        | Column Definition         | filter<br/>filterParams              | 
| Floating Filter               | Column Definition         | floatingFilter<br/>floatingFilterParams       | 
| Header Component              | Column Definition         | headerComponent<br/>headerComponentParams               | 
| Header Group Component        | Column Definition         | headerGroupComponent<br/>headerGroupComponentParams         | 
| Tooltip Component             | Column Definition         | tooltipComponent<br/>tooltipComponentParams              | 
| Group Row Cell Component       | Grid Option               | groupRowRenderer<br/>groupRowRendererParams         | 
| Group Row Inner Cell Component | Grid Option               | innerRenderer<br/>innerRendererParams            | 
| Detail Cell Component          | Grid Option               | detailCellRenderer<br/>detailCellRendererParams        | 
| Full Width Cell Component      | Grid Option               | fullWidthCellRenderer<br/>fullWidthCellRendererParams        | 
| Loading Cell Component         | Grid Option               | loadingCellRenderer<br/>loadingCellRendererParams       |
| Loading Overlay               | Grid Option               | loadingOverlayComponent<br/>loadingOverlayComponentParams       | 
| No Rows Overlay               | Grid Option               | noRowsOverlayComponent<br/>noRowsOverlayComponentParams        |
| Date Component                | Grid Option               | dateComponent<br/>dateComponentParams                  | 
| Status Bar Component          | Grid Option -> Status Bar | statusPanel<br/>statusPanelParams          | 
| Tool Panel                    | Grid Option -> Side Bar   | toolPanel<br/>toolPanelParams            | 
| Menu Item                     | Grid Option -> Menu       | menuItem<br/>menuItemParams            | 

## Grid Provided Components

The grid comes with pre-registered components that can be used. Each component provided by the grid starts with the namespaces 'ag' to minimise naming conflicts with user provided components. The full list of grid provided components are in the table below.

<table>
    <thead>
        <tr>
            <th colspan="2"><h3>Date Inputs</h3></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>agDateInput</td>
            <td>Default date input used by filters.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Column Headers</h3></td>
        </tr>
        <tr>
            <td>agColumnHeader</td>
            <td>Default column header.</td>
        </tr>
        <tr>
            <td>agColumnHeaderGroup</td>
            <td>Default column group header.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Column Filters</h3></td>
        </tr>
        <tr>
            <td>agSetColumnFilter<enterprise-icon></enterprise-icon></td>
            <td>Set filter (default when using AG Grid Enterprise).</td>
        </tr>
        <tr>
            <td>agTextColumnFilter</td>
            <td>Simple text filter (default when using AG Grid Community).</td>
        </tr>
        <tr>
            <td>agNumberColumnFilter</td>
            <td>Number filter.</td>
        </tr>
        <tr>
            <td>agDateColumnFilter</td>
            <td>Date filter.</td>
        </tr>
        <tr>
            <td>agMultiColumnFilter<enterprise-icon></enterprise-icon></td>
            <td>Multi filter.</td>
        </tr>
        <tr>
            <td>agGroupColumnFilter<enterprise-icon></enterprise-icon></td>
            <td>Group column filter.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Floating Filters</h3></td>
        </tr>
        <tr>
            <td>agSetColumnFloatingFilter<enterprise-icon></enterprise-icon></td>
            <td>Floating set filter.</td>
        </tr>
        <tr>
            <td>agTextColumnFloatingFilter</td>
            <td>Floating text filter.</td>
        </tr>
        <tr>
            <td>agNumberColumnFloatingFilter</td>
            <td>Floating number filter.</td>
        </tr>
        <tr>
            <td>agDateColumnFloatingFilter</td>
            <td>Floating date filter.</td>
        </tr>
        <tr>
            <td>agMultiColumnFloatingFilter<enterprise-icon></enterprise-icon></td>
            <td>Floating multi filter.</td>
        </tr>
        <tr>
            <td>agGroupColumnFloatingFilter<enterprise-icon></enterprise-icon></td>
            <td>Floating group column filter.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Cell Components</h3></td>
        </tr>
        <tr>
            <td>agAnimateShowChangeCellRenderer</td>
            <td>Cell Component that animates value changes.</td>
        </tr>
        <tr>
            <td>agAnimateSlideCellRenderer</td>
            <td>Cell Component that animates value changes.</td>
        </tr>
        <tr>
            <td>agGroupCellRenderer</td>
            <td>Cell Component for displaying group information.</td>
        </tr>
        <tr>
            <td>agLoadingCellRenderer<enterprise-icon></enterprise-icon></td>
            <td>Cell Component for loading row when using Enterprise row model.</td>
        </tr>
        <tr>
            <td>agCheckboxCellRenderer</td>
            <td>Cell Component that displays a checkbox for boolean values.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Overlays</h3></td>
        </tr>
        <tr>
            <td>agLoadingOverlay</td>
            <td>Loading overlay.</td>
        </tr>
        <tr>
            <td>agNoRowsOverlay</td>
            <td>No rows overlay.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Cell Editors</h3></td>
        </tr>
        <tr>
            <td>agTextCellEditor</td>
            <td>Text cell editor.</td>
        </tr>
        <tr>
            <td>agSelectCellEditor</td>
            <td>Select cell editor.</td>
        </tr>
        <tr>
            <td>agRichSelectCellEditor<enterprise-icon></enterprise-icon></td>
            <td>Rich select editor.</td>
        </tr>
        <tr>
            <td>agLargeTextCellEditor</td>
            <td>Large text cell editor.</td>
        </tr>
        <tr>
            <td>agNumberCellEditor</td>
            <td>Number cell editor.</td>
        </tr>
        <tr>
            <td>agDateCellEditor</td>
            <td>Date cell editor.</td>
        </tr>
        <tr>
            <td>agDateStringCellEditor</td>
            <td>Date represented as string cell editor.</td>
        </tr>
        <tr>
            <td>agCheckboxCellEditor</td>
            <td>Checkbox cell editor.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Master Detail</h3></td>
        </tr>
        <tr>
            <td>agDetailCellRenderer<enterprise-icon></enterprise-icon></td>
            <td>Detail panel for master / detail grid.</td>
        </tr>
        <tr>
            <td colspan="2"><h3>Column Menu / Context Menu</h3></td>
        </tr>
        <tr>
            <td>agMenuItem<enterprise-icon></enterprise-icon></td>
            <td>Menu item within column or context menu</td>
        </tr>
    </tbody>
</table>

## Overriding Grid Components

It is also possible to override components. Where the grid uses a default value, this means the override component will be used instead. The default components, where overriding makes sense, are as follows:

- **agDateInput**: To change the default date selection across all filters.
- **agColumnHeader**: To change the default column header across all columns.
- **agColumnGroupHeader**: To change the default column group header across all columns.
- **agLoadingCellRenderer**: To change the default loading cell renderer for Enterprise Row Model.
- **agLoadingOverlay**: To change the default 'loading' overlay.
- **agNoRowsOverlay**: To change the default loading 'no rows' overlay.
- **agCellEditor**: To change the default cell editor.
- **agDetailCellRenderer**: To change the default detail panel for master / detail grids.
- **agMenuItem**: To change the default menu item for column and context menus.

To override the default component, register the custom component in the GridOptions `components` property under the above name.

<framework-specific-section frameworks="javascript">
<snippet transform={false}>
|const gridOptions = {
|    // Here is where we specify the components to be used instead of the default
|    components: {
|        agDateInput: CustomDateComponent,
|        agColumnHeader: CustomHeaderComponent
|    }
|};
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false} language="ts">
|@Component({
|    selector: 'my-app',
|    template: `
|      &lt;ag-grid-angular
|          class="ag-theme-quartz"
|          [components]="components"
|          ...other properties...  
|      >&lt;/ag-grid-angular>
|    `
|})
|export class AppComponent {
|    // Here is where we specify the components to be used instead of the default
|    public components = {
|        agDateInput: CustomDateComponent,
|        agColumnHeader: CustomHeaderComponent
|    };
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
| const components = useMemo(() => (
|    { agDateInput: CustomDateComponent,
|      agColumnHeader: CustomHeaderComponent 
|    }), []);
|
|&lt;AgGridReact
|    components={components}
|    ...other properties...
|/>
</snippet>
</framework-specific-section>

<framework-specific-section frameworks="vue">
<snippet transform={false} language="ts">
|const MyApp = {
|    // Here is where we specify the components to be used instead of the default
|    components: {
|        'ag-grid-vue': AgGridVue
|        agDateInput: CustomDateComponent,
|        agColumnHeader: CustomHeaderComponent
|    },
</snippet>
</framework-specific-section>


<framework-specific-section frameworks="vue">
<note>
|Overridable grid components are the only components you need to additionally specify with `components` in order to tie their usage to the 
|actual component. All other registration types specify their usage in column definitions or on the `AgGridVue` component itself.
|
|For an example of this please refer to the [Date Component](../filter-date/#registering-date-components) documentation.
</note>
</framework-specific-section>