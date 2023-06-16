// @ag-grid-community/react v30.0.1
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const react_1 = __importStar(require("react"));
const beansContext_1 = require("../beansContext");
const headerCellComp_1 = __importDefault(require("./headerCellComp"));
const headerGroupCellComp_1 = __importDefault(require("./headerGroupCellComp"));
const headerFilterCellComp_1 = __importDefault(require("./headerFilterCellComp"));
const useEffectOnce_1 = require("../useEffectOnce");
const HeaderRowComp = (props) => {
    const { gridOptionsService } = react_1.useContext(beansContext_1.BeansContext);
    const [transform, setTransform] = react_1.useState();
    const [height, setHeight] = react_1.useState();
    const [top, setTop] = react_1.useState();
    const [ariaRowIndex, setAriaRowIndex] = react_1.useState();
    const [cellCtrls, setCellCtrls] = react_1.useState([]);
    const eGui = react_1.useRef(null);
    const { ctrl } = props;
    const typeColumn = ctrl.getType() === core_1.HeaderRowType.COLUMN;
    const typeGroup = ctrl.getType() === core_1.HeaderRowType.COLUMN_GROUP;
    const typeFilter = ctrl.getType() === core_1.HeaderRowType.FLOATING_FILTER;
    const setCellCtrlsMaintainOrder = react_1.useCallback((prev, next) => {
        const isEnsureDomOrder = gridOptionsService.is('ensureDomOrder');
        const isPrintLayout = gridOptionsService.isDomLayout('print');
        // if we are ensuring dom order, we set the ctrls into the dom in the same order they appear on screen
        if (isEnsureDomOrder || isPrintLayout) {
            return next;
        }
        // if not maintaining order, we want to keep the dom elements we have and add new ones to the end,
        // otherwise we will loose transition effects as elements are placed in different dom locations
        const prevMap = core_1._.mapById(prev, c => c.getInstanceId());
        const nextMap = core_1._.mapById(next, c => c.getInstanceId());
        const oldCtrlsWeAreKeeping = prev.filter(c => nextMap.has(c.getInstanceId()));
        const newCtrls = next.filter(c => !prevMap.has(c.getInstanceId()));
        return [...oldCtrlsWeAreKeeping, ...newCtrls];
    }, []);
    useEffectOnce_1.useLayoutEffectOnce(() => {
        const compProxy = {
            setTransform: transform => setTransform(transform),
            setHeight: height => setHeight(height),
            setTop: top => setTop(top),
            setHeaderCtrls: ctrls => setCellCtrls(prev => setCellCtrlsMaintainOrder(prev, ctrls)),
            setWidth: width => {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
            setAriaRowIndex: rowIndex => setAriaRowIndex(rowIndex)
        };
        ctrl.setComp(compProxy);
    });
    const style = react_1.useMemo(() => ({
        transform: transform,
        height: height,
        top: top,
    }), [transform, height, top]);
    const className = react_1.useMemo(() => {
        const res = [`ag-header-row`];
        typeColumn && res.push(`ag-header-row-column`);
        typeGroup && res.push(`ag-header-row-column-group`);
        typeFilter && res.push(`ag-header-row-column-filter`);
        return res.join(' ');
    }, []);
    const createCellJsx = react_1.useCallback((cellCtrl) => {
        switch (ctrl.getType()) {
            case core_1.HeaderRowType.COLUMN_GROUP:
                return react_1.default.createElement(headerGroupCellComp_1.default, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
            case core_1.HeaderRowType.FLOATING_FILTER:
                return react_1.default.createElement(headerFilterCellComp_1.default, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
            default:
                return react_1.default.createElement(headerCellComp_1.default, { ctrl: cellCtrl, key: cellCtrl.getInstanceId() });
        }
    }, []);
    return (react_1.default.createElement("div", { ref: eGui, className: className, role: "row", style: style, "aria-rowindex": ariaRowIndex }, cellCtrls.map(createCellJsx)));
};
exports.default = react_1.memo(HeaderRowComp);

//# sourceMappingURL=headerRowComp.js.map
