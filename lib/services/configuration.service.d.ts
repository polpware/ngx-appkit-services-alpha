import { IConfigurationServiceContract, LocalStoreManagerServiceAbstractProvider, ThemeManagerAbstractProvider, TranslationServiceAbstractProvider } from '@polpware/ngx-appkit-contracts-alpha';
import * as i0 from "@angular/core";
export declare class ConfigurationService implements IConfigurationServiceContract {
    private localStorage;
    private translationService;
    private themeManager;
    constructor(localStoreManagerProvider: LocalStoreManagerServiceAbstractProvider, translationServiceProvider: TranslationServiceAbstractProvider, themeManagerProvider: ThemeManagerAbstractProvider);
    set language(value: string);
    get language(): string;
    set themeId(value: number);
    get themeId(): number;
    set homeUrl(value: string);
    get homeUrl(): string;
    set showDashboardStatistics(value: boolean);
    get showDashboardStatistics(): boolean;
    set showDashboardNotifications(value: boolean);
    get showDashboardNotifications(): boolean;
    set showDashboardTodo(value: boolean);
    get showDashboardTodo(): boolean;
    set showDashboardBanner(value: boolean);
    get showDashboardBanner(): boolean;
    baseUrl: any;
    tokenUrl: any;
    loginUrl: string;
    fallbackBaseUrl: string;
    private _language;
    private _homeUrl;
    private _themeId;
    private _showDashboardStatistics;
    private _showDashboardNotifications;
    private _showDashboardTodo;
    private _showDashboardBanner;
    private onConfigurationImported;
    configurationImported$: import("rxjs").Observable<boolean>;
    private loadLocalChanges;
    private saveToLocalStore;
    import(jsonValue: string): void;
    export(changesOnly?: boolean): string;
    clearLocalChanges(): void;
    private resetLanguage;
    private resetTheme;
    static ɵfac: i0.ɵɵFactoryDef<ConfigurationService, never>;
    static ɵprov: i0.ɵɵInjectableDef<ConfigurationService>;
}
