'use strict';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AgGridReact, getInstance } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import MySimpleEditor from './mySimpleEditor.jsx';
import "./style.css";

import { ModuleRegistry } from '@ag-grid-community/core';
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const createRowData = () => {
    const cloneObject = obj => JSON.parse(JSON.stringify(obj));
    const students = [
        {
            first_name: 'Bob',
            last_name: 'Harrison',
            gender: 'Male',
            address: '1197 Thunder Wagon Common, Cataract, RI, 02987-1016, US, (401) 747-0763',
            mood: 'Happy',
            country: 'Ireland'
        },
        {
            first_name: 'Mary',
            last_name: 'Wilson',
            gender: 'Female',
            age: 11,
            address: '3685 Rocky Glade, Showtucket, NU, X1E-9I0, CA, (867) 371-4215',
            mood: 'Sad',
            country: 'Ireland'
        },
        {
            first_name: 'Zahid',
            last_name: 'Khan',
            gender: 'Male',
            age: 12,
            address: '3235 High Forest, Glen Campbell, MS, 39035-6845, US, (601) 638-8186',
            mood: 'Happy',
            country: 'Ireland'
        },
        {
            first_name: 'Jerry',
            last_name: 'Mane',
            gender: 'Male',
            age: 12,
            address: '2234 Sleepy Pony Mall , Drain, DC, 20078-4243, US, (202) 948-3634',
            mood: 'Happy',
            country: 'Ireland'
        }
    ];
    students.forEach(item => {
        students.push(cloneObject(item));
    });
    students.forEach(item => {
        students.push(cloneObject(item));
    });
    students.forEach(item => {
        students.push(cloneObject(item));
    });
    return students;
}

const GridExample = () => {
    const gridRef = useRef(null);
    const [rowData] = useState(createRowData());
    const columnDefs = useMemo(() => [
        {
            field: "first_name",
            headerName: "First Name",
            width: 120,
            editable: true
        },
        {
            field: "last_name",
            headerName: "Last Name",
            width: 120,
            editable: true
        },
        {
            field: "gender",
            width: 100,
            cellEditor: MySimpleEditor
        },
        {
            field: "age",
            width: 80,
            cellEditor: MySimpleEditor
        },
        {
            field: "mood",
            width: 90,
            cellEditor: MySimpleEditor
        },
        {
            field: "country",
            width: 110,
            cellEditor: MySimpleEditor
        },
        {
            field: "address",
            minWidth: 502,
            cellEditor: MySimpleEditor
        }
    ]);

    const onGridReady = useCallback((params) => {
        if (gridRef.current) {
            const interval = window.setInterval(() => {
                const instances = params.api.getCellEditorInstances();
                if (instances.length > 0) {
                    getInstance(instances[0], instance => {
                        if (instance && instance.myCustomFunction) {
                            const result = instance.myCustomFunction();
                            console.log(`found editing cell: row index = ${result.rowIndex}, column = ${result.colId}.`);
                        } else {
                            console.log('found editing cell, but method myCustomFunction not found, must be the default editor.');
                        }
                    });
                } else {
                    console.log('found not editing cell.');
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, []);

    const defaultColDef = useMemo(() => ({
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    }), []);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div
                style={{
                    height: '100%',
                    width: '100%'
                }}
                className={/** DARK MODE START **/document.documentElement.dataset.defaultTheme || 'ag-theme-quartz'/** DARK MODE END **/}>
                <AgGridReact
                    ref={gridRef}
                    defaultColDef={defaultColDef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    reactiveCustomComponents
                    onGridReady={onGridReady}
                />
            </div>
        </div>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<GridExample />);
