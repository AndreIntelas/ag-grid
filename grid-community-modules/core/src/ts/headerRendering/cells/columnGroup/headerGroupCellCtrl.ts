import { ColumnModel } from "../../../columns/columnModel";
import { UserCompDetails } from "../../../components/framework/userComponentFactory";
import { KeyCode } from '../../../constants/keyCode';
import { Autowired } from "../../../context/context";
import {
    DragAndDropService,
    DragItem,
    DragSource,
    DragSourceType
} from "../../../dragAndDrop/dragAndDropService";
import { Column } from "../../../entities/column";
import { ColumnEventType, Events } from "../../../events";
import { ColumnGroup } from "../../../entities/columnGroup";
import { ProvidedColumnGroup } from "../../../entities/providedColumnGroup";
import { SetLeftFeature } from "../../../rendering/features/setLeftFeature";
import { last, removeFromArray } from "../../../utils/array";
import { ManagedFocusFeature } from "../../../widgets/managedFocusFeature";
import { ITooltipFeatureCtrl, TooltipFeature } from "../../../widgets/tooltipFeature";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";
import { CssClassApplier } from "../cssClassApplier";
import { HoverFeature } from "../hoverFeature";
import { GroupResizeFeature } from "./groupResizeFeature";
import { GroupWidthFeature } from "./groupWidthFeature";
import { IHeaderGroupComp, IHeaderGroupParams } from "./headerGroupComp";
import { HorizontalDirection } from "../../../constants/direction";
import { ColumnMoveHelper } from "../../columnMoveHelper";

export interface IHeaderGroupCellComp extends IAbstractHeaderCellComp {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    setResizableDisplayed(displayed: boolean): void;
    setWidth(width: string): void;
    setAriaExpanded(expanded: 'true' | 'false' | undefined): void;
    setUserCompDetails(compDetails: UserCompDetails): void;
    getUserCompInstance(): IHeaderGroupComp | undefined;
}

export class HeaderGroupCellCtrl extends AbstractHeaderCellCtrl<IHeaderGroupCellComp, ColumnGroup, GroupResizeFeature> {

    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    private expandable: boolean;
    private displayName: string | null;

    constructor(columnGroup: ColumnGroup, parentRowCtrl: HeaderRowCtrl) {
        super(columnGroup, parentRowCtrl);
        this.column = columnGroup;
    }

    public setComp(comp: IHeaderGroupCellComp, eGui: HTMLElement, eResize: HTMLElement): void {
        this.setGui(eGui);
        this.comp = comp;

        this.displayName = this.columnModel.getDisplayNameForColumnGroup(this.column, 'header');

        this.addClasses();
        this.setupMovingCss();
        this.setupExpandable();
        this.setupTooltip();
        this.setupUserComp();

        const pinned = this.getParentRowCtrl().getPinned();
        const leafCols = this.column.getProvidedColumnGroup().getLeafColumns();

        this.createManagedBean(new HoverFeature(leafCols, eGui));
        this.createManagedBean(new SetLeftFeature(this.column, eGui, this.beans));
        this.createManagedBean(new GroupWidthFeature(comp, this.column));
        this.resizeFeature = this.createManagedBean(new GroupResizeFeature(comp, eResize, pinned, this.column));

        this.createManagedBean(new ManagedFocusFeature(
            eGui,
            {
                shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
                onTabKeyDown: () => undefined,
                handleKeyDown: this.handleKeyDown.bind(this),
                onFocusIn: this.onFocusIn.bind(this)
            }
        ));

        this.addManagedPropertyListener(Events.EVENT_SUPPRESS_COLUMN_MOVE_CHANGED, this.onSuppressColMoveChange);
        this.addResizeAndMoveKeyboardListeners();
    }

    protected resizeHeader(direction: HorizontalDirection, shiftKey: boolean): void {
        // check to avoid throwing when a component has not been setup yet (React 18)
        if (!this.resizeFeature) { return; }

        const diff = (direction === HorizontalDirection.Left ? -1 : 1) * this.resizeMultiplier;

        const initialValues = this.resizeFeature.getInitialValues(shiftKey);
        this.resizeFeature.resizeColumns(initialValues, initialValues.resizeStartWidth + diff, 'uiColumnResized', true);
    }

