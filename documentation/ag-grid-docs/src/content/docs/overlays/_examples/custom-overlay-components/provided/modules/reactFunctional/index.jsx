'use strict';

import React, { useCallback, useMemo, useRef, useState, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AgGridReact } from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import './styles.css';
import CustomLoadingOverlay from './customLoadingOverlay.jsx';
import CustomNoRowsOverlay from './customNoRowsOverlay.jsx';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const GridExample = () => {
    const gridRef = useRef();
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState();
    const [columnDefs, setColumnDefs] = useState([
        { field: 'athlete', width: 150 },
        { field: 'age', width: 90 },
        { field: 'country', width: 120 },
        { field: 'year', width: 90 },
        { field: 'date', width: 110 },
        { field: 'sport', width: 110 },
        { field: 'gold', width: 100 },
        { field: 'silver', width: 100 },
        { field: 'bronze', width: 100 },
        { field: 'total', width: 100 },
    ]);
    const defaultColDef = useMemo(() => {
        return {
            editable: true,
            flex: 1,
            minWidth: 100,
            filter: true,
        }
    }, []);
    const loadingOverlayComponent = useMemo(() => { return CustomLoadingOverlay }, []);
    const loadingOverlayComponentParams = useMemo(() => {
        return {
            loadingMessage: 'One moment please...',
        }
    }, []);
    const noRowsOverlayComponent = useMemo(() => { return CustomNoRowsOverlay }, []);
    const noRowsOverlayComponentParams = useMemo(() => {
        return {
            noRowsMessageFunc: () => 'No rows found at: ' + new Date().toLocaleTimeString(),
        }
    }, []);

    const onBtShowLoading = useCallback(() => {
        gridRef.current.api.showLoadingOverlay();
    }, [])

    const onBtShowNoRows = useCallback(() => {
        gridRef.current.api.showNoRowsOverlay();
    }, [])

    const onBtHide = useCallback(() => {
        gridRef.current.api.hideOverlay();
    }, [])

    return (
        <div style={containerStyle}>
            <div className="example-wrapper">
                <div style={{ "marginBottom": "5px" }}>
                    <button onClick={onBtShowLoading}>Show Loading Overlay</button>
                    <button onClick={onBtShowNoRows}>Show No Rows Overlay</button>
                    <button onClick={onBtHide}>Hide Overlay</button>
                </div>

                <div style={gridStyle} className={/** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/}>
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        loadingOverlayComponent={loadingOverlayComponent}
                        loadingOverlayComponentParams={loadingOverlayComponentParams}
                        noRowsOverlayComponent={noRowsOverlayComponent}
                        noRowsOverlayComponentParams={noRowsOverlayComponentParams}
                        reactiveCustomComponents
                    />
                </div>
            </div>
        </div>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<StrictMode><GridExample /></StrictMode>);
