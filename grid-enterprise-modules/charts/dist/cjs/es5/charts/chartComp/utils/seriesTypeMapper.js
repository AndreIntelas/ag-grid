"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeriesType = exports.VALID_SERIES_TYPES = void 0;
exports.VALID_SERIES_TYPES = [
    'area',
    'bar',
    'column',
    'histogram',
    'line',
    'pie',
    'scatter',
];
function getSeriesType(chartType) {
    switch (chartType) {
        case 'bar':
        case 'groupedBar':
        case 'stackedBar':
        case 'normalizedBar':
            return 'bar';
        case 'column':
        case 'groupedColumn':
        case 'stackedColumn':
        case 'normalizedColumn':
            return 'column';
        case 'line':
            return 'line';
        case 'area':
        case 'stackedArea':
        case 'normalizedArea':
            return 'area';
        case 'scatter':
        case 'bubble':
            return 'scatter';
        case 'histogram':
            return 'histogram';
        case 'pie':
        case 'doughnut':
            return 'pie';
        default:
            return 'cartesian';
    }
}
exports.getSeriesType = getSeriesType;
