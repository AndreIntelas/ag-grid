import { BeanStub } from "../context/beanStub"
import { Bean, PostConstruct } from "../context/context";
import { AgEventListener, AgGlobalEventListener, ALWAYS_SYNC_GLOBAL_EVENTS } from "../events";
import { FrameworkEventListenerService } from "./frameworkEventListenerService";

@Bean('apiEventService')
export class ApiEventService extends BeanStub {
    private syncEventListeners: Map<string, Set<AgEventListener>> = new Map();
    private asyncEventListeners: Map<string, Set<AgEventListener>> = new Map();
    private syncGlobalEventListeners: Set<AgGlobalEventListener> = new Set();
    private globalEventListenerPairs = new Map<AgGlobalEventListener, { syncListener: AgGlobalEventListener, asyncListener: AgGlobalEventListener }>();
    private frameworkEventWrappingService: FrameworkEventListenerService;

    @PostConstruct
    private postConstruct(): void {
        this.frameworkEventWrappingService = new FrameworkEventListenerService(this.getFrameworkOverrides());
    }

    public addEventListener(eventType: string, userListener: AgEventListener): void {
        const listener = this.frameworkEventWrappingService.wrap(userListener);

        const async = this.gos.useAsyncEvents() && !ALWAYS_SYNC_GLOBAL_EVENTS.has(eventType);;
        const listeners = async ? this.asyncEventListeners : this.syncEventListeners;
        if (!listeners.has(eventType)) {
            listeners.set(eventType, new Set());
        }
        listeners.get(eventType)!.add(listener);
        this.eventService.addEventListener(eventType, listener, async);
    }
    public removeEventListener(eventType: string, userListener: AgEventListener): void {
        const listener = this.frameworkEventWrappingService.unwrap(userListener);        
        const asyncListeners = this.asyncEventListeners.get(eventType);
        const hasAsync = !!asyncListeners?.delete(listener);
        if (!hasAsync) {
            this.syncEventListeners.get(eventType)?.delete(listener);
        }
        this.eventService.removeEventListener(eventType, listener, hasAsync);
    }


    public addGlobalListener(userListener: AgGlobalEventListener): void {
        const listener = this.frameworkEventWrappingService.wrapGlobal(userListener);

        const async = this.gos.useAsyncEvents();

        if (async) {
            // if async then need to setup the global listener for sync to handle alwaysSyncGlobalEvents
            const syncListener: AgGlobalEventListener = (eventType: string, event: any) => {
                if (ALWAYS_SYNC_GLOBAL_EVENTS.has(eventType)) {
                    listener(eventType, event);
                }
            };
            const asyncListener: AgGlobalEventListener = (eventType: string, event: any) => {
                if (!ALWAYS_SYNC_GLOBAL_EVENTS.has(eventType)) {
                    listener(eventType, event);
                }
            };
            this.globalEventListenerPairs.set(userListener, {syncListener, asyncListener});
            this.eventService.addGlobalListener(syncListener, false);
            this.eventService.addGlobalListener(asyncListener, true);
        } else {
            this.syncGlobalEventListeners.add(listener);
            this.eventService.addGlobalListener(listener, false);
        }        
    }

    public removeGlobalListener(userListener: AgGlobalEventListener): void {
        const listener = this.frameworkEventWrappingService.unwrapGlobal(userListener);
        
        const hasAsync = this.globalEventListenerPairs.has(listener);
        if (hasAsync) {
            // If it was async also remove the always sync listener we added
            const { syncListener, asyncListener } = this.globalEventListenerPairs.get(listener)!;
            this.eventService.removeGlobalListener(syncListener, false);
            this.eventService.removeGlobalListener(asyncListener, true);
            this.globalEventListenerPairs.delete(userListener);
        } else {
            this.syncGlobalEventListeners.delete(listener);
            this.eventService.removeGlobalListener(listener, false);
        }
    }

    private destroyEventListeners(map: Map<string, Set<AgEventListener>>, async: boolean): void {
        map.forEach((listeners, eventType) => {
            listeners.forEach(listener => this.eventService.removeEventListener(eventType, listener, async));
            listeners.clear();
        });
        map.clear();
    }

    private destroyGlobalListeners(set: Set<AgGlobalEventListener>, async: boolean): void {
        set.forEach(listener => this.eventService.removeGlobalListener(listener, async));
        set.clear();
    }

    protected destroy(): void {
        super.destroy();

        this.destroyEventListeners(this.syncEventListeners, false);
        this.destroyEventListeners(this.asyncEventListeners, true);
        this.destroyGlobalListeners(this.syncGlobalEventListeners, false);
        this.globalEventListenerPairs.forEach(({syncListener, asyncListener}) => {
            this.eventService.removeGlobalListener(syncListener, false);
            this.eventService.removeGlobalListener(asyncListener, true);
        });
        this.globalEventListenerPairs.clear();
    }
}