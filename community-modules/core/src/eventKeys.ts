export class Events {

    /** Everything has changed with the columns. Either complete new set of columns set, or user called applyColumnState() */
    public static EVENT_COLUMN_EVERYTHING_CHANGED: 'columnEverythingChanged' = 'columnEverythingChanged';

    /** User has set in new columns. */
    public static EVENT_NEW_COLUMNS_LOADED: 'newColumnsLoaded' = 'newColumnsLoaded';

    /** The pivot mode flag was changed */
    public static EVENT_COLUMN_PIVOT_MODE_CHANGED: 'columnPivotModeChanged' = 'columnPivotModeChanged';

    /** Exceeded the pivot limit when generating columns */
    public static EVENT_PIVOT_MAX_COLUMNS_EXCEEDED: 'pivotMaxColumnsExceeded' = 'pivotMaxColumnsExceeded';

    /** A row group column was added, removed or order changed. */
    public static EVENT_COLUMN_ROW_GROUP_CHANGED: 'columnRowGroupChanged' = 'columnRowGroupChanged';

    /** expandAll / collapseAll was called from the api. */
    public static EVENT_EXPAND_COLLAPSE_ALL: 'expandOrCollapseAll' = 'expandOrCollapseAll';

    /** A pivot column was added, removed or order changed. */
    public static EVENT_COLUMN_PIVOT_CHANGED: 'columnPivotChanged' = 'columnPivotChanged';

    /** The list of grid columns has changed. */
    public static EVENT_GRID_COLUMNS_CHANGED: 'gridColumnsChanged' = 'gridColumnsChanged';

    /** A value column was added, removed or agg function was changed. */
    public static EVENT_COLUMN_VALUE_CHANGED: 'columnValueChanged' = 'columnValueChanged';

    /** A column was moved */
    public static EVENT_COLUMN_MOVED: 'columnMoved' = 'columnMoved';

    /** One or more columns was shown / hidden */
    public static EVENT_COLUMN_VISIBLE: 'columnVisible' = 'columnVisible';

    /** One or more columns was pinned / unpinned*/
    public static EVENT_COLUMN_PINNED: 'columnPinned' = 'columnPinned';

    /** A column group was opened / closed */
    public static EVENT_COLUMN_GROUP_OPENED: 'columnGroupOpened' = 'columnGroupOpened';

    /** One or more columns was resized. If just one, the column in the event is set. */
    public static EVENT_COLUMN_RESIZED: 'columnResized' = 'columnResized';

    /** The list of displayed columns has changed, can result from columns open / close, column move, pivot, group, etc */
    public static EVENT_DISPLAYED_COLUMNS_CHANGED: 'displayedColumnsChanged' = 'displayedColumnsChanged';

    /** The grid option related to suppressing movable columns has changed */
    public static EVENT_SUPPRESS_COLUMN_MOVE_CHANGED: 'suppressMovableColumns' = 'suppressMovableColumns';

    /** The grid option related to suppressing column group selection has changed */
    public static EVENT_SUPPRESS_MENU_HIDE_CHANGED: 'suppressMenuHide' = 'suppressMenuHide';

    /** The grid option related to suppressing movable columns has changed */
    public static EVENT_SUPPRESS_FIELD_DOT_NOTATION: 'suppressFieldDotNotation' = 'suppressFieldDotNotation';

    /** The list of virtual columns has changed, results from viewport changing */
    public static EVENT_VIRTUAL_COLUMNS_CHANGED: 'virtualColumnsChanged' = 'virtualColumnsChanged';

    /** Column header mouse over */
    public static EVENT_COLUMN_HEADER_MOUSE_OVER: 'columnHeaderMouseOver' = 'columnHeaderMouseOver';

    /** Column header mouse leave */
    public static EVENT_COLUMN_HEADER_MOUSE_LEAVE: 'columnHeaderMouseLeave' = 'columnHeaderMouseLeave';

    /** Column header clicked */
    public static EVENT_COLUMN_HEADER_CLICKED: 'columnHeaderClicked' = 'columnHeaderClicked';

    /** Column header context menu event, such as right-click or context menu key press */
    public static EVENT_COLUMN_HEADER_CONTEXT_MENU: 'columnHeaderContextMenu' = 'columnHeaderContextMenu';

    /** Async Transactions Executed */
    public static EVENT_ASYNC_TRANSACTIONS_FLUSHED: 'asyncTransactionsFlushed' = 'asyncTransactionsFlushed';

    /** A row group was opened / closed */
    public static EVENT_ROW_GROUP_OPENED: 'rowGroupOpened' = 'rowGroupOpened';

    /** Client-Side Row Model only. The client has updated data for the grid */
    public static EVENT_ROW_DATA_UPDATED: 'rowDataUpdated' = 'rowDataUpdated';

    /** The client has set new floating data into the grid */
    public static EVENT_PINNED_ROW_DATA_CHANGED: 'pinnedRowDataChanged' = 'pinnedRowDataChanged';

    /** Range selection has changed */
    public static EVENT_RANGE_SELECTION_CHANGED: 'rangeSelectionChanged' = 'rangeSelectionChanged';

    /** Chart was created */
    public static EVENT_CHART_CREATED: 'chartCreated' = 'chartCreated';

    /** Chart Range selection has changed */
    public static EVENT_CHART_RANGE_SELECTION_CHANGED: 'chartRangeSelectionChanged' = 'chartRangeSelectionChanged';

    /** Chart Options have changed */
    public static EVENT_CHART_OPTIONS_CHANGED: 'chartOptionsChanged' = 'chartOptionsChanged';

    /** Chart was destroyed */
    public static EVENT_CHART_DESTROYED: 'chartDestroyed' = 'chartDestroyed';

    /** For when the tool panel is shown / hidden */
    public static EVENT_TOOL_PANEL_VISIBLE_CHANGED: 'toolPanelVisibleChanged' = 'toolPanelVisibleChanged';
    public static EVENT_TOOL_PANEL_SIZE_CHANGED: 'toolPanelSizeChanged' = 'toolPanelSizeChanged';

    public static EVENT_COLUMN_PANEL_ITEM_DRAG_START: 'columnPanelItemDragStart' = 'columnPanelItemDragStart';
    public static EVENT_COLUMN_PANEL_ITEM_DRAG_END: 'columnPanelItemDragEnd' = 'columnPanelItemDragEnd';

    /** Model was updated - grid updates the drawn rows when this happens */
    public static EVENT_MODEL_UPDATED: 'modelUpdated' = 'modelUpdated';

    public static EVENT_CUT_START: 'cutStart' = 'cutStart';
    public static EVENT_CUT_END: 'cutEnd' = 'cutEnd';

    public static EVENT_PASTE_START: 'pasteStart' = 'pasteStart';
    public static EVENT_PASTE_END: 'pasteEnd' = 'pasteEnd';

    public static EVENT_FILL_START: 'fillStart' = 'fillStart';
    public static EVENT_FILL_END: 'fillEnd' = 'fillEnd';

    public static EVENT_RANGE_DELETE_START: 'rangeDeleteStart' = 'rangeDeleteStart';
    public static EVENT_RANGE_DELETE_END: 'rangeDeleteEnd' = 'rangeDeleteEnd';

    /** Undo operation has started. */
    public static EVENT_UNDO_STARTED: 'undoStarted' = 'undoStarted';
    /** Undo operation has ended. */
    public static EVENT_UNDO_ENDED: 'undoEnded' = 'undoEnded';
    /** Redo operation has started. */
    public static EVENT_REDO_STARTED: 'redoStarted' = 'redoStarted';
    /** Redo operation has ended. */
    public static EVENT_REDO_ENDED: 'redoEnded' = 'redoEnded';

    public static EVENT_KEY_SHORTCUT_CHANGED_CELL_START: 'keyShortcutChangedCellStart' = 'keyShortcutChangedCellStart';
    public static EVENT_KEY_SHORTCUT_CHANGED_CELL_END: 'keyShortcutChangedCellEnd' = 'keyShortcutChangedCellEnd';

    public static EVENT_CELL_CLICKED: 'cellClicked' = 'cellClicked';
    public static EVENT_CELL_DOUBLE_CLICKED: 'cellDoubleClicked' = 'cellDoubleClicked';
    public static EVENT_CELL_MOUSE_DOWN: 'cellMouseDown' = 'cellMouseDown';
    public static EVENT_CELL_CONTEXT_MENU: 'cellContextMenu' = 'cellContextMenu';
    public static EVENT_CELL_VALUE_CHANGED: 'cellValueChanged' = 'cellValueChanged';
    public static EVENT_CELL_EDIT_REQUEST: 'cellEditRequest' = 'cellEditRequest';
    public static EVENT_ROW_VALUE_CHANGED: 'rowValueChanged' = 'rowValueChanged';
    public static EVENT_CELL_FOCUSED: 'cellFocused' = 'cellFocused';
    public static EVENT_CELL_FOCUS_CLEARED: 'cellFocusCleared' = 'cellFocusCleared';
    public static EVENT_FULL_WIDTH_ROW_FOCUSED: 'fullWidthRowFocused' = 'fullWidthRowFocused';
    public static EVENT_ROW_SELECTED: 'rowSelected' = 'rowSelected';
    public static EVENT_SELECTION_CHANGED: 'selectionChanged' = 'selectionChanged';

    public static EVENT_TOOLTIP_SHOW: 'tooltipShow' = 'tooltipShow';
    public static EVENT_TOOLTIP_HIDE: 'tooltipHide' = 'tooltipHide';

    public static EVENT_CELL_KEY_DOWN: 'cellKeyDown' = 'cellKeyDown';

    public static EVENT_CELL_MOUSE_OVER: 'cellMouseOver' = 'cellMouseOver';
    public static EVENT_CELL_MOUSE_OUT: 'cellMouseOut' = 'cellMouseOut';

    /** 2 events for filtering. The grid LISTENS for filterChanged and afterFilterChanged */
    public static EVENT_FILTER_CHANGED: 'filterChanged' = 'filterChanged';

    /** Filter was change but not applied. Only useful if apply buttons are used in filters. */
    public static EVENT_FILTER_MODIFIED: 'filterModified' = 'filterModified';
    public static EVENT_FILTER_OPENED: 'filterOpened' = 'filterOpened';

    public static EVENT_ADVANCED_FILTER_BUILDER_VISIBLE_CHANGED: 'advancedFilterBuilderVisibleChanged' = 'advancedFilterBuilderVisibleChanged';

    public static EVENT_SORT_CHANGED: 'sortChanged' = 'sortChanged';

    /** A row was removed from the dom, for any reason. Use to clean up resources (if any) used by the row. */
    public static EVENT_VIRTUAL_ROW_REMOVED: 'virtualRowRemoved' = 'virtualRowRemoved';

    public static EVENT_ROW_CLICKED: 'rowClicked' = 'rowClicked';
    public static EVENT_ROW_DOUBLE_CLICKED: 'rowDoubleClicked' = 'rowDoubleClicked';

    /** Gets called once after the grid has finished initialising. */
    public static EVENT_GRID_READY: 'gridReady' = 'gridReady';
    /** Called once when the grid is about to get destroyed. */
    public static EVENT_GRID_PRE_DESTROYED: 'gridPreDestroyed' = 'gridPreDestroyed';
    /** Width of height of the main grid div has changed. Grid listens for this and does layout of grid if it's
     * changed, so always filling the space it was given. */
    public static EVENT_GRID_SIZE_CHANGED: 'gridSizeChanged' = 'gridSizeChanged';
    /** The indexes of the rows rendered has changed, eg user has scrolled to a new vertical position. */
    public static EVENT_VIEWPORT_CHANGED: 'viewportChanged' = 'viewportChanged';
    /* The width of the scrollbar has been calculated */
    public static EVENT_SCROLLBAR_WIDTH_CHANGED: 'scrollbarWidthChanged' = 'scrollbarWidthChanged';
    /** Rows were rendered for the first time (ie on async data load). */
    public static EVENT_FIRST_DATA_RENDERED: 'firstDataRendered' = 'firstDataRendered';
    /** A column drag has started, either resizing a column or moving a column. */
    public static EVENT_DRAG_STARTED: 'dragStarted' = 'dragStarted';
    /** A column drag has stopped */
    public static EVENT_DRAG_STOPPED: 'dragStopped' = 'dragStopped';

    public static EVENT_CHECKBOX_CHANGED: 'checkboxChanged' = 'checkboxChanged';

    public static EVENT_ROW_EDITING_STARTED: 'rowEditingStarted' = 'rowEditingStarted';
    public static EVENT_ROW_EDITING_STOPPED: 'rowEditingStopped' = 'rowEditingStopped';

    public static EVENT_CELL_EDITING_STARTED: 'cellEditingStarted' = 'cellEditingStarted';
    public static EVENT_CELL_EDITING_STOPPED: 'cellEditingStopped' = 'cellEditingStopped';

    /** Main body of grid has scrolled, either horizontally or vertically */
    public static EVENT_BODY_SCROLL: 'bodyScroll' = 'bodyScroll';

    /** Main body of the grid has stopped scrolling, either horizontally or vertically */
    public static EVENT_BODY_SCROLL_END: 'bodyScrollEnd' = 'bodyScrollEnd';

    public static EVENT_HEIGHT_SCALE_CHANGED: 'heightScaleChanged' = 'heightScaleChanged';

    /** The displayed page for pagination has changed. For example the data was filtered or sorted,
     * or the user has moved to a different page. */
    public static EVENT_PAGINATION_CHANGED: 'paginationChanged' = 'paginationChanged';

    /** Only used by React, Angular, Web Components and VueJS AG Grid components
     * (not used if doing plain JavaScript). If the grid receives changes due
     * to bound properties, this event fires after the grid has finished processing the change. */
    public static EVENT_COMPONENT_STATE_CHANGED: 'componentStateChanged' = 'componentStateChanged';

    /** Only used by the SSRM, called when the grid has no more rows to refresh */
    public static EVENT_STORE_REFRESHED: 'storeRefreshed' = 'storeRefreshed';

    public static EVENT_STATE_UPDATED: 'stateUpdated' = 'stateUpdated';

    /** The visibility of the column menu has changed. */
    public static EVENT_COLUMN_MENU_VISIBLE_CHANGED: 'columnMenuVisibleChanged' = 'columnMenuVisibleChanged';

    /** The visibility of the context menu has changed. */
    public static EVENT_CONTEXT_MENU_VISIBLE_CHANGED: 'contextMenuVisibleChanged' = 'contextMenuVisibleChanged';

    /*****************************  INTERNAL EVENTS: START ******************************************* */

    /** Please remember to add to ComponentUtil.EXCLUDED_INTERNAL_EVENTS to not have these events exposed to framework components. */

    /** All items from here down are used internally by the grid, not intended for external use. */
    // not documented, either experimental, or we just don't want users using an depending on them
    public static EVENT_BODY_HEIGHT_CHANGED: 'bodyHeightChanged' = 'bodyHeightChanged';
    public static EVENT_COLUMN_CONTAINER_WIDTH_CHANGED: 'columnContainerWidthChanged' = 'columnContainerWidthChanged';
    public static EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED: 'displayedColumnsWidthChanged' = 'displayedColumnsWidthChanged';
    public static EVENT_SCROLL_VISIBILITY_CHANGED: 'scrollVisibilityChanged' = 'scrollVisibilityChanged';
    public static EVENT_COLUMN_HOVER_CHANGED: 'columnHoverChanged' = 'columnHoverChanged';
    public static EVENT_FLASH_CELLS: 'flashCells' = 'flashCells';
    public static EVENT_PAGINATION_PIXEL_OFFSET_CHANGED: 'paginationPixelOffsetChanged' = 'paginationPixelOffsetChanged';
    public static EVENT_DISPLAYED_ROWS_CHANGED: 'displayedRowsChanged' = 'displayedRowsChanged';

    public static EVENT_LEFT_PINNED_WIDTH_CHANGED: 'leftPinnedWidthChanged' = 'leftPinnedWidthChanged';
    public static EVENT_RIGHT_PINNED_WIDTH_CHANGED: 'rightPinnedWidthChanged' = 'rightPinnedWidthChanged';

    public static EVENT_ROW_CONTAINER_HEIGHT_CHANGED: 'rowContainerHeightChanged' = 'rowContainerHeightChanged';
    public static EVENT_HEADER_HEIGHT_CHANGED: 'headerHeightChanged' = 'headerHeightChanged';
    public static EVENT_COLUMN_HEADER_HEIGHT_CHANGED: 'columnHeaderHeightChanged' = 'columnHeaderHeightChanged';

    public static EVENT_ROW_DRAG_ENTER: 'rowDragEnter' = 'rowDragEnter';
    public static EVENT_ROW_DRAG_MOVE: 'rowDragMove' = 'rowDragMove';
    public static EVENT_ROW_DRAG_LEAVE: 'rowDragLeave' = 'rowDragLeave';
    public static EVENT_ROW_DRAG_END: 'rowDragEnd' = 'rowDragEnd';

    // environment
    public static EVENT_GRID_STYLES_CHANGED: 'gridStylesChanged' = 'gridStylesChanged';

    public static EVENT_STORE_UPDATED: 'storeUpdated' = 'storeUpdated';

    public static EVENT_FILTER_DESTROYED: 'filterDestroyed' = 'filterDestroyed';

    public static EVENT_ROW_DATA_UPDATE_STARTED: 'rowDataUpdateStarted' = 'rowDataUpdateStarted';
    public static EVENT_ROW_COUNT_READY: 'rowCountReady' = 'rowCountReady';

    // Advanced Filters
    public static EVENT_ADVANCED_FILTER_ENABLED_CHANGED: 'advancedFilterEnabledChanged' = 'advancedFilterEnabledChanged';
    public static EVENT_DATA_TYPES_INFERRED: 'dataTypesInferred' = 'dataTypesInferred';

    // Widgets
    public static EVENT_FIELD_VALUE_CHANGED: 'fieldValueChanged' = 'fieldValueChanged';
    public static EVENT_FIELD_PICKER_VALUE_SELECTED: 'fieldPickerValueSelected' = 'fieldPickerValueSelected';

    public static EVENT_SIDE_BAR_UPDATED: 'sideBarUpdated' = 'sideBarUpdated';

    /*****************************  INTERNAL EVENTS: END ******************************************* */
}

export type EventsType = {
    [key in keyof typeof Events]: (typeof Events)[key] extends string ? (typeof Events)[key] : never;
}[keyof typeof Events];