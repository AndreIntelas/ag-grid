"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CellCustomStyleFeature = void 0;
const beanStub_1 = require("../../context/beanStub");
class CellCustomStyleFeature extends beanStub_1.BeanStub {
    constructor(ctrl, beans) {
        super();
        this.staticClasses = [];
        this.cellCtrl = ctrl;
        this.beans = beans;
        this.column = ctrl.getColumn();
        this.rowNode = ctrl.getRowNode();
    }
    setComp(comp) {
        this.cellComp = comp;
        this.applyUserStyles();
        this.applyCellClassRules();
        this.applyClassesFromColDef();
    }
    applyCellClassRules() {
        const colDef = this.column.getColDef();
        const { cellClassRules } = colDef;
        const cellClassParams = this.beans.gridOptionsService.addGridCommonParams({
            value: this.cellCtrl.getValue(),
            data: this.rowNode.data,
            node: this.rowNode,
            colDef: colDef,
            column: this.column,
            rowIndex: this.rowNode.rowIndex
        });
        this.beans.stylingService.processClassRules(
        // if current was previous, skip
        cellClassRules === this.cellClassRules ? undefined : this.cellClassRules, cellClassRules, cellClassParams, className => this.cellComp.addOrRemoveCssClass(className, true), className => this.cellComp.addOrRemoveCssClass(className, false));
        this.cellClassRules = cellClassRules;
    }
    applyUserStyles() {
        const colDef = this.column.getColDef();
        if (!colDef.cellStyle) {
            return;
        }
        let styles;
        if (typeof colDef.cellStyle === 'function') {
            const cellStyleParams = this.beans.gridOptionsService.addGridCommonParams({
                column: this.column,
                value: this.cellCtrl.getValue(),
                colDef: colDef,
                data: this.rowNode.data,
                node: this.rowNode,
                rowIndex: this.rowNode.rowIndex
            });
            const cellStyleFunc = colDef.cellStyle;
            styles = cellStyleFunc(cellStyleParams);
        }
        else {
            styles = colDef.cellStyle;
        }
        if (styles) {
            this.cellComp.setUserStyles(styles);
        }
    }
    applyClassesFromColDef() {
        const colDef = this.column.getColDef();
        const cellClassParams = this.beans.gridOptionsService.addGridCommonParams({
            value: this.cellCtrl.getValue(),
            data: this.rowNode.data,
            node: this.rowNode,
            column: this.column,
            colDef: colDef,
            rowIndex: this.rowNode.rowIndex
        });
        if (this.staticClasses.length) {
            this.staticClasses.forEach(className => this.cellComp.addOrRemoveCssClass(className, false));
        }
        this.staticClasses = this.beans.stylingService.getStaticCellClasses(colDef, cellClassParams);
        if (this.staticClasses.length) {
            this.staticClasses.forEach(className => this.cellComp.addOrRemoveCssClass(className, true));
        }
    }
    // overriding to make public, as we don't dispose this bean via context
    destroy() {
        super.destroy();
    }
}
exports.CellCustomStyleFeature = CellCustomStyleFeature;
