import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from "@ag-grid-community/core";
import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
      <span :class="imgSpan" >
        @for (number of arr; track $index) {
          <img [src]="src" :class="priceIcon" />
        }
      </span>
  `,
})
export class PriceRenderer implements ICellRendererAngularComp {
  priceMultiplier: number = 1;
  src: string = "https://www.ag-grid.com/example-assets/icons/pound-coin-color-icon.png";
  arr!: any[];

  agInit(params: ICellRendererParams): void {
    this.refresh(params);
  }

  // Return Cell Value
  refresh(params: ICellRendererParams): boolean {
    if (params.value > 5000000000) {
      this.priceMultiplier = 2
    }
    if (params.value > 10000000000) {
      this.priceMultiplier = 3
    }
    if (params.value > 20000000000) {
      this.priceMultiplier = 4
    }
    if (params.value > 300000000000) {
      this.priceMultiplier = 5
    }
    this.arr = new Array(this.priceMultiplier).fill('');
    return true;
  }
}