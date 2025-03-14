import corePackageJson from '../../../community-modules/core/package.json';
import type { Framework, ImportType, InternalFramework } from './types/ag-grid';

// Speed up the builds by only building some of the frameworks/pages
const quickBuildPages = import.meta.env?.QUICK_BUILD_PAGES;
export const QUICK_BUILD_PAGES: string[] = quickBuildPages ? quickBuildPages.split(',') : undefined;

export const FRAMEWORKS: readonly Framework[] = ['react', 'angular', 'vue', 'javascript'] as const;
export const DEFAULT_FRAMEWORK: Framework = FRAMEWORKS[0];
export const DEFAULT_INTERNAL_FRAMEWORK: InternalFramework = 'reactFunctional';

export const USE_PACKAGES = true; // process.env?.USE_PACKAGES ?? false;

export const INTERNAL_FRAMEWORKS: readonly InternalFramework[] = USE_PACKAGES
    ? ['vanilla', 'typescript', 'reactFunctional', 'reactFunctionalTs', 'angular', 'vue3']
    : (['typescript', 'reactFunctional', 'reactFunctionalTs', 'angular', 'vue3'] as const);

export const FRAMEWORK_DISPLAY_TEXT: Record<Framework, string> = {
    javascript: 'JavaScript',
    react: 'React',
    angular: 'Angular',
    vue: 'Vue',
};

export const IMPORT_TYPES: ImportType[] = USE_PACKAGES ? ['modules', 'packages'] : ['modules'];

export const agGridVersion = import.meta.env?.PUBLIC_PACKAGE_VERSION ?? corePackageJson.version;
export const agGridEnterpriseVersion = agGridVersion;
export const agGridReactVersion = agGridVersion;
export const agGridAngularVersion = agGridVersion;
export const agGridVueVersion = agGridVersion;
export const agGridVue3Version = agGridVersion;

export const NPM_CDN = 'https://cdn.jsdelivr.net/npm';
export const PUBLISHED_URLS = {
    '@ag-grid-community/styles': `${NPM_CDN}/@ag-grid-community/styles@${agGridVersion}`,
    '@ag-grid-community/react': `${NPM_CDN}/@ag-grid-community/react@${agGridReactVersion}/`,
    '@ag-grid-community/angular': `${NPM_CDN}/@ag-grid-community/angular@${agGridAngularVersion}/`,
    '@ag-grid-community/vue3': `${NPM_CDN}/@ag-grid-community/vue3@${agGridVue3Version}/`,
    'ag-grid-community': `${NPM_CDN}/ag-grid-community@${agGridVersion}`,
    'ag-grid-enterprise': `${NPM_CDN}/ag-grid-enterprise@${agGridEnterpriseVersion}/`,
    'ag-grid-charts-enterprise': `${NPM_CDN}/ag-grid-charts-enterprise@${agGridEnterpriseVersion}/`,
    'ag-grid-angular': `${NPM_CDN}/ag-grid-angular@${agGridAngularVersion}/`,
    'ag-grid-react': `${NPM_CDN}/ag-grid-react@${agGridReactVersion}/`,
    'ag-grid-vue3': `${NPM_CDN}/ag-grid-vue3@${agGridVue3Version}/`,
};

// whether integrated charts includes ag-charts-enterprise or just ag-charts-community
// also need to update plugins/ag-grid-generate-example-files/src/executors/generate/generator/constants.ts if this value is changed
export const integratedChartsUsesChartsEnterprise = true;
export const PUBLISHED_UMD_URLS = {
    'ag-grid-community': `${NPM_CDN}/ag-grid-community@${agGridVersion}/dist/ag-grid-community.js`,
    'ag-grid-enterprise': `${NPM_CDN}/ag-grid-${integratedChartsUsesChartsEnterprise ? 'charts-' : ''}enterprise@${agGridVersion}/dist/ag-grid-${integratedChartsUsesChartsEnterprise ? 'charts-' : ''}enterprise.js`,
};

export const getEnterprisePackageName = () =>
    `ag-grid-${integratedChartsUsesChartsEnterprise ? 'charts-' : ''}enterprise`;

/**
 * Site base URL
 *
 * ie undefined for dev, /ag-charts for staging
 *
 * NOTE: Includes trailing slash (`/`)
 */
export const SITE_BASE_URL =
    // Astro default env var (for build time)
    import.meta.env?.BASE_URL ||
    // `.env.*` override (for client side)
    import.meta.env?.PUBLIC_BASE_URL.replace(/\/?$/, '/');

/*
 * Site URL
 *
 * ie http://localhost:4610 for dev, https://grid-staging.ag-grid.com for staging
 */
export const SITE_URL = import.meta.env?.SITE_URL || import.meta.env?.PUBLIC_SITE_URL;

export const STAGING_SITE_URL = 'https://grid-staging.ag-grid.com';
export const PRODUCTION_SITE_URL = 'https://www.ag-grid.com';
export const USE_PUBLISHED_PACKAGES = ['1', 'true'].includes(import.meta.env?.PUBLIC_USE_PUBLISHED_PACKAGES);

/**
 * Enable debug pages to be built
 */
export const ENABLE_GENERATE_DEBUG_PAGES = import.meta.env?.ENABLE_GENERATE_DEBUG_PAGES;

/**
 * Show debug logs
 */
export const SHOW_DEBUG_LOGS = import.meta.env?.SHOW_DEBUG_LOGS;

/**
 * Number of URL segments in `SITE_BASE_URL`
 */
export const SITE_BASE_URL_SEGMENTS = SITE_BASE_URL?.split('/').filter(Boolean).length || 0;

/**
 * URL prefix to serve files
 */
export const FILES_BASE_PATH = '/files';

/*
 * Charts URL
 */
function getChartsUrl() {
    if (SITE_URL == null) return;

    if (SITE_URL?.includes('localhost:4610')) {
        return 'https://localhost:4600';
    } else if (SITE_URL?.includes(STAGING_SITE_URL)) {
        return 'https://charts-staging.ag-grid.com';
    }
    return 'https://charts.ag-grid.com';
}
export const CHARTS_SITE_URL = getChartsUrl();
