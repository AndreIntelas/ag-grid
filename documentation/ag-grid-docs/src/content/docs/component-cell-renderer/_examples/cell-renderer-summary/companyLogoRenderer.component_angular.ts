import { ICellRendererParams } from "@ag-grid-community/core";
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'app-company-logo-renderer',
  standalone: true,
  template: `
  <span :class="imgSpanLogo" >
    @if (value) {
      <img
        [alt]="value"
        [src]="'https://www.ag-grid.com/example-assets/software-company-logos/' + value.toLowerCase() + '.png'"
        [height]="30"
        :class="logo"
      />
    }
  </span>
  `,
})
export class CompanyLogoRenderer implements ICellRendererAngularComp {
  // Init Cell Value
  public value!: string;
  agInit(params: ICellRendererParams): void {
    this.refresh(params);
  }

  // Return Cell Value
  refresh(params: ICellRendererParams): boolean {
    this.value = params.value;
    return true;
  }
}

