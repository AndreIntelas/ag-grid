"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreUtils = void 0;
var core_1 = require("@ag-grid-community/core");
var StoreUtils = /** @class */ (function (_super) {
    __extends(StoreUtils, _super);
    function StoreUtils() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StoreUtils.prototype.loadFromDatasource = function (p) {
        var storeParams = p.storeParams, parentBlock = p.parentBlock, parentNode = p.parentNode;
        var groupKeys = parentNode.getGroupKeys();
        if (!storeParams.datasource) {
            return;
        }
        var request = {
            startRow: p.startRow,
            endRow: p.endRow,
            rowGroupCols: storeParams.rowGroupCols,
            valueCols: storeParams.valueCols,
            pivotCols: storeParams.pivotCols,
            pivotMode: storeParams.pivotMode,
            groupKeys: groupKeys,
            filterModel: storeParams.filterModel,
            sortModel: storeParams.sortModel
        };
        var getRowsParams = {
            successCallback: p.successCallback,
            success: p.success,
            failCallback: p.failCallback,
            fail: p.fail,
            request: request,
            parentNode: p.parentNode,
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.context
        };
        window.setTimeout(function () {
            if (!storeParams.datasource || !parentBlock.isAlive()) {
                // failCallback() is important, to reduce the 'RowNodeBlockLoader.activeBlockLoadsCount' count
                p.failCallback();
                return;
            }
            storeParams.datasource.getRows(getRowsParams);
        }, 0);
    };
    StoreUtils.prototype.getChildStore = function (keys, currentCache, findNodeFunc) {
        if (core_1._.missingOrEmpty(keys)) {
            return currentCache;
        }
        var nextKey = keys[0];
        var nextNode = findNodeFunc(nextKey);
        if (nextNode) {
            var keyListForNextLevel = keys.slice(1, keys.length);
            var nextStore = nextNode.childStore;
            return nextStore ? nextStore.getChildStore(keyListForNextLevel) : null;
        }
        return null;
    };
    StoreUtils.prototype.isServerRefreshNeeded = function (parentRowNode, rowGroupCols, params) {
        if (params.valueColChanged || params.secondaryColChanged) {
            return true;
        }
        var level = parentRowNode.level + 1;
        var grouping = level < rowGroupCols.length;
        var leafNodes = !grouping;
        if (leafNodes) {
            return true;
        }
        var colIdThisGroup = rowGroupCols[level].id;
        var actionOnThisGroup = params.changedColumns.indexOf(colIdThisGroup) > -1;
        if (actionOnThisGroup) {
            return true;
        }
        var allCols = this.columnModel.getAllGridColumns();
        var affectedGroupCols = allCols
            // find all impacted cols which also a group display column
            .filter(function (col) { return col.getColDef().showRowGroup && params.changedColumns.includes(col.getId()); })
            .map(function (col) { return col.getColDef().showRowGroup; })
            // if displaying all groups, or displaying the effected col for this group, refresh
            .some(function (group) { return group === true || group === colIdThisGroup; });
        return affectedGroupCols;
    };
    StoreUtils.prototype.getServerSideInitialRowCount = function () {
        var rowCount = this.gridOptionsService.getNum('serverSideInitialRowCount');
        if (typeof rowCount === 'number' && rowCount > 0) {
            return rowCount;
        }
        return 1;
    };
    StoreUtils.prototype.assertRowModelIsServerSide = function (key) {
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            core_1._.doOnce(function () { return console.warn("AG Grid: The '" + key + "' property can only be used with the Server Side Row Model."); }, key);
            return false;
        }
        return true;
    };
    StoreUtils.prototype.assertNotTreeData = function (key) {
        if (this.gridOptionsService.is('treeData')) {
            core_1._.doOnce(function () { return console.warn("AG Grid: The '" + key + "' property cannot be used while using tree data."); }, key + '_TreeData');
            return false;
        }
        return true;
    };
    StoreUtils.prototype.isServerSideSortAllLevels = function () {
        return this.gridOptionsService.is('serverSideSortAllLevels') && this.assertRowModelIsServerSide('serverSideSortAllLevels');
    };
    StoreUtils.prototype.isServerSideFilterAllLevels = function () {
        return this.gridOptionsService.is('serverSideFilterAllLevels') && this.assertRowModelIsServerSide('serverSideFilterAllLevels');
    };
    StoreUtils.prototype.isServerSideSortOnServer = function () {
        return this.gridOptionsService.is('serverSideSortOnServer') && this.assertRowModelIsServerSide('serverSideSortOnServer') && this.assertNotTreeData('serverSideSortOnServer');
    };
    StoreUtils.prototype.isServerSideFilterOnServer = function () {
        return this.gridOptionsService.is('serverSideFilterOnServer') && this.assertRowModelIsServerSide('serverSideFilterOnServer') && this.assertNotTreeData('serverSideFilterOnServer');
    };
    __decorate([
        core_1.Autowired('columnApi')
    ], StoreUtils.prototype, "columnApi", void 0);
    __decorate([
        core_1.Autowired('columnModel')
    ], StoreUtils.prototype, "columnModel", void 0);
    __decorate([
        core_1.Autowired('gridApi')
    ], StoreUtils.prototype, "gridApi", void 0);
    StoreUtils = __decorate([
        core_1.Bean('ssrmStoreUtils')
    ], StoreUtils);
    return StoreUtils;
}(core_1.BeanStub));
exports.StoreUtils = StoreUtils;
