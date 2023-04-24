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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import { Autowired, BeanStub, PostConstruct, PreDestroy } from "@ag-grid-community/core";
import { LazyBlockLoader } from "./lazyBlockLoader";
import { MultiIndexMap } from "./multiIndexMap";
;
var LazyCache = /** @class */ (function (_super) {
    __extends(LazyCache, _super);
    function LazyCache(store, numberOfRows, storeParams) {
        var _this = _super.call(this) || this;
        /**
         * Indicates whether this is still the live dataset for this store (used for ignoring old requests after purge)
         */
        _this.live = true;
        _this.store = store;
        _this.numberOfRows = numberOfRows;
        _this.isLastRowKnown = false;
        _this.storeParams = storeParams;
        return _this;
    }
    LazyCache.prototype.init = function () {
        // initiate the node map to be indexed at 'index', 'id' and 'node' for quick look-up.
        // it's important id isn't first, as stub nodes overwrite each-other, and the first index is
        // used for iteration.
        this.nodeMap = new MultiIndexMap('index', 'id', 'node');
        this.nodeDisplayIndexMap = new Map();
        this.nodesToRefresh = new Set();
        this.defaultNodeIdPrefix = this.blockUtils.createNodeIdPrefix(this.store.getParentNode());
        this.rowLoader = this.createManagedBean(new LazyBlockLoader(this, this.store.getParentNode(), this.storeParams));
        this.getRowIdFunc = this.gridOptionsService.getRowIdFunc();
        this.isMasterDetail = this.gridOptionsService.isMasterDetail();
    };
    LazyCache.prototype.destroyRowNodes = function () {
        var _this = this;
        this.numberOfRows = 0;
        this.nodeMap.forEach(function (node) { return _this.blockUtils.destroyRowNode(node.node); });
        this.nodeMap.clear();
        this.nodeDisplayIndexMap.clear();
        this.nodesToRefresh.clear();
        this.live = false;
    };
    /**
     * Get the row node for a specific display index from this store
     * @param displayIndex the display index of the node to find
     * @returns undefined if the node is not in the store bounds, otherwise will always return a node
     */
    LazyCache.prototype.getRowByDisplayIndex = function (displayIndex) {
        var _a, _b, _c, _d;
        // if index isn't in store, nothing to return
        if (!this.store.isDisplayIndexInStore(displayIndex)) {
            return undefined;
        }
        // first try to directly look this node up in the display index map
        var node = this.nodeDisplayIndexMap.get(displayIndex);
        if (node) {
            // if we have the node, check if it needs refreshed when rendered
            if (node.stub || node.__needsRefreshWhenVisible) {
                this.rowLoader.queueLoadCheck();
            }
            return node;
        }
        // next check if this is the first row, if so return a stub node
        // this is a performance optimisation, as it is the most common scenario
        // and enables the node - 1 check to kick in more often.
        if (displayIndex === this.store.getDisplayIndexStart()) {
            return this.createStubNode(0, displayIndex);
        }
        // check if the row immediately prior is available in the store
        var contiguouslyPreviousNode = this.nodeDisplayIndexMap.get(displayIndex - 1);
        if (contiguouslyPreviousNode) {
            // if previous row is master detail, and expanded, this node must be detail
            if (this.isMasterDetail && contiguouslyPreviousNode.master && contiguouslyPreviousNode.expanded) {
                return contiguouslyPreviousNode.detailNode;
            }
            // if previous row is expanded group, this node will belong to that group.
            if (contiguouslyPreviousNode.expanded && ((_a = contiguouslyPreviousNode.childStore) === null || _a === void 0 ? void 0 : _a.isDisplayIndexInStore(displayIndex))) {
                return (_b = contiguouslyPreviousNode.childStore) === null || _b === void 0 ? void 0 : _b.getRowUsingDisplayIndex(displayIndex);
            }
            // otherwise, row must be a stub node
            var lazyCacheNode = this.nodeMap.getBy('node', contiguouslyPreviousNode);
            return this.createStubNode(lazyCacheNode.index + 1, displayIndex);
        }
        var adjacentNodes = this.getSurroundingNodesByDisplayIndex(displayIndex);
        // if no bounds skipped includes this, calculate from end index
        if (adjacentNodes == null) {
            var storeIndexFromEndIndex_1 = this.store.getRowCount() - (this.store.getDisplayIndexEnd() - displayIndex);
            return this.createStubNode(storeIndexFromEndIndex_1, displayIndex);
        }
        var previousNode = adjacentNodes.previousNode, nextNode = adjacentNodes.nextNode;
        // if the node before this node is expanded, this node might be a child of that node
        if (previousNode && previousNode.expanded && ((_c = previousNode.childStore) === null || _c === void 0 ? void 0 : _c.isDisplayIndexInStore(displayIndex))) {
            return (_d = previousNode.childStore) === null || _d === void 0 ? void 0 : _d.getRowUsingDisplayIndex(displayIndex);
        }
        // if we have the node after this node, we can calculate the store index of this node by the difference
        // in display indexes between the two nodes.
        if (nextNode) {
            var nextSimpleRowStoreIndex = this.nodeMap.getBy('node', nextNode);
            var displayIndexDiff = nextNode.rowIndex - displayIndex;
            var newStoreIndex = nextSimpleRowStoreIndex.index - displayIndexDiff;
            return this.createStubNode(newStoreIndex, displayIndex);
        }
        // if no next node, calculate from end index of this store
        var storeIndexFromEndIndex = this.store.getRowCount() - (this.store.getDisplayIndexEnd() - displayIndex);
        return this.createStubNode(storeIndexFromEndIndex, displayIndex);
    };
    /**
     * Used for creating and positioning a stub node without firing a store updated event
     */
    LazyCache.prototype.createStubNode = function (storeIndex, displayIndex) {
        var _this = this;
        // bounds are acquired before creating the node, as otherwise it'll use it's own empty self to calculate
        var rowBounds = this.store.getRowBounds(displayIndex);
        var newNode = this.createRowAtIndex(storeIndex, null, function (node) {
            node.setRowIndex(displayIndex);
            node.setRowTop(rowBounds.rowTop);
            _this.nodeDisplayIndexMap.set(displayIndex, node);
        });
        this.rowLoader.queueLoadCheck();
        return newNode;
    };
    /**
     * @param index The row index relative to this store
     * @returns A rowNode at the given store index
     */
    LazyCache.prototype.getRowByStoreIndex = function (index) {
        var _a;
        return (_a = this.nodeMap.getBy('index', index)) === null || _a === void 0 ? void 0 : _a.node;
    };
    /**
     * Given a number of rows, skips through the given sequence & row top reference (using default row height)
     * @param numberOfRowsToSkip number of rows to skip over in the given sequence
     * @param displayIndexSeq the sequence in which to skip
     * @param nextRowTop the row top reference in which to skip
     */
    LazyCache.prototype.skipDisplayIndexes = function (numberOfRowsToSkip, displayIndexSeq, nextRowTop) {
        if (numberOfRowsToSkip === 0) {
            return;
        }
        var defaultRowHeight = this.gridOptionsService.getRowHeightAsNumber();
        // these are recorded so that the previous node can be found more quickly when a node is missing
        this.skippedDisplayIndexes.push({
            from: displayIndexSeq.peek(),
            to: displayIndexSeq.peek() + numberOfRowsToSkip
        });
        displayIndexSeq.skip(numberOfRowsToSkip);
        nextRowTop.value += numberOfRowsToSkip * defaultRowHeight;
    };
    /**
     * @param displayIndexSeq the number sequence for generating the display index of each row
     * @param nextRowTop an object containing the next row top value intended to be modified by ref per row
     */
    LazyCache.prototype.setDisplayIndexes = function (displayIndexSeq, nextRowTop) {
        // Create a map of display index nodes for access speed
        this.nodeDisplayIndexMap.clear();
        this.skippedDisplayIndexes = [];
        // create an object indexed by store index, as this will sort all of the nodes when we iterate
        // the object
        var orderedMap = {};
        this.nodeMap.forEach(function (lazyNode) {
            orderedMap[lazyNode.index] = lazyNode.node;
        });
        var lastIndex = -1;
        // iterate over the nodes in order, setting the display index on each node. When display indexes
        // are skipped, they're added to the skippedDisplayIndexes array
        for (var stringIndex in orderedMap) {
            var node = orderedMap[stringIndex];
            var numericIndex = Number(stringIndex);
            // if any nodes aren't currently in the store, skip the display indexes too
            var numberOfRowsToSkip_1 = (numericIndex - 1) - lastIndex;
            this.skipDisplayIndexes(numberOfRowsToSkip_1, displayIndexSeq, nextRowTop);
            // set this nodes index and row top
            this.blockUtils.setDisplayIndex(node, displayIndexSeq, nextRowTop);
            this.nodeDisplayIndexMap.set(node.rowIndex, node);
            var passedRows = displayIndexSeq.peek() - node.rowIndex;
            if (passedRows > 1) {
                this.skippedDisplayIndexes.push({
                    from: node.rowIndex + 1,
                    to: displayIndexSeq.peek()
                });
            }
            // store this index for skipping after this
            lastIndex = numericIndex;
        }
        // need to skip rows until the end of this store
        var numberOfRowsToSkip = (this.numberOfRows - 1) - lastIndex;
        this.skipDisplayIndexes(numberOfRowsToSkip, displayIndexSeq, nextRowTop);
        // this is not terribly efficient, and could probs be improved
        this.purgeExcessRows();
    };
    LazyCache.prototype.getRowCount = function () {
        return this.numberOfRows;
    };
    LazyCache.prototype.setRowCount = function (rowCount, isLastRowIndexKnown) {
        if (rowCount < 0) {
            throw new Error('AG Grid: setRowCount can only accept a positive row count.');
        }
        this.numberOfRows = rowCount;
        if (isLastRowIndexKnown != null) {
            this.isLastRowKnown = isLastRowIndexKnown;
            if (isLastRowIndexKnown === false) {
                this.numberOfRows += 1;
            }
        }
        this.fireStoreUpdatedEvent();
    };
    LazyCache.prototype.getNodes = function () {
        return this.nodeMap;
    };
    LazyCache.prototype.getNodeCachedByDisplayIndex = function (displayIndex) {
        var _a;
        return (_a = this.nodeDisplayIndexMap.get(displayIndex)) !== null && _a !== void 0 ? _a : null;
    };
    LazyCache.prototype.getNodesToRefresh = function () {
        return this.nodesToRefresh;
    };
    /**
     * @returns the previous and next loaded row nodes surrounding the given display index
     */
    LazyCache.prototype.getSurroundingNodesByDisplayIndex = function (displayIndex) {
        // iterate over the skipped display indexes to find the bound this display index belongs to
        for (var i in this.skippedDisplayIndexes) {
            var skippedRowBound = this.skippedDisplayIndexes[i];
            if (skippedRowBound.from <= displayIndex && skippedRowBound.to >= displayIndex) {
                // take the node before and after the boundary and return those
                var previousNode = this.nodeDisplayIndexMap.get(skippedRowBound.from - 1);
                var nextNode = this.nodeDisplayIndexMap.get(skippedRowBound.to + 1);
                return { previousNode: previousNode, nextNode: nextNode };
            }
        }
        return null;
    };
    /**
     * Get or calculate the display index for a given store index
     * @param storeIndex the rows index within this store
     * @returns the rows visible display index relative to the grid
     */
    LazyCache.prototype.getDisplayIndexFromStoreIndex = function (storeIndex) {
        var nodesAfterThis = this.nodeMap.filter(function (lazyNode) { return lazyNode.index > storeIndex; });
        if (nodesAfterThis.length === 0) {
            return this.store.getDisplayIndexEnd() - (this.numberOfRows - storeIndex);
        }
        var nextNode;
        for (var i = 0; i < nodesAfterThis.length; i++) {
            var lazyNode = nodesAfterThis[i];
            if (nextNode == null || nextNode.index > lazyNode.index) {
                nextNode = lazyNode;
            }
        }
        var nextDisplayIndex = nextNode.node.rowIndex;
        var storeIndexDiff = nextNode.index - storeIndex;
        return nextDisplayIndex - storeIndexDiff;
    };
    /**
     * Creates a new row and inserts it at the given index
     * @param atStoreIndex the node index relative to this store
     * @param data the data object to populate the node with
     * @returns the new row node
     */
    LazyCache.prototype.createRowAtIndex = function (atStoreIndex, data, createNodeCallback) {
        // make sure an existing node isn't being overwritten
        var lazyNode = this.nodeMap.getBy('index', atStoreIndex);
        // if node already exists, update it or destroy it
        if (lazyNode) {
            var node = lazyNode.node;
            this.nodesToRefresh.delete(node);
            node.__needsRefreshWhenVisible = false;
            // if the node is the same, just update the content
            if (this.doesNodeMatch(data, node)) {
                this.blockUtils.updateDataIntoRowNode(node, data);
                return node;
            }
            // if there's no id and this is an open group, protect this node from changes
            if (this.getRowIdFunc == null && node.group && node.expanded) {
                return node;
            }
            // destroy the old node, might be worth caching state here
            this.destroyRowAtIndex(atStoreIndex);
        }
        // if the node already exists elsewhere, update it and move it to the new location
        if (data && this.getRowIdFunc != null) {
            var id = this.getRowId(data);
            var lazyNode_1 = this.nodeMap.getBy('id', id);
            if (lazyNode_1) {
                // delete old lazy node so we can insert it at different location
                this.nodeMap.delete(lazyNode_1);
                var node = lazyNode_1.node, index = lazyNode_1.index;
                this.blockUtils.updateDataIntoRowNode(node, data);
                this.nodeMap.set({
                    id: node.id,
                    node: node,
                    index: atStoreIndex
                });
                // mark all of the old block as needsVerify to trigger it for a refresh, as nodes
                // should not be out of place
                this.markBlockForVerify(index);
                return node;
            }
        }
        // node doesn't exist, create a new one
        var newNode = this.blockUtils.createRowNode(this.store.getRowDetails());
        if (data != null) {
            var defaultId = this.getPrefixedId(this.store.getIdSequence().next());
            this.blockUtils.setDataIntoRowNode(newNode, data, defaultId, undefined);
            this.blockUtils.checkOpenByDefault(newNode);
            this.nodeManager.addRowNode(newNode);
        }
        // add the new node to the store, has to be done after the display index is calculated so it doesn't take itself into account
        this.nodeMap.set({
            id: newNode.id,
            node: newNode,
            index: atStoreIndex,
        });
        if (createNodeCallback) {
            createNodeCallback(newNode);
        }
        return newNode;
    };
    LazyCache.prototype.getBlockStates = function () {
        var _this = this;
        var blockCounts = {};
        var blockStates = {};
        var dirtyBlocks = new Set();
        this.nodeMap.forEach(function (_a) {
            var _b;
            var node = _a.node, index = _a.index;
            var blockStart = _this.rowLoader.getBlockStartIndexForIndex(index);
            if (!node.stub && !node.failedLoad) {
                blockCounts[blockStart] = ((_b = blockCounts[blockStart]) !== null && _b !== void 0 ? _b : 0) + 1;
            }
            var rowState = 'loaded';
            if (node.failedLoad) {
                rowState = 'failed';
            }
            else if (_this.rowLoader.isRowLoading(blockStart)) {
                rowState = 'loading';
            }
            else if (_this.nodesToRefresh.has(node)) {
                rowState = 'needsLoading';
            }
            if (node.__needsRefreshWhenVisible || node.stub) {
                dirtyBlocks.add(blockStart);
            }
            if (!blockStates[blockStart]) {
                blockStates[blockStart] = new Set();
            }
            blockStates[blockStart].add(rowState);
        });
        var statePriorityMap = {
            loading: 4,
            failed: 3,
            needsLoading: 2,
            loaded: 1,
        };
        var blockPrefix = this.blockUtils.createNodeIdPrefix(this.store.getParentNode());
        var results = {};
        Object.entries(blockStates).forEach(function (_a) {
            var _b;
            var _c = __read(_a, 2), blockStart = _c[0], uniqueStates = _c[1];
            var sortedStates = __spread(uniqueStates).sort(function (a, b) { var _a, _b; return ((_a = statePriorityMap[a]) !== null && _a !== void 0 ? _a : 0) - ((_b = statePriorityMap[b]) !== null && _b !== void 0 ? _b : 0); });
            var priorityState = sortedStates[0];
            var blockNumber = Number(blockStart) / _this.rowLoader.getBlockSize();
            var blockId = blockPrefix ? blockPrefix + "-" + blockNumber : String(blockNumber);
            results[blockId] = {
                blockNumber: blockNumber,
                startRow: Number(blockStart),
                endRow: Number(blockStart) + _this.rowLoader.getBlockSize(),
                pageStatus: priorityState,
                loadedRowCount: (_b = blockCounts[blockStart]) !== null && _b !== void 0 ? _b : 0,
            };
        });
        return results;
    };
    LazyCache.prototype.destroyRowAtIndex = function (atStoreIndex) {
        var lazyNode = this.nodeMap.getBy('index', atStoreIndex);
        if (!lazyNode) {
            return;
        }
        this.nodeMap.delete(lazyNode);
        this.nodeDisplayIndexMap.delete(lazyNode.node.rowIndex);
        this.nodesToRefresh.delete(lazyNode.node);
        this.blockUtils.destroyRowNode(lazyNode.node);
    };
    LazyCache.prototype.getSsrmParams = function () {
        return this.store.getSsrmParams();
    };
    /**
     * @param id the base id to be prefixed
     * @returns a node id with prefix if required
     */
    LazyCache.prototype.getPrefixedId = function (id) {
        if (this.defaultNodeIdPrefix) {
            return this.defaultNodeIdPrefix + '-' + id;
        }
        else {
            return id.toString();
        }
    };
    LazyCache.prototype.markBlockForVerify = function (rowIndex) {
        var _a = __read(this.rowLoader.getBlockBoundsForIndex(rowIndex), 2), start = _a[0], end = _a[1];
        var lazyNodesInRange = this.nodeMap.filter(function (lazyNode) { return lazyNode.index >= start && lazyNode.index < end; });
        lazyNodesInRange.forEach(function (_a) {
            var node = _a.node;
            node.__needsRefreshWhenVisible = true;
        });
    };
    LazyCache.prototype.doesNodeMatch = function (data, node) {
        if (node.stub) {
            return false;
        }
        if (this.getRowIdFunc != null) {
            var id = this.getRowId(data);
            return node.id === id;
        }
        return node.data === data;
    };
    /**
     * Deletes any stub nodes not within the given range
     */
    LazyCache.prototype.purgeStubsOutsideOfViewport = function () {
        var _this = this;
        var firstRow = this.api.getFirstDisplayedRow();
        var lastRow = this.api.getLastDisplayedRow();
        var firstRowBlockStart = this.rowLoader.getBlockStartIndexForIndex(firstRow);
        var _a = __read(this.rowLoader.getBlockBoundsForIndex(lastRow), 2), _ = _a[0], lastRowBlockEnd = _a[1];
        this.nodeMap.forEach(function (lazyNode) {
            if (_this.rowLoader.isRowLoading(lazyNode.index)) {
                return;
            }
            if (lazyNode.node.stub && (lazyNode.index < firstRowBlockStart || lazyNode.index > lastRowBlockEnd)) {
                _this.destroyRowAtIndex(lazyNode.index);
            }
        });
    };
    /**
     * Calculates the number of rows to cache based on either the viewport, or number of cached blocks
     */
    LazyCache.prototype.getNumberOfRowsToRetain = function (firstRow, lastRow) {
        var numberOfCachedBlocks = this.storeParams.maxBlocksInCache;
        if (numberOfCachedBlocks == null) {
            return null;
        }
        var blockSize = this.rowLoader.getBlockSize();
        var numberOfViewportBlocks = Math.ceil((lastRow - firstRow) / blockSize);
        var numberOfBlocksToRetain = Math.max(numberOfCachedBlocks, numberOfViewportBlocks);
        var numberOfRowsToRetain = numberOfBlocksToRetain * blockSize;
        return numberOfRowsToRetain;
    };
    LazyCache.prototype.getBlocksDistanceFromRow = function (nodes, otherDisplayIndex) {
        var _this = this;
        var blockDistanceToMiddle = {};
        nodes.forEach(function (_a) {
            var node = _a.node, index = _a.index;
            var _b = __read(_this.rowLoader.getBlockBoundsForIndex(index), 2), blockStart = _b[0], blockEnd = _b[1];
            if (blockStart in blockDistanceToMiddle) {
                return;
            }
            var distStart = Math.abs(node.rowIndex - otherDisplayIndex);
            var distEnd;
            // may not have an end node if the block came back small 
            var lastLazyNode = _this.nodeMap.getBy('index', [blockEnd - 1]);
            if (lastLazyNode)
                distEnd = Math.abs(lastLazyNode.node.rowIndex - otherDisplayIndex);
            var farthest = distEnd == null || distStart < distEnd ? distStart : distEnd;
            blockDistanceToMiddle[blockStart] = farthest;
        });
        return Object.entries(blockDistanceToMiddle);
    };
    LazyCache.prototype.purgeExcessRows = function () {
        var _this = this;
        // Delete all stub nodes which aren't in the viewport or already loading
        this.purgeStubsOutsideOfViewport();
        var firstRowInViewport = this.api.getFirstDisplayedRow();
        var lastRowInViewport = this.api.getLastDisplayedRow();
        var firstRowBlockStart = this.rowLoader.getBlockStartIndexForIndex(firstRowInViewport);
        var _a = __read(this.rowLoader.getBlockBoundsForIndex(lastRowInViewport), 2), _ = _a[0], lastRowBlockEnd = _a[1];
        // number of blocks to cache on top of the viewport blocks
        var numberOfRowsToRetain = this.getNumberOfRowsToRetain(firstRowBlockStart, lastRowBlockEnd);
        if (this.store.getDisplayIndexEnd() == null || numberOfRowsToRetain == null) {
            // if group is collapsed, or max blocks missing, ignore the event
            return;
        }
        // don't check the nodes that could have been cached out of necessity
        var disposableNodes = this.nodeMap.filter(function (_a) {
            var node = _a.node;
            return !node.stub && !_this.isNodeCached(node);
        });
        if (disposableNodes.length <= numberOfRowsToRetain) {
            // not enough rows to bother clearing any
            return;
        }
        var disposableNodesNotInViewport = disposableNodes.filter(function (_a) {
            var node = _a.node;
            var startRowNum = node.rowIndex;
            if (startRowNum == null || startRowNum === -1) {
                // row is not displayed and can be disposed
                return true;
            }
            if (firstRowBlockStart <= startRowNum && startRowNum < lastRowBlockEnd) {
                // start row in viewport, block is in viewport
                return false;
            }
            var lastRowNum = startRowNum + blockSize;
            if (firstRowBlockStart <= lastRowNum && lastRowNum < lastRowBlockEnd) {
                // end row in viewport, block is in viewport
                return false;
            }
            if (startRowNum < firstRowBlockStart && lastRowNum >= lastRowBlockEnd) {
                // full block surrounds in viewport
                return false;
            }
            // block does not appear in viewport and can be disposed
            return true;
        });
        // reduce the number of rows to retain by the number in viewport which were retained
        numberOfRowsToRetain = numberOfRowsToRetain - (disposableNodes.length - disposableNodesNotInViewport.length);
        if (!disposableNodesNotInViewport.length) {
            return;
        }
        var midViewportRow = firstRowInViewport + ((lastRowInViewport - firstRowInViewport) / 2);
        var blockDistanceArray = this.getBlocksDistanceFromRow(disposableNodesNotInViewport, midViewportRow);
        var blockSize = this.rowLoader.getBlockSize();
        var numberOfBlocksToRetain = Math.ceil(numberOfRowsToRetain / blockSize);
        if (blockDistanceArray.length <= numberOfBlocksToRetain) {
            return;
        }
        // sort the blocks by distance from middle of viewport
        blockDistanceArray.sort(function (a, b) { return Math.sign(b[1] - a[1]); });
        var blocksToRemove = blockDistanceArray.length - Math.max(numberOfBlocksToRetain, 0);
        for (var i = 0; i < blocksToRemove; i++) {
            var blockStart = Number(blockDistanceArray[i][0]);
            for (var x = blockStart; x < blockStart + blockSize; x++) {
                var lazyNode = this.nodeMap.getBy('index', x);
                if (!lazyNode || this.isNodeCached(lazyNode.node)) {
                    continue;
                }
                this.destroyRowAtIndex(x);
            }
        }
    };
    LazyCache.prototype.isNodeFocused = function (node) {
        var focusedCell = this.focusService.getFocusCellToUseAfterRefresh();
        if (!focusedCell) {
            return false;
        }
        if (focusedCell.rowPinned != null) {
            return false;
        }
        var hasFocus = focusedCell.rowIndex === node.rowIndex;
        return hasFocus;
    };
    LazyCache.prototype.isNodeCached = function (node) {
        return (!!node.group && node.expanded) || this.isNodeFocused(node);
    };
    LazyCache.prototype.extractDuplicateIds = function (rows) {
        var _this = this;
        if (!this.getRowIdFunc == null) {
            return [];
        }
        var newIds = new Set();
        var duplicates = new Set();
        rows.forEach(function (data) {
            var id = _this.getRowId(data);
            if (newIds.has(id)) {
                duplicates.add(id);
                return;
            }
            newIds.add(id);
        });
        return __spread(duplicates);
    };
    LazyCache.prototype.onLoadSuccess = function (firstRowIndex, numberOfRowsExpected, response) {
        var _this = this;
        if (!this.live)
            return;
        if (this.getRowIdFunc != null) {
            var duplicates = this.extractDuplicateIds(response.rowData);
            if (duplicates.length > 0) {
                var duplicateIdText = duplicates.join(', ');
                console.warn("AG Grid: Unable to display rows as duplicate row ids (" + duplicateIdText + ") were returned by the getRowId callback. Please modify the getRowId callback to provide unique ids.");
                this.onLoadFailed(firstRowIndex, numberOfRowsExpected);
                return;
            }
        }
        var wasRefreshing = this.nodesToRefresh.size > 0;
        response.rowData.forEach(function (data, responseRowIndex) {
            var _a;
            var rowIndex = firstRowIndex + responseRowIndex;
            var nodeFromCache = _this.nodeMap.getBy('index', rowIndex);
            // if stub, overwrite
            if ((_a = nodeFromCache === null || nodeFromCache === void 0 ? void 0 : nodeFromCache.node) === null || _a === void 0 ? void 0 : _a.stub) {
                _this.createRowAtIndex(rowIndex, data);
                return;
            }
            if (nodeFromCache && _this.doesNodeMatch(data, nodeFromCache.node)) {
                _this.blockUtils.updateDataIntoRowNode(nodeFromCache.node, data);
                _this.nodesToRefresh.delete(nodeFromCache.node);
                nodeFromCache.node.__needsRefreshWhenVisible = false;
                return;
            }
            // create row will handle deleting the overwritten row
            _this.createRowAtIndex(rowIndex, data);
        });
        var finishedRefreshing = this.nodesToRefresh.size === 0;
        if (wasRefreshing && finishedRefreshing) {
            this.fireRefreshFinishedEvent();
        }
        if (response.rowCount != undefined && response.rowCount !== -1) {
            // if the rowCount has been provided, set the row count
            this.numberOfRows = response.rowCount;
            this.isLastRowKnown = true;
        }
        else if (numberOfRowsExpected > response.rowData.length) {
            // infer the last row as the response came back short
            this.numberOfRows = firstRowIndex + response.rowData.length;
            this.isLastRowKnown = true;
        }
        else if (!this.isLastRowKnown) {
            // add 1 for loading row, as we don't know the last row
            var lastInferredRow = firstRowIndex + response.rowData.length + 1;
            if (lastInferredRow > this.numberOfRows) {
                this.numberOfRows = lastInferredRow;
            }
        }
        if (this.isLastRowKnown) {
            // delete any rows after the last index
            var lazyNodesAfterStoreEnd = this.nodeMap.filter(function (lazyNode) { return lazyNode.index >= _this.numberOfRows; });
            lazyNodesAfterStoreEnd.forEach(function (lazyNode) { return _this.destroyRowAtIndex(lazyNode.index); });
        }
        this.fireStoreUpdatedEvent();
    };
    LazyCache.prototype.fireRefreshFinishedEvent = function () {
        var finishedRefreshing = this.nodesToRefresh.size === 0;
        // if anything refreshing currently, skip.
        if (!finishedRefreshing) {
            return;
        }
        this.store.fireRefreshFinishedEvent();
    };
    LazyCache.prototype.isLastRowIndexKnown = function () {
        return this.isLastRowKnown;
    };
    LazyCache.prototype.onLoadFailed = function (firstRowIndex, numberOfRowsExpected) {
        if (!this.live)
            return;
        var failedNodes = this.nodeMap.filter(function (node) { return node.index >= firstRowIndex && node.index < firstRowIndex + numberOfRowsExpected; });
        failedNodes.forEach(function (node) { return node.node.failedLoad = true; });
        this.fireStoreUpdatedEvent();
    };
    LazyCache.prototype.markNodesForRefresh = function () {
        var _this = this;
        this.nodeMap.forEach(function (lazyNode) {
            if (lazyNode.node.stub) {
                return;
            }
            _this.nodesToRefresh.add(lazyNode.node);
        });
        this.rowLoader.queueLoadCheck();
        if (this.isLastRowKnown && this.numberOfRows === 0) {
            this.numberOfRows = 1;
            this.isLastRowKnown = false;
            this.fireStoreUpdatedEvent();
        }
    };
    LazyCache.prototype.isNodeInCache = function (id) {
        return !!this.nodeMap.getBy('id', id);
    };
    // gets called 1) row count changed 2) cache purged 3) items inserted
    LazyCache.prototype.fireStoreUpdatedEvent = function () {
        if (!this.live) {
            return;
        }
        this.store.fireStoreUpdatedEvent();
    };
    LazyCache.prototype.getRowId = function (data) {
        if (this.getRowIdFunc == null) {
            return null;
        }
        // find rowNode using id
        var level = this.store.getRowDetails().level;
        var parentKeys = this.store.getParentNode().getGroupKeys();
        var id = this.getRowIdFunc({
            data: data,
            parentKeys: parentKeys.length > 0 ? parentKeys : undefined,
            level: level,
        });
        return String(id);
    };
    LazyCache.prototype.updateRowNodes = function (updates) {
        var _this = this;
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }
        var updatedNodes = [];
        updates.forEach(function (data) {
            var id = _this.getRowId(data);
            var lazyNode = _this.nodeMap.getBy('id', id);
            if (lazyNode) {
                _this.blockUtils.updateDataIntoRowNode(lazyNode.node, data);
                updatedNodes.push(lazyNode.node);
            }
        });
        return updatedNodes;
    };
    LazyCache.prototype.insertRowNodes = function (inserts, indexToAdd) {
        var _this = this;
        // if missing and we know the last row, we're inserting at the end
        var addIndex = indexToAdd == null && this.isLastRowKnown ? this.store.getRowCount() : indexToAdd;
        // can't insert nodes past the end of the store
        if (addIndex == null || this.store.getRowCount() < addIndex) {
            return [];
        }
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }
        var uniqueInsertsMap = {};
        inserts.forEach(function (data) {
            var dataId = _this.getRowId(data);
            if (dataId && _this.isNodeInCache(dataId)) {
                return;
            }
            uniqueInsertsMap[dataId] = data;
        });
        var uniqueInserts = Object.values(uniqueInsertsMap);
        var numberOfInserts = uniqueInserts.length;
        if (numberOfInserts === 0) {
            return [];
        }
        var nodesToMove = this.nodeMap.filter(function (node) { return node.index >= addIndex; });
        // delete all nodes which need moved first, so they don't get overwritten
        nodesToMove.forEach(function (lazyNode) { return _this.nodeMap.delete(lazyNode); });
        // then move the nodes to their new locations
        nodesToMove.forEach(function (lazyNode) {
            _this.nodeMap.set({
                node: lazyNode.node,
                index: lazyNode.index + numberOfInserts,
                id: lazyNode.id,
            });
        });
        // increase the store size to accommodate
        this.numberOfRows += numberOfInserts;
        // finally insert the new rows
        return uniqueInserts.map(function (data, uniqueInsertOffset) { return _this.createRowAtIndex(addIndex + uniqueInsertOffset, data); });
    };
    LazyCache.prototype.getOrderedNodeMap = function () {
        var obj = {};
        this.nodeMap.forEach(function (node) { return obj[node.index] = node; });
        return obj;
    };
    LazyCache.prototype.clearDisplayIndexes = function () {
        this.nodeDisplayIndexMap.clear();
    };
    LazyCache.prototype.removeRowNodes = function (idsToRemove) {
        if (this.getRowIdFunc == null) {
            // throw error, as this is type checked in the store. User likely abusing internal apis if here.
            throw new Error('AG Grid: Insert transactions can only be applied when row ids are supplied.');
        }
        var removedNodes = [];
        var nodesToVerify = [];
        // track how many nodes have been deleted, as when we pass other nodes we need to shift them up
        var deletedNodeCount = 0;
        var remainingIdsToRemove = __spread(idsToRemove);
        var allNodes = this.getOrderedNodeMap();
        var contiguousIndex = -1;
        var _loop_1 = function (stringIndex) {
            contiguousIndex += 1;
            var node = allNodes[stringIndex];
            // finding the index allows the use of splice which should be slightly faster than both a check and filter
            var matchIndex = remainingIdsToRemove.findIndex(function (idToRemove) { return idToRemove === node.id; });
            if (matchIndex !== -1) {
                // found node, remove it from nodes to remove
                remainingIdsToRemove.splice(matchIndex, 1);
                this_1.destroyRowAtIndex(Number(stringIndex));
                removedNodes.push(node.node);
                deletedNodeCount += 1;
                return "continue";
            }
            // no nodes removed and this node doesn't match, so no need to shift
            if (deletedNodeCount === 0) {
                return "continue";
            }
            var numericStoreIndex = Number(stringIndex);
            if (contiguousIndex !== numericStoreIndex) {
                nodesToVerify.push(node.node);
            }
            // shift normal node up by number of deleted prior to this point
            this_1.nodeMap.delete(allNodes[stringIndex]);
            this_1.nodeMap.set({
                id: node.id,
                node: node.node,
                index: numericStoreIndex - deletedNodeCount,
            });
        };
        var this_1 = this;
        for (var stringIndex in allNodes) {
            _loop_1(stringIndex);
        }
        this.numberOfRows -= this.isLastRowIndexKnown() ? idsToRemove.length : deletedNodeCount;
        if (remainingIdsToRemove.length > 0 && nodesToVerify.length > 0) {
            nodesToVerify.forEach(function (node) { return node.__needsRefreshWhenVisible = true; });
            this.rowLoader.queueLoadCheck();
        }
        return removedNodes;
    };
    __decorate([
        Autowired('gridApi')
    ], LazyCache.prototype, "api", void 0);
    __decorate([
        Autowired('ssrmBlockUtils')
    ], LazyCache.prototype, "blockUtils", void 0);
    __decorate([
        Autowired('focusService')
    ], LazyCache.prototype, "focusService", void 0);
    __decorate([
        Autowired('ssrmNodeManager')
    ], LazyCache.prototype, "nodeManager", void 0);
    __decorate([
        PostConstruct
    ], LazyCache.prototype, "init", null);
    __decorate([
        PreDestroy
    ], LazyCache.prototype, "destroyRowNodes", null);
    return LazyCache;
}(BeanStub));
export { LazyCache };
