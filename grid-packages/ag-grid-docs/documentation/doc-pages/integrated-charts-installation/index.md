---
title: "Install Integrated Charts"
enterprise: true
---
This section shows how to install Integrated Charts using Modules or Packages. 

## Integrated Charts Module

To reduce bundle sizes in applications that do not require charts, AG Grid provides a dedicated charts [AG Grid Module](/modules/),
free from third-party library dependencies. This approach is recommended for most applications.
 
The Integrated Enterprise Charts module, which includes AG Charts Enterprise, can be imported as follows: 

```ts
// Import minimal modules required for charts
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { GridChartsModule } from "@ag-grid-enterprise/charts-enterprise";

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule]);
```

<note>
| Integrated Community Charts can be imported from `@ag-grid-enterprise/charts`.
</note>

## Integrated Charts Package

Applications that are not using ES6 Modules and are instead using the [bundled](/packages/) version of AG Grid Enterprise
can install Integrated Enterprise Charts as follows:

```bash
npm install --save ag-grid-charts-enterpise
```

Then in your code you can import the charts module as shown below:

```ts
// import the AG Grid Enteprise package - this includes all enterprise features and performs all 
// required registration
import  "ag-grid-charts-enterprise";

// rest of your code 
```

The `ag-grid-charts-enterpise` package includes AG Grid Enterprise and AG Charts Enterprise.

<note>
| Integrated Community Charts is included in the `ag-grid-enterprise` package.
</note>

## Next Up

Continue to the next section to learn about the: [User Created Charts](/integrated-charts-user-created/).
