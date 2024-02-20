"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderFilterCellCtrl = void 0;
var abstractHeaderCellCtrl_1 = require("../abstractCell/abstractHeaderCellCtrl");
var keyCode_1 = require("../../../constants/keyCode");
var column_1 = require("../../../entities/column");
var events_1 = require("../../../events");
var setLeftFeature_1 = require("../../../rendering/features/setLeftFeature");
var dom_1 = require("../../../utils/dom");
var icon_1 = require("../../../utils/icon");
var managedFocusFeature_1 = require("../../../widgets/managedFocusFeature");
var hoverFeature_1 = require("../hoverFeature");
var aria_1 = require("../../../utils/aria");
var function_1 = require("../../../utils/function");
var HeaderFilterCellCtrl = /** @class */ (function (_super) {
    __extends(HeaderFilterCellCtrl, _super);
    function HeaderFilterCellCtrl(column, beans, parentRowCtrl) {
        var _this = _super.call(this, column, beans, parentRowCtrl) || this;
        _this.iconCreated = false;
        _this.column = column;
        return _this;
    }
    HeaderFilterCellCtrl.prototype.setComp = function (comp, eGui, eButtonShowMainFilter, eFloatingFilterBody) {
        this.comp = comp;
        this.eButtonShowMainFilter = eButtonShowMainFilter;
        this.eFloatingFilterBody = eFloatingFilterBody;
        this.setGui(eGui);
        this.setupActive();
        this.setupWidth();
        this.setupLeft();
        this.setupHover();
        this.setupFocus();
        this.setupAria();
        this.setupFilterButton();
        this.setupUserComp();
        this.setupSyncWithFilter();
        this.setupUi();
        this.addManagedListener(this.eButtonShowMainFilter, 'click', this.showParentFilter.bind(this));
        this.setupFilterChangedListener();
        this.addManagedListener(this.column, column_1.Column.EVENT_COL_DEF_CHANGED, this.onColDefChanged.bind(this));
    };
    // empty abstract method
    HeaderFilterCellCtrl.prototype.resizeHeader = function () { };
    // empty abstract method
    HeaderFilterCellCtrl.prototype.moveHeader = function () { };
    HeaderFilterCellCtrl.prototype.setupActive = function () {
        var colDef = this.column.getColDef();
        var filterExists = !!colDef.filter;
        var floatingFilterExists = !!colDef.floatingFilter;
        this.active = filterExists && floatingFilterExists;
    };
    HeaderFilterCellCtrl.prototype.setupUi = function () {
        this.comp.setButtonWrapperDisplayed(!this.suppressFilterButton && this.active);
        this.comp.addOrRemoveBodyCssClass('ag-floating-filter-full-body', this.suppressFilterButton);
        this.comp.addOrRemoveBodyCssClass('ag-floating-filter-body', !this.suppressFilterButton);
        if (!this.active || this.iconCreated) {
            return;
        }
        var eMenuIcon = (0, icon_1.createIconNoSpan)('filter', this.gridOptionsService, this.column);
        if (eMenuIcon) {
            this.iconCreated = true;
            this.eButtonShowMainFilter.appendChild(eMenuIcon);
        }
    };
    HeaderFilterCellCtrl.prototype.setupFocus = function () {
        this.createManagedBean(new managedFocusFeature_1.ManagedFocusFeature(this.eGui, {
            shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
            onTabKeyDown: this.onTabKeyDown.bind(this),
            handleKeyDown: this.handleKeyDown.bind(this),
            onFocusIn: this.onFocusIn.bind(this)
        }));
    };
    HeaderFilterCellCtrl.prototype.setupAria = function () {
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        (0, aria_1.setAriaLabel)(this.eButtonShowMainFilter, localeTextFunc('ariaFilterMenuOpen', 'Open Filter Menu'));
    };
    HeaderFilterCellCtrl.prototype.onTabKeyDown = function (e) {
        var eDocument = this.gridOptionsService.getDocument();
        var activeEl = eDocument.activeElement;
        var wrapperHasFocus = activeEl === this.eGui;
        if (wrapperHasFocus) {
            return;
        }
        var nextFocusableEl = this.focusService.findNextFocusableElement(this.eGui, null, e.shiftKey);
        if (nextFocusableEl) {
            this.beans.headerNavigationService.scrollToColumn(this.column);
            e.preventDefault();
            nextFocusableEl.focus();
            return;
        }
        var nextFocusableColumn = this.findNextColumnWithFloatingFilter(e.shiftKey);
        if (!nextFocusableColumn) {
            return;
        }
        if (this.focusService.focusHeaderPosition({
            headerPosition: {
                headerRowIndex: this.getParentRowCtrl().getRowIndex(),
                column: nextFocusableColumn
            },
            event: e
        })) {
            e.preventDefault();
        }
    };
    HeaderFilterCellCtrl.prototype.findNextColumnWithFloatingFilter = function (backwards) {
        var columnModel = this.beans.columnModel;
        var nextCol = this.column;
        do {
            nextCol = backwards
                ? columnModel.getDisplayedColBefore(nextCol)
                : columnModel.getDisplayedColAfter(nextCol);
            if (!nextCol) {
                break;
            }
        } while (!nextCol.getColDef().filter || !nextCol.getColDef().floatingFilter);
        return nextCol;
    };
    HeaderFilterCellCtrl.prototype.handleKeyDown = function (e) {
        _super.prototype.handleKeyDown.call(this, e);
        var wrapperHasFocus = this.getWrapperHasFocus();
        switch (e.key) {
            case keyCode_1.KeyCode.UP:
            case keyCode_1.KeyCode.DOWN:
                if (!wrapperHasFocus) {
                    e.preventDefault();
                }
            case keyCode_1.KeyCode.LEFT:
            case keyCode_1.KeyCode.RIGHT:
                if (wrapperHasFocus) {
                    return;
                }
                e.stopPropagation();
            case keyCode_1.KeyCode.ENTER:
                if (wrapperHasFocus) {
                    if (this.focusService.focusInto(this.eGui)) {
                        e.preventDefault();
                    }
                }
                break;
            case keyCode_1.KeyCode.ESCAPE:
                if (!wrapperHasFocus) {
                    this.eGui.focus();
                }
        }
    };
    HeaderFilterCellCtrl.prototype.onFocusIn = function (e) {
        var isRelatedWithin = this.eGui.contains(e.relatedTarget);
        // when the focus is already within the component,
        // we default to the browser's behavior
        if (isRelatedWithin) {
            return;
        }
        var notFromHeaderWrapper = !!e.relatedTarget && !e.relatedTarget.classList.contains('ag-floating-filter');
        var fromWithinHeader = !!e.relatedTarget && (0, dom_1.isElementChildOfClass)(e.relatedTarget, 'ag-floating-filter');
        if (notFromHeaderWrapper && fromWithinHeader && e.target === this.eGui) {
            var lastFocusEvent = this.lastFocusEvent;
            var fromTab = !!(lastFocusEvent && lastFocusEvent.key === keyCode_1.KeyCode.TAB);
            if (lastFocusEvent && fromTab) {
                var shouldFocusLast = lastFocusEvent.shiftKey;
                this.focusService.focusInto(this.eGui, shouldFocusLast);
            }
        }
        var rowIndex = this.getRowIndex();
        this.beans.focusService.setFocusedHeader(rowIndex, this.column);
    };
    HeaderFilterCellCtrl.prototype.setupHover = function () {
        var _this = this;
        this.createManagedBean(new hoverFeature_1.HoverFeature([this.column], this.eGui));
        var listener = function () {
            if (!_this.gridOptionsService.get('columnHoverHighlight')) {
                return;
            }
            var hovered = _this.beans.columnHoverService.isHovered(_this.column);
            _this.comp.addOrRemoveCssClass('ag-column-hover', hovered);
        };
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_HOVER_CHANGED, listener);
        listener();
    };
    HeaderFilterCellCtrl.prototype.setupLeft = function () {
        var setLeftFeature = new setLeftFeature_1.SetLeftFeature(this.column, this.eGui, this.beans);
        this.createManagedBean(setLeftFeature);
    };
    HeaderFilterCellCtrl.prototype.setupFilterButton = function () {
        this.suppressFilterButton = !this.menuService.isFloatingFilterButtonEnabled(this.column);
        this.highlightFilterButtonWhenActive = !this.menuService.isLegacyMenuEnabled();
    };
    HeaderFilterCellCtrl.prototype.setupUserComp = function () {
        var _this = this;
        if (!this.active) {
            return;
        }
        var compDetails = this.beans.filterManager.getFloatingFilterCompDetails(this.column, function () { return _this.showParentFilter(); });
        if (compDetails) {
            this.setCompDetails(compDetails);
        }
    };
    HeaderFilterCellCtrl.prototype.setCompDetails = function (compDetails) {
        this.userCompDetails = compDetails;
        this.comp.setCompDetails(compDetails);
    };
    HeaderFilterCellCtrl.prototype.showParentFilter = function () {
        var eventSource = this.suppressFilterButton ? this.eFloatingFilterBody : this.eButtonShowMainFilter;
        this.menuService.showFilterMenu({
            column: this.column,
            buttonElement: eventSource,
            containerType: 'floatingFilter',
            positionBy: 'button'
        });
    };
    HeaderFilterCellCtrl.prototype.setupSyncWithFilter = function () {
        var _this = this;
        if (!this.active) {
            return;
        }
        var filterManager = this.beans.filterManager;
        var syncWithFilter = function (filterChangedEvent) {
            var compPromise = _this.comp.getFloatingFilterComp();
            if (!compPromise) {
                return;
            }
            compPromise.then(function (comp) {
                if (comp) {
                    var parentModel = filterManager.getCurrentFloatingFilterParentModel(_this.column);
                    comp.onParentModelChanged(parentModel, filterChangedEvent);
                }
            });
        };
        this.destroySyncListener = this.addManagedListener(this.column, column_1.Column.EVENT_FILTER_CHANGED, syncWithFilter);
        if (filterManager.isFilterActive(this.column)) {
            syncWithFilter(null);
        }
    };
    HeaderFilterCellCtrl.prototype.setupWidth = function () {
        var _this = this;
        var listener = function () {
            var width = "".concat(_this.column.getActualWidth(), "px");
            _this.comp.setWidth(width);
        };
        this.addManagedListener(this.column, column_1.Column.EVENT_WIDTH_CHANGED, listener);
        listener();
    };
    HeaderFilterCellCtrl.prototype.setupFilterChangedListener = function () {
        if (this.active) {
            this.destroyFilterChangedListener = this.addManagedListener(this.column, column_1.Column.EVENT_FILTER_CHANGED, this.updateFilterButton.bind(this));
            this.updateFilterButton();
        }
    };
    HeaderFilterCellCtrl.prototype.updateFilterButton = function () {
        if (!this.suppressFilterButton && this.comp) {
            var isFilterAllowed = this.beans.filterManager.isFilterAllowed(this.column);
            this.comp.setButtonWrapperDisplayed(isFilterAllowed);
            if (this.highlightFilterButtonWhenActive && isFilterAllowed) {
                this.eButtonShowMainFilter.classList.toggle('ag-filter-active', this.column.isFilterActive());
            }
        }
    };
    HeaderFilterCellCtrl.prototype.onColDefChanged = function () {
        var _this = this;
        var _a, _b;
        var wasActive = this.active;
        this.setupActive();
        var becomeActive = !wasActive && this.active;
        if (wasActive && !this.active) {
            (_a = this.destroySyncListener) === null || _a === void 0 ? void 0 : _a.call(this);
            (_b = this.destroyFilterChangedListener) === null || _b === void 0 ? void 0 : _b.call(this);
        }
        var newCompDetails = this.active
            ? this.beans.filterManager.getFloatingFilterCompDetails(this.column, function () { return _this.showParentFilter(); })
            : null;
        var compPromise = this.comp.getFloatingFilterComp();
        if (!compPromise || !newCompDetails) {
            this.updateCompDetails(newCompDetails, becomeActive);
        }
        else {
            compPromise.then(function (compInstance) {
                var _a;
                if (!compInstance || _this.beans.filterManager.areFilterCompsDifferent((_a = _this.userCompDetails) !== null && _a !== void 0 ? _a : null, newCompDetails)) {
                    _this.updateCompDetails(newCompDetails, becomeActive);
                }
                else {
                    _this.updateFloatingFilterParams(newCompDetails);
                }
            });
        }
    };
    HeaderFilterCellCtrl.prototype.updateCompDetails = function (compDetails, becomeActive) {
        if (!this.isAlive()) {
            return;
        }
        this.setCompDetails(compDetails);
        // filter button and UI can change based on params, so always want to update
        this.setupFilterButton();
        this.setupUi();
        if (becomeActive) {
            this.setupSyncWithFilter();
            this.setupFilterChangedListener();
        }
    };
    HeaderFilterCellCtrl.prototype.updateFloatingFilterParams = function (userCompDetails) {
        var _a;
        if (!userCompDetails) {
            return;
        }
        var params = userCompDetails.params;
        (_a = this.comp.getFloatingFilterComp()) === null || _a === void 0 ? void 0 : _a.then(function (floatingFilter) {
            var hasRefreshed = false;
            if ((floatingFilter === null || floatingFilter === void 0 ? void 0 : floatingFilter.refresh) && typeof floatingFilter.refresh === 'function') {
                var result = floatingFilter.refresh(params);
                // framework wrapper always implements optional methods, but returns null if no underlying method
                if (result !== null) {
                    hasRefreshed = true;
                }
            }
            if (!hasRefreshed && (floatingFilter === null || floatingFilter === void 0 ? void 0 : floatingFilter.onParamsUpdated) && typeof floatingFilter.onParamsUpdated === 'function') {
                var result = floatingFilter.onParamsUpdated(params);
                if (result !== null) {
                    (0, function_1.warnOnce)("Custom floating filter method 'onParamsUpdated' is deprecated. Use 'refresh' instead.");
                }
            }
        });
    };
    HeaderFilterCellCtrl.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.eButtonShowMainFilter = null;
        this.eFloatingFilterBody = null;
        this.userCompDetails = null;
        this.destroySyncListener = null;
        this.destroyFilterChangedListener = null;
    };
    return HeaderFilterCellCtrl;
}(abstractHeaderCellCtrl_1.AbstractHeaderCellCtrl));
exports.HeaderFilterCellCtrl = HeaderFilterCellCtrl;
