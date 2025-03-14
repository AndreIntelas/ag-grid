import { createElement, ReactPortal } from 'react';
import { AgPromise, ComponentType, IComponent, WrappableInterface, _ } from '@ag-grid-community/core';
import { PortalManager } from './portalManager';
import generateNewKey from './keyGenerator';
import { createPortal } from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';

export class ReactComponent implements IComponent<any>, WrappableInterface {
    protected eParentElement!: HTMLElement;
    protected componentInstance: any;
    protected reactComponent: any;
    protected portalManager: PortalManager;
    protected portal: ReactPortal | null = null;
    protected statelessComponent: boolean;
    protected componentType: ComponentType;

    protected key: string;
    protected ref?: (element: any) => void;
    private portalKey: string;
    private oldPortal: ReactPortal | null = null;
    private reactElement: any;
    private params: any;
    protected instanceCreated: AgPromise<boolean> | AgPromise<false>;
    private resolveInstanceCreated?: (value: boolean) => void;
    private suppressFallbackMethods: boolean;

    constructor(reactComponent: any, portalManager: PortalManager, componentType: ComponentType, suppressFallbackMethods?: boolean) {
        this.reactComponent = reactComponent;
        this.portalManager = portalManager;
        this.componentType = componentType;
        this.suppressFallbackMethods = !!suppressFallbackMethods;

        this.statelessComponent = this.isStateless(this.reactComponent);

        this.key = generateNewKey();
        this.portalKey = generateNewKey();

        this.instanceCreated = this.isStatelessComponent() ? AgPromise.resolve(false) : new AgPromise(resolve => {
            this.resolveInstanceCreated = resolve;
        })
    }

    public getGui(): HTMLElement {
        return this.eParentElement;
    }

    /** `getGui()` returns the parent element. This returns the actual root element. */
    public getRootElement(): HTMLElement {
        const firstChild = this.eParentElement.firstChild;
        return firstChild as HTMLElement;
    }

    public destroy(): void {
        if (this.componentInstance && typeof this.componentInstance.destroy == 'function') {
            this.componentInstance.destroy();
        }
        return this.portalManager.destroyPortal(this.portal as ReactPortal);
    }

    protected createParentElement(params: any) {
        const componentWrappingElement = this.portalManager.getComponentWrappingElement();
        const eParentElement = document.createElement(componentWrappingElement || 'div');

        (eParentElement as HTMLElement).classList.add('ag-react-container');

        /** @deprecated v21.2 */
        params.reactContainer = eParentElement;

        return eParentElement;
    }

    protected addParentContainerStyleAndClasses() {
        if (!this.componentInstance) {
            return;
        }

        if (this.componentInstance.getReactContainerStyle && this.componentInstance.getReactContainerStyle()) {
            _.warnOnce('Since v31.1 "getReactContainerStyle" is deprecated. Apply styling directly to ".ag-react-container" if needed.');
            Object.assign(this.eParentElement.style, this.componentInstance.getReactContainerStyle());
        }

        if (this.componentInstance.getReactContainerClasses && this.componentInstance.getReactContainerClasses()) {
            _.warnOnce('Since v31.1 "getReactContainerClasses" is deprecated. Apply styling directly to ".ag-react-container" if needed.');
            const parentContainerClasses: string[] = this.componentInstance.getReactContainerClasses();
            parentContainerClasses.forEach(className => this.eParentElement.classList.add(className));
        }
    }

    public statelessComponentRendered(): boolean {
        // fixed fragmentsFuncRendererCreateDestroy funcRendererWithNan (changeDetectionService too for NaN)
        return this.eParentElement.childElementCount > 0 || this.eParentElement.childNodes.length > 0;
    }

    public getFrameworkComponentInstance(): any {
        return this.componentInstance;
    }

    public isStatelessComponent(): boolean {
        return this.statelessComponent;
    }

    public getReactComponentName(): string {
        return this.reactComponent.name;
    }

    public getMemoType() {
        return this.hasSymbol() ? Symbol.for('react.memo') : 0xead3;
    }

    private hasSymbol() {
        return typeof Symbol === 'function' && Symbol.for;
    }

    protected isStateless(Component: any) {
        return (typeof Component === 'function' && !(Component.prototype && Component.prototype.isReactComponent))
            || (typeof Component === 'object' && Component.$$typeof === this.getMemoType());
    }

