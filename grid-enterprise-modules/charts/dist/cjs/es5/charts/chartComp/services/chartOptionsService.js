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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartOptionsService = void 0;
var core_1 = require("@ag-grid-community/core");
var ag_charts_community_1 = require("ag-charts-community");
var array_1 = require("../utils/array");
var object_1 = require("../utils/object");
var seriesTypeMapper_1 = require("../utils/seriesTypeMapper");
var ChartOptionsService = /** @class */ (function (_super) {
    __extends(ChartOptionsService, _super);
    function ChartOptionsService(chartController) {
        var _this = _super.call(this) || this;
        _this.chartController = chartController;
        return _this;
    }
    ChartOptionsService.prototype.getChartOption = function (expression) {
        return (0, object_1.get)(this.getChart(), expression, undefined);
    };
    ChartOptionsService.prototype.setChartOption = function (expression, value, isSilent) {
        var _this = this;
        var chartSeriesTypes = this.chartController.getChartSeriesTypes();
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('common');
        }
        var chartOptions = {};
        // we need to update chart options on each series type for combo charts
        chartSeriesTypes.forEach(function (seriesType) {
            chartOptions = (0, object_1.deepMerge)(chartOptions, _this.createChartOptions({
                seriesType: seriesType,
                expression: expression,
                value: value
            }));
        });
        if (!isSilent) {
            this.updateChart(chartOptions);
            this.raiseChartOptionsChangedEvent();
        }
    };
    ChartOptionsService.prototype.awaitChartOptionUpdate = function (func) {
        var chart = this.chartController.getChartProxy().getChart();
        chart.waitForUpdate().then(function () { return func(); })
            .catch(function (e) { return console.error("AG Grid - chart update failed", e); });
    };
    ChartOptionsService.prototype.getAxisProperty = function (expression) {
        var _a;
        return (0, object_1.get)((_a = this.getChart().axes) === null || _a === void 0 ? void 0 : _a[0], expression, undefined);
    };
    ChartOptionsService.prototype.setAxisProperty = function (expression, value) {
        this.setAxisProperties([{ expression: expression, value: value }]);
    };
    ChartOptionsService.prototype.setAxisProperties = function (properties) {
        var _this = this;
        var chart = this.getChart();
        var chartOptions = (0, array_1.flatMap)(properties, function (_a) {
            var _b;
            var expression = _a.expression, value = _a.value;
            // Only apply the property to axes that declare the property on their prototype chain
            var relevantAxes = (_b = chart.axes) === null || _b === void 0 ? void 0 : _b.filter(function (axis) {
                var e_1, _a;
                var parts = expression.split('.');
                var current = axis;
                try {
                    for (var parts_1 = __values(parts), parts_1_1 = parts_1.next(); !parts_1_1.done; parts_1_1 = parts_1.next()) {
                        var part = parts_1_1.value;
                        if (!(part in current)) {
                            return false;
                        }
                        current = current[part];
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (parts_1_1 && !parts_1_1.done && (_a = parts_1.return)) _a.call(parts_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return true;
            });
            if (!relevantAxes)
                return [];
            return relevantAxes.map(function (axis) { return _this.getUpdateAxisOptions(axis, expression, value); });
        })
            // Combine all property updates into a single merged object
            .reduce(function (chartOptions, axisOptions) { return (0, object_1.deepMerge)(chartOptions, axisOptions); }, {});
        if (Object.keys(chartOptions).length > 0) {
            this.updateChart(chartOptions);
            this.raiseChartOptionsChangedEvent();
        }
    };
    ChartOptionsService.prototype.getLabelRotation = function (axisType) {
        var axis = this.getAxis(axisType);
        return (0, object_1.get)(axis, 'label.rotation', undefined);
    };
    ChartOptionsService.prototype.setLabelRotation = function (axisType, value) {
        var chartAxis = this.getAxis(axisType);
        if (chartAxis) {
            var chartOptions = this.getUpdateAxisOptions(chartAxis, 'label.rotation', value);
            this.updateChart(chartOptions);
            this.raiseChartOptionsChangedEvent();
        }
    };
    ChartOptionsService.prototype.getSeriesOption = function (expression, seriesType, calculated) {
        // N.B. 'calculated' here refers to the fact that the property exists on the internal series object itself,
        // rather than the properties object. This is due to us needing to reach inside the chart itself to retrieve
        // the value, and will likely be cleaned up in a future release
        var series = this.getChart().series.find(function (s) { return ChartOptionsService.isMatchingSeries(seriesType, s); });
        return (0, object_1.get)(calculated ? series : series === null || series === void 0 ? void 0 : series.properties.toJson(), expression, undefined);
    };
    ChartOptionsService.prototype.setSeriesOption = function (expression, value, seriesType) {
        var chartOptions = this.createChartOptions({
            seriesType: seriesType,
            expression: "series.".concat(expression),
            value: value
        });
        this.updateChart(chartOptions);
        this.raiseChartOptionsChangedEvent();
    };
    ChartOptionsService.prototype.getPairedMode = function () {
        return this.chartController.getChartProxy().isPaired();
    };
    ChartOptionsService.prototype.setPairedMode = function (paired) {
        this.chartController.getChartProxy().setPaired(paired);
    };
    ChartOptionsService.prototype.getAxis = function (axisType) {
        var chart = this.getChart();
        if (!chart.axes || chart.axes.length < 1) {
            return undefined;
        }
        if (axisType === 'xAxis') {
            return (chart.axes && chart.axes[0].direction === 'x') ? chart.axes[0] : chart.axes[1];
        }
        return (chart.axes && chart.axes[1].direction === 'y') ? chart.axes[1] : chart.axes[0];
    };
    ChartOptionsService.prototype.getUpdateAxisOptions = function (chartAxis, expression, value) {
        var _this = this;
        var chartSeriesTypes = this.chartController.getChartSeriesTypes();
        if (this.chartController.isComboChart()) {
            chartSeriesTypes.push('common');
        }
        var validAxisTypes = ['number', 'category', 'time', 'grouped-category', 'angle-category', 'angle-number', 'radius-category', 'radius-number'];
        if (!validAxisTypes.includes(chartAxis.type)) {
            return {};
        }
        return chartSeriesTypes
            .map(function (seriesType) { return _this.createChartOptions({
            seriesType: seriesType,
            expression: "axes.".concat(chartAxis.type, ".").concat(expression),
            value: value,
        }); })
            .reduce(function (combinedOptions, options) { return (0, object_1.deepMerge)(combinedOptions, options); });
    };
    ChartOptionsService.prototype.getChartType = function () {
        return this.chartController.getChartType();
    };
    ChartOptionsService.prototype.getChart = function () {
        return this.chartController.getChartProxy().getChart();
    };
    ChartOptionsService.prototype.updateChart = function (chartOptions) {
        var chartRef = this.chartController.getChartProxy().getChartRef();
        chartRef.skipAnimations();
        ag_charts_community_1.AgCharts.updateDelta(chartRef, chartOptions);
    };
    ChartOptionsService.prototype.createChartOptions = function (_a) {
        var seriesType = _a.seriesType, expression = _a.expression, value = _a.value;
        var overrides = {};
        var chartOptions = {
            theme: {
                overrides: overrides
            }
        };
        (0, object_1.set)(overrides, "".concat(seriesType, ".").concat(expression), value);
        return chartOptions;
    };
    ChartOptionsService.prototype.raiseChartOptionsChangedEvent = function () {
        var chartModel = this.chartController.getChartModel();
        var event = {
            type: core_1.Events.EVENT_CHART_OPTIONS_CHANGED,
            chartId: chartModel.chartId,
            chartType: chartModel.chartType,
            chartThemeName: this.chartController.getChartThemeName(),
            chartOptions: chartModel.chartOptions
        };
        this.eventService.dispatchEvent(event);
    };
    ChartOptionsService.isMatchingSeries = function (seriesType, series) {
        return seriesTypeMapper_1.VALID_SERIES_TYPES.includes(seriesType) && series.type === seriesType;
    };
    ChartOptionsService.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    return ChartOptionsService;
}(core_1.BeanStub));
exports.ChartOptionsService = ChartOptionsService;
