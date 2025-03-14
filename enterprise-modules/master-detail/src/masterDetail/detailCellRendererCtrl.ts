import {
    Autowired,
    BeanStub,
    DetailGridInfo,
    GridApi,
    IDetailCellRendererCtrl,
    RowNode,
    IDetailCellRendererParams,
    IDetailCellRenderer,
    Events,
    RowPositionUtils,
    FullWidthRowFocusedEvent,
    FocusService,
    _
} from "@ag-grid-community/core";

export class DetailCellRendererCtrl extends BeanStub implements IDetailCellRendererCtrl {

    @Autowired('rowPositionUtils') private readonly rowPositionUtils: RowPositionUtils;
    @Autowired('focusService') private readonly focusService: FocusService;

    private params: IDetailCellRendererParams;

    private comp: IDetailCellRenderer;

    private loadRowDataVersion = 0;

    private refreshStrategy: 'rows' | 'everything' | 'nothing';

    public init(comp: IDetailCellRenderer, params: IDetailCellRendererParams): void {
        this.params = params;
        this.comp = comp;

        const doNothingBecauseInsidePinnedSection = params.pinned != null;
        if (doNothingBecauseInsidePinnedSection) { return; }

        this.setAutoHeightClasses();
        this.setupRefreshStrategy();
        this.addThemeToDetailGrid();
        this.createDetailGrid();
        this.loadRowData();

        this.addManagedListener(this.eventService, Events.EVENT_FULL_WIDTH_ROW_FOCUSED, this.onFullWidthRowFocused.bind(this));
    }

    private onFullWidthRowFocused(e: FullWidthRowFocusedEvent): void {
        const params = this.params;
        const row = { rowIndex: params.node.rowIndex!, rowPinned: params.node.rowPinned! };
        const eventRow = { rowIndex: e.rowIndex!, rowPinned: e.rowPinned! };
        const isSameRow = this.rowPositionUtils.sameRow(row, eventRow);

        if (!isSameRow) { return; }

        this.focusService.focusInto(this.comp.getGui(), e.fromBelow);
    }

    private setAutoHeightClasses(): void {
        const autoHeight = this.gos.get('detailRowAutoHeight');

        const parentClass = autoHeight ? 'ag-details-row-auto-height' : 'ag-details-row-fixed-height';
        const detailClass =  autoHeight ? 'ag-details-grid-auto-height' : 'ag-details-grid-fixed-height';

        this.comp.addOrRemoveCssClass(parentClass, true);
        this.comp.addOrRemoveDetailGridCssClass(detailClass, true);
    }

    private setupRefreshStrategy(): void {
        const providedStrategy = this.params.refreshStrategy;

        const validSelection = providedStrategy == 'everything' || providedStrategy == 'nothing' || providedStrategy == 'rows';
        if (validSelection) {
            this.refreshStrategy = providedStrategy;
            return;
        }

        if (providedStrategy!=null) {
            console.warn("AG Grid: invalid cellRendererParams.refreshStrategy = '" + providedStrategy +
                "' supplied, defaulting to refreshStrategy = 'rows'.");
        }
    
        this.refreshStrategy = 'rows';
    }

    private addThemeToDetailGrid(): void {
        // this is needed by environment service of the child grid, the class needs to be on
        // the grid div itself - the browser's CSS on the other hand just inherits from the parent grid theme.
        for (const themeClass of this.environment.getThemeClasses()) {
            this.comp.addOrRemoveDetailGridCssClass(themeClass, true);
        }
    }

    private createDetailGrid(): void {
        if (_.missing(this.params.detailGridOptions)) {
            console.warn('AG Grid: could not find detail grid options for master detail, ' +
                'please set gridOptions.detailCellRendererParams.detailGridOptions');
            return;
        }

        const autoHeight = this.gos.get('detailRowAutoHeight');

        // we clone the detail grid options, as otherwise it would be shared
        // across many instances, and that would be a problem because we set
        // api into gridOptions
        const gridOptions = {...this.params.detailGridOptions};

        if (autoHeight) {
            gridOptions.domLayout = 'autoHeight';
        }

        this.comp.setDetailGrid(gridOptions);
    }

    public registerDetailWithMaster(api: GridApi): void {
        const rowId = this.params.node.id!;
        const masterGridApi = this.params.api;

        const gridInfo: DetailGridInfo = {
            id: rowId,
            api: api,
        };

        const rowNode = this.params.node as RowNode;

        // register with api if the master api is still alive
        if(masterGridApi.isDestroyed()) { 
            return; 
        }
        masterGridApi.addDetailGridInfo(rowId, gridInfo);

        // register with node
        rowNode.detailGridInfo = gridInfo;

        this.addDestroyFunc(() => {
            // the gridInfo can be stale if a refresh happens and
            // a new row is created before the old one is destroyed.
            if (rowNode.detailGridInfo !== gridInfo) { return; }
            if(!masterGridApi.isDestroyed()) { 
                masterGridApi.removeDetailGridInfo(rowId); // unregister from api
             }
            rowNode.detailGridInfo = null; // unregister from node
        });
    }

    private loadRowData(): void {
        // in case a refresh happens before the last refresh completes (as we depend on async
        // application logic) we keep track on what the latest call was.
        this.loadRowDataVersion++;
        const versionThisCall = this.loadRowDataVersion;

        if (this.params.detailGridOptions?.rowModelType === 'serverSide') {
            const node = this.params.node as RowNode;
            node.detailGridInfo?.api?.refreshServerSide({ purge: true });
            return;
        }

        const userFunc = this.params.getDetailRowData;
        if (!userFunc) {
            console.warn('AG Grid: could not find getDetailRowData for master / detail, ' +
                'please set gridOptions.detailCellRendererParams.getDetailRowData');
            return;
        }

        const successCallback = (rowData: any[]) => {
            const mostRecentCall = this.loadRowDataVersion === versionThisCall;
            if (mostRecentCall) {
                this.comp.setRowData(rowData);
            }
        };

        const funcParams: any = {
            node: this.params.node,
            // we take data from node, rather than params.data
            // as the data could have been updated with new instance
            data: this.params.node.data,
            successCallback: successCallback,
            context: this.gos.getGridCommonParams().context
        };
        userFunc(funcParams);
    }

    public refresh(): boolean {
        const GET_GRID_TO_REFRESH = false;
        const GET_GRID_TO_DO_NOTHING = true;

        switch (this.refreshStrategy) {
            // ignore this refresh, make grid think we've refreshed but do nothing
            case 'nothing': return GET_GRID_TO_DO_NOTHING;
            // grid will destroy and recreate the cell
            case 'everything': return GET_GRID_TO_REFRESH;
        }

        // do the refresh here, and tell the grid to do nothing
        this.loadRowData();
        return GET_GRID_TO_DO_NOTHING;
    }
}
