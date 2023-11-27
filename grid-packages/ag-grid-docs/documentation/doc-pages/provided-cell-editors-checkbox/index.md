---
title: "Checkbox Cell Editor"
---

Simple boolean editor that uses the standard HTML checkbox `input`.

## Enabling Checkbox Cell Editor

`agCheckboxCellEditor` allows users to provide boolean values as shown in the grid cells below:

<grid-example title='Checkbox Editor' name='checkbox-editor' type='generated' options='{ "modules": ["clientside"] }'></grid-example>

Enabled with `agCheckboxCellEditor` and generally used in conjunction with the [Checkbox Cell Renderer](/cell-rendering/#checkbox-cell-renderer).

```js
columnDefs: [
    {
        cellRenderer: 'agCheckboxCellRenderer',
        cellEditor: 'agCheckboxCellEditor',
        // ...other props
    }
]
```