    protected moveHeader(direction: HorizontalDirection): void {
        const displayedLeafColumns = this.column.getDisplayedLeafColumns();
        const isLeft = direction === HorizontalDirection.Left
        const targetColumn = isLeft ? displayedLeafColumns[0] : last(displayedLeafColumns);
        const columnLeft = targetColumn.getLeft()!;
        const columnWidth = targetColumn.getActualWidth();

        const xPosition = isLeft ? columnLeft - 1 : columnLeft + columnWidth + 1;
        ColumnMoveHelper.attemptMoveColumns({
            allMovingColumns: this.column.getLeafColumns(),
            isFromHeader: true,
            hDirection: direction,
            xPosition,
            pinned: this.column.getPinned(),
            fromEnter: false,
            fakeEvent: false,
            gridOptionsService: this.gridOptionsService,
            columnModel: this.columnModel
        });

        this.ctrlsService.getGridBodyCtrl().getScrollFeature().ensureColumnVisible(targetColumn, 'auto');
    }

    public resizeLeafColumnsToFit(source: ColumnEventType): void {
        // check to avoid throwing when a component has not been setup yet (React 18)
        if (!this.resizeFeature) { return; }

        this.resizeFeature.resizeLeafColumnsToFit(source);
    }

    private setupUserComp(): void {
        const params: IHeaderGroupParams = {
            displayName: this.displayName!,
            columnGroup: this.column,
            setExpanded: (expanded: boolean) => {
                this.columnModel.setColumnGroupOpened(this.column.getProvidedColumnGroup(), expanded, "gridInitializing");
            },
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context
        };

        const compDetails = this.userComponentFactory.getHeaderGroupCompDetails(params)!;
        this.comp.setUserCompDetails(compDetails);
    }

    private setupTooltip(): void {

        const colGroupDef = this.column.getColGroupDef();

        const tooltipCtrl: ITooltipFeatureCtrl = {
            getColumn: () => this.column,
            getGui: () => this.eGui,
            getLocation: () => 'headerGroup',
            getTooltipValue: () => colGroupDef && colGroupDef.headerTooltip
        };

        if (colGroupDef) {
            tooltipCtrl.getColDef = () => colGroupDef;
        }

        const tooltipFeature = this.createManagedBean(new TooltipFeature(tooltipCtrl, this.beans));

        tooltipFeature.setComp(this.eGui);
    }

    private setupExpandable(): void {
        const providedColGroup = this.column.getProvidedColumnGroup();

        this.refreshExpanded();

        this.addManagedListener(providedColGroup, ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED, this.refreshExpanded.bind(this));
        this.addManagedListener(providedColGroup, ProvidedColumnGroup.EVENT_EXPANDED_CHANGED, this.refreshExpanded.bind(this));
    }

    private refreshExpanded(): void {
        const column = this.column as ColumnGroup;
        this.expandable = column.isExpandable();
        const expanded = column.isExpanded();

        if (this.expandable) {
            this.comp.setAriaExpanded(expanded ? 'true' : 'false');
        } else {
            this.comp.setAriaExpanded(undefined);
        }
    }

    public getColId() {
        return this.column.getUniqueId();
    }

    private addClasses(): void {
        const colGroupDef = this.column.getColGroupDef();
        const classes = CssClassApplier.getHeaderClassesFromColDef(colGroupDef, this.gridOptionsService, null, this.column);

        // having different classes below allows the style to not have a bottom border
        // on the group header, if no group is specified
        if (this.column.isPadding()) {
            classes.push('ag-header-group-cell-no-group');
            const leafCols = this.column.getLeafColumns();
            if (leafCols.every(col => col.isSpanHeaderHeight())) {
                classes.push('ag-header-span-height');
            }
        } else {
            classes.push('ag-header-group-cell-with-group');
        }

        classes.forEach(c => this.comp.addOrRemoveCssClass(c, true));
    }

    private setupMovingCss(): void {
        const providedColumnGroup = this.column.getProvidedColumnGroup();
        const leafColumns = providedColumnGroup.getLeafColumns();

        // this function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        const listener = () => this.comp.addOrRemoveCssClass('ag-header-cell-moving', this.column.isMoving());

        leafColumns.forEach(col => {
            this.addManagedListener(col, Column.EVENT_MOVING_CHANGED, listener);
        });

        listener();
    }

    private onSuppressColMoveChange = () => {
        if (this.isSuppressMoving()) {
            this.removeDragSource();
        } else {
            if (!this.dragSource) {
                const eGui = this.getGui();
                this.setDragSource(eGui);
            }
        }
    }

