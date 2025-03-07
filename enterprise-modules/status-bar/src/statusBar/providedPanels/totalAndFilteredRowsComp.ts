import {
    Autowired,
    Events,
    IClientSideRowModel,
    IRowModel,
    IStatusPanelComp,
    PostConstruct,
    _
} from '@ag-grid-community/core';
import { NameValueComp } from "./nameValueComp";

export class TotalAndFilteredRowsComp extends NameValueComp implements IStatusPanelComp {

    @Autowired('rowModel') private rowModel: IRowModel;

    @PostConstruct
    protected postConstruct(): void {
        // this component is only really useful with client side row model
        if (this.rowModel.getType() !== 'clientSide') {
            _.warnOnce(`agTotalAndFilteredRowCountComponent should only be used with the client side row model.`);
            return;
        }

        this.setLabel('totalAndFilteredRows', 'Rows');

        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-total-and-filtered-row-count');

        this.setDisplayed(true);

        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onDataChanged.bind(this));
        this.onDataChanged();
    }

    private onDataChanged() {
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');

        const rowCount = _.formatNumberCommas(this.getFilteredRowCountValue(), thousandSeparator, decimalSeparator);
        const totalRowCount = _.formatNumberCommas(this.getTotalRowCount(), thousandSeparator, decimalSeparator);

        if (rowCount === totalRowCount) {
            this.setValue(rowCount);
        } else {
            const localeTextFunc = this.localeService.getLocaleTextFunc();
            this.setValue(`${rowCount} ${localeTextFunc('of', 'of')} ${totalRowCount}`);
        }
    }

    private getFilteredRowCountValue(): number {
        let filteredRowCount = 0;
        (this.rowModel as IClientSideRowModel).forEachNodeAfterFilter((node) => {
            if (!node.group) { filteredRowCount++; }
        });
        return filteredRowCount;
    }

    private getTotalRowCount(): number {
        let totalRowCount = 0;
        this.rowModel.forEachNode(node => {
            if (!node.group) { totalRowCount++; }
        });
        return totalRowCount;
    }

    public init() {}

    public refresh(): boolean {
        return true;
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    public destroy(): void {
        super.destroy();
    }

}
