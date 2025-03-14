import {
    _,
    AgGroupComponent,
    Autowired,
    Column,
    ColumnModel,
    Component,
    Events,
    FilterOpenedEvent,
    ProvidedColumnGroup,
    IProvidedColumn,
    PostConstruct,
    ITooltipParams,
    PreConstruct,
    RefSelector,
    AgGroupComponentParams,
    WithoutGridCommon
} from "@ag-grid-community/core";
import { ToolPanelFilterComp } from "./toolPanelFilterComp";

export type ToolPanelFilterItem = ToolPanelFilterGroupComp | ToolPanelFilterComp;

export class ToolPanelFilterGroupComp extends Component {
    private static TEMPLATE = /* html */
        `<div class="ag-filter-toolpanel-group-wrapper">
            <ag-group-component ref="filterGroupComp"></ag-group-component>
        </div>`;

    @RefSelector('filterGroupComp') private filterGroupComp: AgGroupComponent;

    @Autowired('columnModel') private columnModel: ColumnModel;

    private readonly depth: number;
    private readonly columnGroup: IProvidedColumn;
    private readonly showingColumn: boolean;
    private childFilterComps: (ToolPanelFilterGroupComp | ToolPanelFilterComp)[];
    private expandedCallback: () => void;
    private filterGroupName: string | null;

    constructor(
        columnGroup: IProvidedColumn,
        childFilterComps: (ToolPanelFilterGroupComp | ToolPanelFilterComp)[],
        expandedCallback: () => void,
        depth: number, 
        showingColumn: boolean
    ) {
        super();
        this.columnGroup = columnGroup;
        this.childFilterComps = childFilterComps;
        this.depth = depth;
        this.expandedCallback = expandedCallback;
        this.showingColumn = showingColumn;
    }

