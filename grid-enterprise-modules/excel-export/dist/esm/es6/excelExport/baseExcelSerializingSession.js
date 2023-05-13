import { _ } from "@ag-grid-community/core";
import { BaseGridSerializingSession, RowType } from "@ag-grid-community/csv-export";
import { getHeightFromProperty } from "./assets/excelUtils";
export class BaseExcelSerializingSession extends BaseGridSerializingSession {
    constructor(config) {
        super(config);
        this.mixedStyles = {};
        this.mixedStyleCounter = 0;
        this.rows = [];
        this.config = Object.assign({}, config);
        this.stylesByIds = {};
        this.config.baseExcelStyles.forEach(style => {
            this.stylesByIds[style.id] = style;
        });
        this.excelStyles = [...this.config.baseExcelStyles];
    }
    addCustomContent(customContent) {
        customContent.forEach(row => {
            const rowLen = this.rows.length + 1;
            const rowObj = {
                height: getHeightFromProperty(rowLen, row.height || this.config.rowHeight),
                cells: (row.cells || []).map((cell, idx) => {
                    var _a, _b, _c;
                    const image = this.addImage(rowLen, this.columnsToExport[idx], (_a = cell.data) === null || _a === void 0 ? void 0 : _a.value);
                    let excelStyles = null;
                    if (cell.styleId) {
                        excelStyles = typeof cell.styleId === 'string' ? [cell.styleId] : cell.styleId;
                    }
                    const excelStyleId = this.getStyleId(excelStyles);
                    if (image) {
                        return this.createCell(excelStyleId, this.getDataTypeForValue(image.value), image.value == null ? '' : image.value);
                    }
                    const value = (_c = (_b = cell.data) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : '';
                    const type = this.getDataTypeForValue(value);
                    if (cell.mergeAcross) {
                        return this.createMergedCell(excelStyleId, type, value, cell.mergeAcross);
                    }
                    return this.createCell(excelStyleId, type, value);
                }),
                outlineLevel: row.outlineLevel || undefined
            };
            if (row.collapsed != null) {
                rowObj.collapsed = row.collapsed;
            }
            if (row.hidden != null) {
                rowObj.hidden = row.hidden;
            }
            this.rows.push(rowObj);
        });
    }
    onNewHeaderGroupingRow() {
        const currentCells = [];
        this.rows.push({
            cells: currentCells,
            height: getHeightFromProperty(this.rows.length + 1, this.config.headerRowHeight)
        });
        return {
            onColumn: (columnGroup, header, index, span, collapsibleRanges) => {
                const styleIds = this.config.styleLinker({ rowType: RowType.HEADER_GROUPING, rowIndex: 1, value: `grouping-${header}`, columnGroup });
                currentCells.push(Object.assign(Object.assign({}, this.createMergedCell(this.getStyleId(styleIds), this.getDataTypeForValue('string'), header, span)), { collapsibleRanges }));
            }
        };
    }
    onNewHeaderRow() {
        return this.onNewRow(this.onNewHeaderColumn, this.config.headerRowHeight);
    }
    onNewBodyRow() {
        return this.onNewRow(this.onNewBodyColumn, this.config.rowHeight);
    }
    prepare(columnsToExport) {
        super.prepare(columnsToExport);
        this.columnsToExport = [...columnsToExport];
        this.cols = columnsToExport.map((col, i) => this.convertColumnToExcel(col, i));
    }
    parse() {
        // adding custom content might have made some rows wider than the grid, so add new columns
        const longestRow = this.rows.reduce((a, b) => Math.max(a, b.cells.length), 0);
        while (this.cols.length < longestRow) {
            this.cols.push(this.convertColumnToExcel(null, this.cols.length + 1));
        }
        const data = {
            name: this.config.sheetName,
            table: {
                columns: this.cols,
                rows: this.rows
            }
        };
        return this.createExcel(data);
    }
    isFormula(value) {
        if (value == null) {
            return false;
        }
        return this.config.autoConvertFormulas && value.toString().startsWith('=');
    }
    isNumerical(value) {
        return isFinite(value) && value !== '' && !isNaN(parseFloat(value));
    }
    getStyleById(styleId) {
        if (styleId == null) {
            return null;
        }
        return this.stylesByIds[styleId] || null;
    }
    convertColumnToExcel(column, index) {
        const columnWidth = this.config.columnWidth;
        if (columnWidth) {
            if (typeof columnWidth === 'number') {
                return { width: columnWidth };
            }
            return { width: columnWidth({ column, index }) };
        }
        if (column) {
            const smallestUsefulWidth = 75;
            return { width: Math.max(column.getActualWidth(), smallestUsefulWidth) };
        }
        return {};
    }
    onNewHeaderColumn(rowIndex, currentCells) {
        return (column, index) => {
            const nameForCol = this.extractHeaderValue(column);
            const styleIds = this.config.styleLinker({ rowType: RowType.HEADER, rowIndex, value: nameForCol, column });
            currentCells.push(this.createCell(this.getStyleId(styleIds), this.getDataTypeForValue('string'), nameForCol));
        };
    }
    onNewRow(onNewColumnAccumulator, height) {
        const currentCells = [];
        this.rows.push({
            cells: currentCells,
            height: getHeightFromProperty(this.rows.length + 1, height)
        });
        return {
            onColumn: onNewColumnAccumulator.bind(this, this.rows.length, currentCells)()
        };
    }
    onNewBodyColumn(rowIndex, currentCells) {
        let skipCols = 0;
        return (column, index, node) => {
            if (skipCols > 0) {
                skipCols -= 1;
                return;
            }
            if (!this.config.gridOptionsService.is('groupHideOpenParents') && node.level != null) {
                const padding = node.footer ? 1 : 0;
                _.last(this.rows).outlineLevel = node.level + padding;
            }
            const valueForCell = this.extractRowCellValue(column, index, rowIndex, 'excel', node);
            const styleIds = this.config.styleLinker({ rowType: RowType.BODY, rowIndex, value: valueForCell, column, node });
            const excelStyleId = this.getStyleId(styleIds);
            const colSpan = column.getColSpan(node);
            const addedImage = this.addImage(rowIndex, column, valueForCell);
            if (addedImage) {
                currentCells.push(this.createCell(excelStyleId, this.getDataTypeForValue(addedImage.value), addedImage.value == null ? '' : addedImage.value));
            }
            else if (colSpan > 1) {
                skipCols = colSpan - 1;
                currentCells.push(this.createMergedCell(excelStyleId, this.getDataTypeForValue(valueForCell), valueForCell, colSpan - 1));
            }
            else {
                currentCells.push(this.createCell(excelStyleId, this.getDataTypeForValue(valueForCell), valueForCell));
            }
        };
    }
    getStyleId(styleIds) {
        if (!styleIds || !styleIds.length) {
            return null;
        }
        if (styleIds.length === 1) {
            return styleIds[0];
        }
        const key = styleIds.join("-");
        if (!this.mixedStyles[key]) {
            this.addNewMixedStyle(styleIds);
        }
        return this.mixedStyles[key].excelID;
    }
    addNewMixedStyle(styleIds) {
        this.mixedStyleCounter += 1;
        const excelId = `mixedStyle${this.mixedStyleCounter}`;
        const resultantStyle = {};
        styleIds.forEach((styleId) => {
            this.excelStyles.forEach((excelStyle) => {
                if (excelStyle.id === styleId) {
                    _.mergeDeep(resultantStyle, _.deepCloneObject(excelStyle));
                }
            });
        });
        resultantStyle.id = excelId;
        resultantStyle.name = excelId;
        const key = styleIds.join("-");
        this.mixedStyles[key] = {
            excelID: excelId,
            key: key,
            result: resultantStyle
        };
        this.excelStyles.push(resultantStyle);
        this.stylesByIds[excelId] = resultantStyle;
    }
}