    public hasMethod(name: string): boolean {
        const frameworkComponentInstance = this.getFrameworkComponentInstance();
        return (!!frameworkComponentInstance && frameworkComponentInstance[name] != null) ||
            this.fallbackMethodAvailable(name);
    }

    public callMethod(name: string, args: IArguments): void {
        const frameworkComponentInstance = this.getFrameworkComponentInstance();

        if (this.isStatelessComponent()) {
            return this.fallbackMethod(name, !!args && args[0] ? args[0] : {});
        } else if (!(!!frameworkComponentInstance)) {
            // instance not ready yet - wait for it
            setTimeout(() => this.callMethod(name, args));
            return;
        }

        const method = frameworkComponentInstance[name];

        if (!!method) {
            return method.apply(frameworkComponentInstance, args);
        }

        if (this.fallbackMethodAvailable(name)) {
            return this.fallbackMethod(name, !!args && args[0] ? args[0] : {});
        }
    }

    public addMethod(name: string, callback: Function): void {
        (this as any)[name] = callback;
    }

    public init(params: any): AgPromise<void> {
        this.eParentElement = this.createParentElement(params);
        this.params = params;

        this.createOrUpdatePortal(params);

        return new AgPromise<void>(resolve => this.createReactComponent(resolve));
    }

    private createOrUpdatePortal(params: any) {
        if (!this.isStatelessComponent()) {
            // grab hold of the actual instance created
            this.ref = (element: any) => {
                this.componentInstance = element;
                this.addParentContainerStyleAndClasses();
                this.resolveInstanceCreated?.(true);
                this.resolveInstanceCreated = undefined;
            };
            params.ref = this.ref;
        }

        this.reactElement = this.createElement(this.reactComponent, { ...params, key: this.key });

        this.portal = createPortal(
            this.reactElement,
            this.eParentElement as any,
            this.portalKey // fixed deltaRowModeRefreshCompRenderer
        );
    }

    protected createElement(reactComponent: any, props: any): any {
        return createElement(reactComponent, props);
    }

    private createReactComponent(resolve: (value: any) => void) {
        this.portalManager.mountReactPortal(this.portal!, this, (value: any) => {
            resolve(value);
        });
    }

    public isNullValue(): boolean {
        return this.valueRenderedIsNull(this.params);
    }

    public rendered(): boolean {
        return (this.isStatelessComponent() && this.statelessComponentRendered()) ||
            !!(!this.isStatelessComponent() && this.getFrameworkComponentInstance());
    }

    private valueRenderedIsNull(params: any): boolean {
        // we only do this for cellRenderers
        if (!this.componentType.cellRenderer) {
            return false;
        }

        // we've no way of knowing if a component returns null without rendering it first
        // so we render it to markup and check the output - if it'll be null we know and won't timeout
        // waiting for a component that will never be created

        const originalConsoleError = console.error;
        try {
            // if a user is doing anything that uses useLayoutEffect (like material ui) then it will throw and we
            // can't do anything to stop it; this is just a warning and has no effect on anything so just suppress it
            // for this single operation
            console.error = () => {
            };
            const staticMarkup = renderToStaticMarkup(createElement(this.reactComponent, params) as any);
            return staticMarkup === '';
        } catch (ignore) {
        } finally {
            console.error = originalConsoleError;
        }

        return false;
    }

    /*
    * fallback methods - these will be invoked if a corresponding instance method is not present
    * for example if refresh is called and is not available on the component instance, then refreshComponent on this
    * class will be invoked instead
    *
    * Currently only refresh is supported
    */
    protected refreshComponent(args: any): void {
        this.oldPortal = this.portal;
        this.createOrUpdatePortal(args);
        this.portalManager.updateReactPortal(this.oldPortal!, this.portal!);
    }

    protected fallbackMethod(name: string, params: any): any {
        const method = (this as any)[`${name}Component`];
        if (!this.suppressFallbackMethods && !!method) {
            return method.bind(this)(params);
        }
    }

    protected fallbackMethodAvailable(name: string): boolean {
        if (this.suppressFallbackMethods) { return false; }
        const method = (this as any)[`${name}Component`];
        return !!method;
    }
}
