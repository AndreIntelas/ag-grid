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
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const beansContext_1 = require("../beansContext");
const core_1 = require("@ag-grid-community/core");
const utils_1 = require("../utils");
const jsComp_1 = require("../jsComp");
const useEffectOnce_1 = require("../useEffectOnce");
const HeaderCellComp = (props) => {
    const { context } = react_1.useContext(beansContext_1.BeansContext);
    const [title, setTitle] = react_1.useState();
    const [colId, setColId] = react_1.useState();
    const [ariaSort, setAriaSort] = react_1.useState();
    const [ariaDescription, setAriaDescription] = react_1.useState();
    const [userCompDetails, setUserCompDetails] = react_1.useState();
    const eGui = react_1.useRef(null);
    const eResize = react_1.useRef(null);
    const eHeaderCompWrapper = react_1.useRef(null);
    const userCompRef = react_1.useRef();
    const { ctrl } = props;
    const cssClassManager = react_1.useMemo(() => new core_1.CssClassManager(() => eGui.current), []);
    useEffectOnce_1.useLayoutEffectOnce(() => {
        var _a;
        const compProxy = {
            setWidth: width => {
                if (eGui.current) {
                    eGui.current.style.width = width;
                }
            },
            addOrRemoveCssClass: (name, on) => cssClassManager.addOrRemoveCssClass(name, on),
            setColId: id => setColId(id),
            setTitle: title => setTitle(title),
            setAriaDescription: description => setAriaDescription(description),
            setAriaSort: sort => setAriaSort(sort),
            setUserCompDetails: compDetails => setUserCompDetails(compDetails),
            getUserCompInstance: () => userCompRef.current || undefined
        };
        ctrl.setComp(compProxy, eGui.current, eResize.current, eHeaderCompWrapper.current);
        const selectAllGui = ctrl.getSelectAllGui();
        (_a = eResize.current) === null || _a === void 0 ? void 0 : _a.insertAdjacentElement('afterend', selectAllGui);
    });
    // js comps
    react_1.useLayoutEffect(() => jsComp_1.showJsComp(userCompDetails, context, eHeaderCompWrapper.current, userCompRef), [userCompDetails]);
    // add drag handling, must be done after component is added to the dom
    react_1.useEffect(() => {
        ctrl.setDragSource(eGui.current);
    }, [userCompDetails]);
    const userCompStateless = react_1.useMemo(() => {
        const res = (userCompDetails === null || userCompDetails === void 0 ? void 0 : userCompDetails.componentFromFramework) && utils_1.isComponentStateless(userCompDetails.componentClass);
        return !!res;
    }, [userCompDetails]);
    const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    const UserCompClass = userCompDetails && userCompDetails.componentClass;
    return (react_1.default.createElement("div", { ref: eGui, className: "ag-header-cell", title: title, "col-id": colId, "aria-sort": ariaSort, role: "columnheader", tabIndex: -1, "aria-description": ariaDescription },
        react_1.default.createElement("div", { ref: eResize, className: "ag-header-cell-resize", role: "presentation" }),
        react_1.default.createElement("div", { ref: eHeaderCompWrapper, className: "ag-header-cell-comp-wrapper", role: "presentation" },
            reactUserComp && userCompStateless && react_1.default.createElement(UserCompClass, Object.assign({}, userCompDetails.params)),
            reactUserComp && !userCompStateless && react_1.default.createElement(UserCompClass, Object.assign({}, userCompDetails.params, { ref: userCompRef })))));
};
exports.default = react_1.memo(HeaderCellComp);

//# sourceMappingURL=headerCellComp.js.map
