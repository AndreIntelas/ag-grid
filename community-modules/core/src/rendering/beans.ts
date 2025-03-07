import { Autowired, Bean, Context, Optional, PostConstruct } from "../context/context";
import { ColumnModel } from "../columns/columnModel";
import { HeaderNavigationService } from "../headerRendering/common/headerNavigationService";
import { RowRenderer } from "./rowRenderer";
import { ValueService } from "../valueService/valueService";
import { EventService } from "../eventService";
import { ColumnAnimationService } from "./columnAnimationService";
import { IRangeService, ISelectionHandleFactory } from "../interfaces/IRangeService";
import { FocusService } from "../focusService";
import { PopupService } from "../widgets/popupService";
import { StylingService } from "../styling/stylingService";
import { ColumnHoverService } from "./columnHoverService";
import { PaginationProxy } from "../pagination/paginationProxy";
import { AnimationFrameService } from "../misc/animationFrameService";
import { UserComponentFactory } from "../components/framework/userComponentFactory";
import { DragService } from "../dragAndDrop/dragService";
import { DragAndDropService } from "../dragAndDrop/dragAndDropService";
import { SortController } from "../sortController";
import { FilterManager } from "../filter/filterManager";
import { RowContainerHeightService } from "./rowContainerHeightService";
import { IFrameworkOverrides } from "../interfaces/iFrameworkOverrides";
import { CellPositionUtils } from "../entities/cellPositionUtils";
import { RowPositionUtils } from "../entities/rowPositionUtils";
import { ISelectionService } from "../interfaces/iSelectionService";
import { RowCssClassCalculator } from "./row/rowCssClassCalculator";
import { IRowModel } from "../interfaces/iRowModel";
import { IClientSideRowModel } from "../interfaces/iClientSideRowModel";
import { IServerSideRowModel } from "../interfaces/iServerSideRowModel";
import { ResizeObserverService } from "../misc/resizeObserverService";
import { CtrlsService } from "../ctrlsService";
import { NavigationService } from "../gridBodyComp/navigationService";
import { AgStackComponentsRegistry } from "../components/agStackComponentsRegistry";
import { CtrlsFactory } from "../ctrlsFactory";
import { UserComponentRegistry } from "../components/framework/userComponentRegistry";
import { ValueCache } from "../valueService/valueCache";
import { RowNodeEventThrottle } from "../entities/rowNodeEventThrottle";
import { GridOptionsService } from "../gridOptionsService";
import { LocaleService } from "../localeService";
import { Environment } from "../environment";
import { SyncService } from "../syncService";
import { AriaAnnouncementService } from "./ariaAnnouncementService";

/** Using the IoC has a slight performance consideration, which is no problem most of the
 * time, unless we are trashing objects - which is the case when scrolling and rowComp
 * and cellComp. So for performance reasons, RowComp and CellComp do not get autowired
 * with the IoC. Instead they get passed this object which is all the beans the RowComp
 * and CellComp need. Not autowiring all the cells gives performance improvement. */
@Bean('beans')
export class Beans {

    @Autowired('resizeObserverService') public readonly resizeObserverService: ResizeObserverService;
    @Autowired('paginationProxy') public readonly paginationProxy: PaginationProxy;
    @Autowired('context') public readonly context: Context;
    @Autowired('gridOptionsService') public readonly gos: GridOptionsService;
    @Autowired('environment') public readonly environment: Environment;
    @Autowired('rowRenderer') public readonly rowRenderer: RowRenderer;
    @Autowired('valueService') public readonly valueService: ValueService;
    @Autowired('eventService') public readonly eventService: EventService;
    @Autowired('columnModel') public readonly columnModel: ColumnModel;
    @Autowired('headerNavigationService') public readonly headerNavigationService: HeaderNavigationService;
    @Autowired('navigationService') public readonly navigationService: NavigationService;
    @Autowired('columnAnimationService') public readonly columnAnimationService: ColumnAnimationService;
    @Autowired('focusService') public readonly focusService: FocusService;
    @Autowired('popupService') public readonly popupService: PopupService;
    @Autowired('stylingService') public readonly stylingService: StylingService;
    @Autowired('columnHoverService') public readonly columnHoverService: ColumnHoverService;
    @Autowired('userComponentFactory') public readonly userComponentFactory: UserComponentFactory;
    @Autowired('userComponentRegistry') public readonly userComponentRegistry: UserComponentRegistry;
    @Autowired('animationFrameService') public readonly animationFrameService: AnimationFrameService;
    @Autowired('dragService') public readonly dragService: DragService;
    @Autowired('dragAndDropService') public readonly dragAndDropService: DragAndDropService;
    @Autowired('sortController') public readonly sortController: SortController;
    @Autowired('filterManager') public readonly filterManager: FilterManager;
    @Autowired('rowContainerHeightService') public readonly rowContainerHeightService: RowContainerHeightService;
    @Autowired('frameworkOverrides') public readonly frameworkOverrides: IFrameworkOverrides;
    @Autowired('cellPositionUtils') public readonly cellPositionUtils: CellPositionUtils;
    @Autowired('rowPositionUtils') public readonly rowPositionUtils: RowPositionUtils;
    @Autowired('selectionService') public readonly selectionService: ISelectionService;
    @Autowired('rowCssClassCalculator') public readonly rowCssClassCalculator: RowCssClassCalculator;
    @Autowired('rowModel') public readonly rowModel: IRowModel;
    @Autowired('ctrlsService') public readonly ctrlsService: CtrlsService;
    @Autowired('ctrlsFactory') public readonly ctrlsFactory: CtrlsFactory;
    @Autowired('agStackComponentsRegistry') public readonly agStackComponentsRegistry: AgStackComponentsRegistry;
    @Autowired('valueCache') public readonly valueCache: ValueCache;
    @Autowired('rowNodeEventThrottle') public readonly rowNodeEventThrottle: RowNodeEventThrottle;
    @Autowired('localeService') public readonly localeService: LocaleService;
    @Autowired('syncService') public readonly syncService: SyncService;
    @Autowired('ariaAnnouncementService') public readonly ariaAnnouncementService: AriaAnnouncementService;
    
    @Optional('rangeService') public readonly rangeService?: IRangeService;
    @Optional('selectionHandleFactory') public readonly selectionHandleFactory?: ISelectionHandleFactory;

    public clientSideRowModel: IClientSideRowModel;
    public serverSideRowModel: IServerSideRowModel;

    @PostConstruct
    private postConstruct(): void {
        if (this.gos.isRowModelType('clientSide')) {
            this.clientSideRowModel = this.rowModel as IClientSideRowModel;
        }
        if (this.gos.isRowModelType('serverSide')) {
            this.serverSideRowModel = this.rowModel as IServerSideRowModel;
        }
    }
}