    private onFocusIn(e: FocusEvent) {
        if (!this.eGui.contains(e.relatedTarget as HTMLElement)) {
            const rowIndex = this.getRowIndex();
            this.beans.focusService.setFocusedHeader(rowIndex, this.column);
        }
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        super.handleKeyDown(e);

        const wrapperHasFocus = this.getWrapperHasFocus();

        if (!this.expandable || !wrapperHasFocus) { return; }

        if (e.key === KeyCode.ENTER) {
            const column = this.column;
            const newExpandedValue = !column.isExpanded();

            this.columnModel.setColumnGroupOpened(column.getProvidedColumnGroup(), newExpandedValue, "uiColumnExpanded");
        }
    }

    // unlike columns, this will only get called once, as we don't react on props on column groups
    // (we will always destroy and recreate this comp if something changes)
    public setDragSource(eHeaderGroup: HTMLElement): void {
        if (this.isSuppressMoving()) {
            return;
        }

        this.removeDragSource();
        if (!eHeaderGroup) {
            return;
        }

        const allLeafColumns = this.column.getProvidedColumnGroup().getLeafColumns();
        let hideColumnOnExit = !this.gridOptionsService.is('suppressDragLeaveHidesColumns');
        this.dragSource = {
            type: DragSourceType.HeaderCell,
            eElement: eHeaderGroup,
            getDefaultIconName: () => hideColumnOnExit ? DragAndDropService.ICON_HIDE : DragAndDropService.ICON_NOT_ALLOWED,
            dragItemName: this.displayName,
            // we add in the original group leaf columns, so we move both visible and non-visible items
            getDragItem: this.getDragItemForGroup.bind(this),
            onDragStarted: () => {
                hideColumnOnExit = !this.gridOptionsService.is('suppressDragLeaveHidesColumns');
                allLeafColumns.forEach(col => col.setMoving(true, "uiColumnDragged"));
            },
            onDragStopped: () => allLeafColumns.forEach(col => col.setMoving(false, "uiColumnDragged")),
            onGridEnter: (dragItem) => {
                if (hideColumnOnExit) {
                    const unlockedColumns = dragItem?.columns?.filter(col => !col.getColDef().lockVisible) || [];
                    this.columnModel.setColumnsVisible(unlockedColumns, true, "uiColumnMoved");
                }
            },
            onGridExit: (dragItem) => {
                if (hideColumnOnExit) {
                    const unlockedColumns = dragItem?.columns?.filter(col => !col.getColDef().lockVisible) || [];
                    this.columnModel.setColumnsVisible(unlockedColumns, false, "uiColumnMoved");
                }
            },
        };

        this.dragAndDropService.addDragSource(this.dragSource, true);
    }

    // when moving the columns, we want to move all the columns (contained within the DragItem) in this group in one go,
    // and in the order they are currently in the screen.
    public getDragItemForGroup(): DragItem {
        const allColumnsOriginalOrder = this.column.getProvidedColumnGroup().getLeafColumns();

        // capture visible state, used when re-entering grid to dictate which columns should be visible
        const visibleState: { [key: string]: boolean; } = {};
        allColumnsOriginalOrder.forEach(column => visibleState[column.getId()] = column.isVisible());

        const allColumnsCurrentOrder: Column[] = [];
        this.columnModel.getAllDisplayedColumns().forEach(column => {
            if (allColumnsOriginalOrder.indexOf(column) >= 0) {
                allColumnsCurrentOrder.push(column);
                removeFromArray(allColumnsOriginalOrder, column);
            }
        });

        // we are left with non-visible columns, stick these in at the end
        allColumnsOriginalOrder.forEach(column => allColumnsCurrentOrder.push(column));

        // create and return dragItem
        return {
            columns: allColumnsCurrentOrder,
            visibleState: visibleState
        };
    }

    private isSuppressMoving(): boolean {
        // if any child is fixed, then don't allow moving
        let childSuppressesMoving = false;
        this.column.getLeafColumns().forEach((column: Column) => {
            if (column.getColDef().suppressMovable || column.getColDef().lockPosition) {
                childSuppressesMoving = true;
            }
        });

        const result = childSuppressesMoving || this.gridOptionsService.is('suppressMovableColumns');

        return result;
    }
}