    @PreConstruct
    private preConstruct(): void {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'filter-toolpanel',
            direction: 'vertical'
        };
        this.setTemplate(ToolPanelFilterGroupComp.TEMPLATE, { filterGroupComp: groupParams });
    }

    @PostConstruct
    public init(): void {
        this.setGroupTitle();
        this.filterGroupComp.setAlignItems('stretch');

        this.filterGroupComp.addCssClass(`ag-filter-toolpanel-group-level-${this.depth}`);
        this.filterGroupComp.getGui().style.setProperty('--ag-indentation-level', String(this.depth));
        this.filterGroupComp.addCssClassToTitleBar(`ag-filter-toolpanel-group-level-${this.depth}-header`);

        this.childFilterComps.forEach(filterComp => {
            this.filterGroupComp.addItem(filterComp as Component);
            filterComp.addCssClassToTitleBar(`ag-filter-toolpanel-group-level-${this.depth + 1}-header`);
            filterComp.getGui().style.setProperty('--ag-indentation-level', String(this.depth + 1));
        });

        this.refreshFilterClass();
        this.addExpandCollapseListeners();
        this.addFilterChangedListeners();
        this.setupTooltip();
        this.addInIcon('filter');
    }

    private setupTooltip(): void {
        // we don't show tooltips for groups, as when the group expands, it's div contains the columns which also
        // have tooltips, so the tooltips would clash. Eg mouse over group, tooltip shows, mouse over column, another
        // tooltip shows but cos we didn't leave the group the group tooltip remains. this should be fixed in the future,
        // maybe the group shouldn't contain the children form a DOM perspective.
        if (!this.showingColumn) { return; }

        const isTooltipWhenTruncated = this.gos.get('tooltipShowMode') === 'whenTruncated';
        let shouldDisplayTooltip: (() => boolean) | undefined;

        if (isTooltipWhenTruncated) {
            shouldDisplayTooltip = () => {
                const eGui = this.filterGroupComp.getGui();
                const eTitle = eGui.querySelector('.ag-group-title');

                if (!eTitle) { return true; } // show tooltip by default
                return eTitle.scrollWidth > eTitle.clientWidth;
            }
        }

        const refresh = () => {
            const newTooltipText = (this.columnGroup as Column).getColDef().headerTooltip;
            this.setTooltip({ newTooltipText, location: 'filterToolPanelColumnGroup', shouldDisplayTooltip });
        };

        refresh();

        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    }

    public getTooltipParams(): WithoutGridCommon<ITooltipParams> {
        const res = super.getTooltipParams();
        res.location = 'filterToolPanelColumnGroup';
        return res;
    }

    public addCssClassToTitleBar(cssClass: string) {
        this.filterGroupComp.addCssClassToTitleBar(cssClass);
    }

    public refreshFilters(isDisplayed: boolean) {
        this.childFilterComps.forEach(filterComp => {
            if (filterComp instanceof ToolPanelFilterGroupComp) {
                filterComp.refreshFilters(isDisplayed);
            } else {
                filterComp.refreshFilter(isDisplayed);
            }
        });
    }

    public isColumnGroup(): boolean {
        return this.columnGroup instanceof ProvidedColumnGroup;
    }

    public isExpanded(): boolean {
        return this.filterGroupComp.isExpanded();
    }

    public getChildren(): ToolPanelFilterItem[] {
        return this.childFilterComps;
    }

    public getFilterGroupName(): string {
        return this.filterGroupName ? this.filterGroupName : '';
    }

    public getFilterGroupId(): string {
        return this.columnGroup.getId();
    }

    public hideGroupItem(hide: boolean, index: number) {
        this.filterGroupComp.hideItem(hide, index);
    }

    public hideGroup(hide: boolean) {
        this.setDisplayed(!hide);
    }

    private addInIcon(iconName: string): void {
        const eIcon = _.createIconNoSpan(iconName, this.gos)!;
        if (eIcon) {
            eIcon.classList.add('ag-filter-toolpanel-group-instance-header-icon')
        }
        this.filterGroupComp.addTitleBarWidget(eIcon);
    }

    private forEachToolPanelFilterChild(action: (filterComp: ToolPanelFilterItem) => void) {
        this.childFilterComps.forEach(filterComp => {
            if (filterComp instanceof ToolPanelFilterComp) {
                action(filterComp);
            }
        });
    }

    private addExpandCollapseListeners() {
        const expandListener = this.isColumnGroup() ?
            () => this.expandedCallback() :
            () => this.forEachToolPanelFilterChild(filterComp => filterComp.expand());

        const collapseListener = this.isColumnGroup() ?
            () => this.expandedCallback() :
            () => this.forEachToolPanelFilterChild(filterComp => filterComp.collapse());

        this.addManagedListener(this.filterGroupComp, AgGroupComponent.EVENT_EXPANDED, expandListener);
        this.addManagedListener(this.filterGroupComp, AgGroupComponent.EVENT_COLLAPSED, collapseListener);
    }

    private getColumns(): Column[] {
        if (this.columnGroup instanceof ProvidedColumnGroup) {
            return this.columnGroup.getLeafColumns();
        }

        return [this.columnGroup as Column];
    }

    private addFilterChangedListeners() {
        this.getColumns().forEach(column => {
            this.addManagedListener(column, Column.EVENT_FILTER_CHANGED, () => this.refreshFilterClass());
        });

        if (!(this.columnGroup instanceof ProvidedColumnGroup)) {
            this.addManagedListener(this.eventService, Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));
        }
    }

    private refreshFilterClass(): void {
        const columns = this.getColumns();

        const anyChildFiltersActive = () => columns.some(col => col.isFilterActive());
        this.filterGroupComp.addOrRemoveCssClass('ag-has-filter', anyChildFiltersActive());
    }

    private onFilterOpened(event: FilterOpenedEvent): void {
        // when a filter is opened elsewhere, i.e. column menu we close the filter comp so we also need to collapse
        // the column group. This approach means we don't need to try and sync filter models on the same column.

        if (event.source !== 'COLUMN_MENU') { return; }
        if (event.column !== this.columnGroup) { return; }
        if (!this.isExpanded()) { return; }

        this.collapse();
    }

    public expand() {
        this.filterGroupComp.toggleGroupExpand(true);
    }

    public collapse() {
        this.filterGroupComp.toggleGroupExpand(false);
    }

    private setGroupTitle() {
        this.filterGroupName = (this.columnGroup instanceof ProvidedColumnGroup) ?
            this.getColumnGroupName(this.columnGroup) : this.getColumnName(this.columnGroup as Column);

        this.filterGroupComp.setTitle(this.filterGroupName || '');
    }

    private getColumnGroupName(columnGroup: ProvidedColumnGroup): string | null {
        return this.columnModel.getDisplayNameForProvidedColumnGroup(null, columnGroup, 'filterToolPanel');
    }

    private getColumnName(column: Column): string | null {
        return this.columnModel.getDisplayNameForColumn(column, 'filterToolPanel', false);
    }

    private destroyFilters() {
        this.childFilterComps = this.destroyBeans(this.childFilterComps);
        _.clearElement(this.getGui());
    }

    protected destroy() {
        this.destroyFilters();
        super.destroy();
    }
}
