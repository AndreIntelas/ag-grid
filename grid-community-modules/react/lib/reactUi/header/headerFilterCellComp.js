// @ag-grid-community/react v29.3.5
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
const HeaderFilterCellComp = (props) => {
    const { context } = react_1.useContext(beansContext_1.BeansContext);
    const [cssClasses, setCssClasses] = react_1.useState(new utils_1.CssClasses('ag-header-cell', 'ag-floating-filter'));
    const [cssBodyClasses, setBodyCssClasses] = react_1.useState(new utils_1.CssClasses());
    const [cssButtonWrapperClasses, setButtonWrapperCssClasses] = react_1.useState(new utils_1.CssClasses('ag-floating-filter-button', 'ag-hidden'));
    const [buttonWrapperAriaHidden, setButtonWrapperAriaHidden] = react_1.useState("false");
    const [userCompDetails, setUserCompDetails] = react_1.useState();
    const eGui = react_1.useRef(null);
    const eFloatingFilterBody = react_1.useRef(null);
    const eButtonWrapper = react_1.useRef(null);
    const eButtonShowMainFilter = react_1.useRef(null);
    const alreadyResolved = react_1.useRef(false);
    const userCompResolve = react_1.useRef();
    const userCompPromise = react_1.useRef();
    useEffectOnce_1.useLayoutEffectOnce(() => {
        userCompPromise.current = new core_1.AgPromise(resolve => {
            userCompResolve.current = resolve;
        });
    });
    const userCompRef = (value) => {
        // i don't know why, but react was calling this method multiple
        // times, thus un-setting, them immediately setting the reference again.
        // because we are resolving a promise, it's not good to be resolving
        // the promise multiple times, so we only resolve the first time.
        if (alreadyResolved.current) {
            return;
        }
        // we also skip when it's un-setting
        if (value == null) {
            return;
        }
        userCompResolve.current && userCompResolve.current(value);
        alreadyResolved.current = true;
    };
    const { ctrl } = props;
    useEffectOnce_1.useLayoutEffectOnce(() => {
        const compProxy = {
            addOrRemoveCssClass: (name, on) => setCssClasses(prev => prev.setClass(name, on)),
            addOrRemoveBodyCssClass: (name, on) => setBodyCssClasses(prev => prev.setClass(name, on)),
            setButtonWrapperDisplayed: (displayed) => {
                setButtonWrapperCssClasses(prev => prev.setClass('ag-hidden', !displayed));
                setButtonWrapperAriaHidden(!displayed ? "true" : "false");
            },
            setWidth: width => eGui.current.style.width = width,
            setCompDetails: compDetails => setUserCompDetails(compDetails),
            getFloatingFilterComp: () => userCompPromise.current ? userCompPromise.current : null,
            setMenuIcon: eIcon => eButtonShowMainFilter.current.appendChild(eIcon)
        };
        ctrl.setComp(compProxy, eGui.current, eButtonShowMainFilter.current, eFloatingFilterBody.current);
    });
    // js comps
    react_1.useLayoutEffect(() => jsComp_1.showJsComp(userCompDetails, context, eFloatingFilterBody.current, userCompRef), [userCompDetails]);
    const className = react_1.useMemo(() => cssClasses.toString(), [cssClasses]);
    const bodyClassName = react_1.useMemo(() => cssBodyClasses.toString(), [cssBodyClasses]);
    const buttonWrapperClassName = react_1.useMemo(() => cssButtonWrapperClasses.toString(), [cssButtonWrapperClasses]);
    const userCompStateless = react_1.useMemo(() => {
        const res = userCompDetails
            && userCompDetails.componentFromFramework
            && utils_1.isComponentStateless(userCompDetails.componentClass);
        return !!res;
    }, [userCompDetails]);
    const reactUserComp = userCompDetails && userCompDetails.componentFromFramework;
    const UserCompClass = userCompDetails && userCompDetails.componentClass;
    return (react_1.default.createElement("div", { ref: eGui, className: className, role: "gridcell", tabIndex: -1 },
        react_1.default.createElement("div", { ref: eFloatingFilterBody, className: bodyClassName, role: "presentation" },
            reactUserComp && userCompStateless && react_1.default.createElement(UserCompClass, Object.assign({}, userCompDetails.params)),
            reactUserComp && !userCompStateless && react_1.default.createElement(UserCompClass, Object.assign({}, userCompDetails.params, { ref: userCompRef }))),
        react_1.default.createElement("div", { ref: eButtonWrapper, "aria-hidden": buttonWrapperAriaHidden, className: buttonWrapperClassName, role: "presentation" },
            react_1.default.createElement("button", { ref: eButtonShowMainFilter, type: "button", "aria-label": "Open Filter Menu", className: "ag-floating-filter-button-button", tabIndex: -1 }))));
};
exports.default = react_1.memo(HeaderFilterCellComp);

//# sourceMappingURL=headerFilterCellComp.js.map
