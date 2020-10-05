import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ConfigurationServiceConstants, DBkeys, Utilities, environment } from '@polpware/ngx-appkit-contracts-alpha';
import * as i0 from "@angular/core";
import * as i1 from "@polpware/ngx-appkit-contracts-alpha";
export class ConfigurationService {
    constructor(localStoreManagerProvider, translationServiceProvider, themeManagerProvider) {
        this.baseUrl = environment.baseUrl || Utilities.baseUrl();
        this.tokenUrl = environment.tokenUrl || environment.baseUrl || Utilities.baseUrl();
        this.loginUrl = environment.loginUrl;
        this.fallbackBaseUrl = 'https://quickapp.ebenmonney.com';
        // ***End of defaults***
        this._language = null;
        this._homeUrl = null;
        this._themeId = null;
        this._showDashboardStatistics = null;
        this._showDashboardNotifications = null;
        this._showDashboardTodo = null;
        this._showDashboardBanner = null;
        this.onConfigurationImported = new Subject();
        this.configurationImported$ = this.onConfigurationImported.asObservable();
        this.localStorage = localStoreManagerProvider.get();
        this.translationService = translationServiceProvider.get();
        this.themeManager = themeManagerProvider.get();
        this.loadLocalChanges();
    }
    set language(value) {
        this._language = value;
        this.saveToLocalStore(value, DBkeys.LANGUAGE);
        this.translationService.changeLanguage(value);
    }
    get language() {
        return this._language || ConfigurationServiceConstants.defaultLanguage;
    }
    set themeId(value) {
        value = +value;
        this._themeId = value;
        this.saveToLocalStore(value, DBkeys.THEME_ID);
        this.themeManager.installTheme(this.themeManager.getThemeByID(value));
    }
    get themeId() {
        return this._themeId || ConfigurationServiceConstants.defaultThemeId;
    }
    set homeUrl(value) {
        this._homeUrl = value;
        this.saveToLocalStore(value, DBkeys.HOME_URL);
    }
    get homeUrl() {
        return this._homeUrl || ConfigurationServiceConstants.defaultHomeUrl;
    }
    set showDashboardStatistics(value) {
        this._showDashboardStatistics = value;
        this.saveToLocalStore(value, DBkeys.SHOW_DASHBOARD_STATISTICS);
    }
    get showDashboardStatistics() {
        return this._showDashboardStatistics != null ? this._showDashboardStatistics : ConfigurationServiceConstants.defaultShowDashboardStatistics;
    }
    set showDashboardNotifications(value) {
        this._showDashboardNotifications = value;
        this.saveToLocalStore(value, DBkeys.SHOW_DASHBOARD_NOTIFICATIONS);
    }
    get showDashboardNotifications() {
        return this._showDashboardNotifications != null ? this._showDashboardNotifications : ConfigurationServiceConstants.defaultShowDashboardNotifications;
    }
    set showDashboardTodo(value) {
        this._showDashboardTodo = value;
        this.saveToLocalStore(value, DBkeys.SHOW_DASHBOARD_TODO);
    }
    get showDashboardTodo() {
        return this._showDashboardTodo != null ? this._showDashboardTodo : ConfigurationServiceConstants.defaultShowDashboardTodo;
    }
    set showDashboardBanner(value) {
        this._showDashboardBanner = value;
        this.saveToLocalStore(value, DBkeys.SHOW_DASHBOARD_BANNER);
    }
    get showDashboardBanner() {
        return this._showDashboardBanner != null ? this._showDashboardBanner : ConfigurationServiceConstants.defaultShowDashboardBanner;
    }
    loadLocalChanges() {
        if (this.localStorage.exists(DBkeys.LANGUAGE)) {
            this._language = this.localStorage.getDataObject(DBkeys.LANGUAGE, false);
            this.translationService.changeLanguage(this._language);
        }
        else {
            this.resetLanguage();
        }
        if (this.localStorage.exists(DBkeys.THEME_ID)) {
            this._themeId = this.localStorage.getDataObject(DBkeys.THEME_ID, false);
            this.themeManager.installTheme(this.themeManager.getThemeByID(this._themeId));
        }
        else {
            this.resetTheme();
        }
        if (this.localStorage.exists(DBkeys.HOME_URL)) {
            this._homeUrl = this.localStorage.getDataObject(DBkeys.HOME_URL, false);
        }
        if (this.localStorage.exists(DBkeys.SHOW_DASHBOARD_STATISTICS)) {
            this._showDashboardStatistics = this.localStorage.getDataObject(DBkeys.SHOW_DASHBOARD_STATISTICS, false);
        }
        if (this.localStorage.exists(DBkeys.SHOW_DASHBOARD_NOTIFICATIONS)) {
            this._showDashboardNotifications = this.localStorage.getDataObject(DBkeys.SHOW_DASHBOARD_NOTIFICATIONS, false);
        }
        if (this.localStorage.exists(DBkeys.SHOW_DASHBOARD_TODO)) {
            this._showDashboardTodo = this.localStorage.getDataObject(DBkeys.SHOW_DASHBOARD_TODO, false);
        }
        if (this.localStorage.exists(DBkeys.SHOW_DASHBOARD_BANNER)) {
            this._showDashboardBanner = this.localStorage.getDataObject(DBkeys.SHOW_DASHBOARD_BANNER, false);
        }
    }
    saveToLocalStore(data, key) {
        setTimeout(() => this.localStorage.savePermanentData(data, key));
    }
    import(jsonValue) {
        this.clearLocalChanges();
        if (jsonValue) {
            const importValue = Utilities.JsonTryParse(jsonValue);
            if (importValue.language != null) {
                this.language = importValue.language;
            }
            if (importValue.themeId != null) {
                this.themeId = +importValue.themeId;
            }
            if (importValue.homeUrl != null) {
                this.homeUrl = importValue.homeUrl;
            }
            if (importValue.showDashboardStatistics != null) {
                this.showDashboardStatistics = importValue.showDashboardStatistics;
            }
            if (importValue.showDashboardNotifications != null) {
                this.showDashboardNotifications = importValue.showDashboardNotifications;
            }
            if (importValue.showDashboardTodo != null) {
                this.showDashboardTodo = importValue.showDashboardTodo;
            }
            if (importValue.showDashboardBanner != null) {
                this.showDashboardBanner = importValue.showDashboardBanner;
            }
        }
        this.onConfigurationImported.next();
    }
    export(changesOnly = true) {
        const exportValue = {
            language: changesOnly ? this._language : this.language,
            themeId: changesOnly ? this._themeId : this.themeId,
            homeUrl: changesOnly ? this._homeUrl : this.homeUrl,
            showDashboardStatistics: changesOnly ? this._showDashboardStatistics : this.showDashboardStatistics,
            showDashboardNotifications: changesOnly ? this._showDashboardNotifications : this.showDashboardNotifications,
            showDashboardTodo: changesOnly ? this._showDashboardTodo : this.showDashboardTodo,
            showDashboardBanner: changesOnly ? this._showDashboardBanner : this.showDashboardBanner
        };
        return JSON.stringify(exportValue);
    }
    clearLocalChanges() {
        this._language = null;
        this._themeId = null;
        this._homeUrl = null;
        this._showDashboardStatistics = null;
        this._showDashboardNotifications = null;
        this._showDashboardTodo = null;
        this._showDashboardBanner = null;
        this.localStorage.deleteData(DBkeys.LANGUAGE);
        this.localStorage.deleteData(DBkeys.THEME_ID);
        this.localStorage.deleteData(DBkeys.HOME_URL);
        this.localStorage.deleteData(DBkeys.SHOW_DASHBOARD_STATISTICS);
        this.localStorage.deleteData(DBkeys.SHOW_DASHBOARD_NOTIFICATIONS);
        this.localStorage.deleteData(DBkeys.SHOW_DASHBOARD_TODO);
        this.localStorage.deleteData(DBkeys.SHOW_DASHBOARD_BANNER);
        this.resetLanguage();
        this.resetTheme();
    }
    resetLanguage() {
        const language = this.translationService.useBrowserLanguage();
        if (language) {
            this._language = language;
        }
        else {
            this._language = this.translationService.useDefaultLangage();
        }
    }
    resetTheme() {
        this.themeManager.installTheme();
        this._themeId = null;
    }
}
/** @nocollapse */ ConfigurationService.ɵfac = function ConfigurationService_Factory(t) { return new (t || ConfigurationService)(i0.ɵɵinject(i1.LocalStoreManagerServiceAbstractProvider), i0.ɵɵinject(i1.TranslationServiceAbstractProvider), i0.ɵɵinject(i1.ThemeManagerAbstractProvider)); };
/** @nocollapse */ ConfigurationService.ɵprov = i0.ɵɵdefineInjectable({ token: ConfigurationService, factory: ConfigurationService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(ConfigurationService, [{
        type: Injectable
    }], function () { return [{ type: i1.LocalStoreManagerServiceAbstractProvider }, { type: i1.TranslationServiceAbstractProvider }, { type: i1.ThemeManagerAbstractProvider }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHBvbHB3YXJlL25neC1hcHBraXQtc2VydmljZXMtYWxwaGEvIiwic291cmNlcyI6WyJsaWIvc2VydmljZXMvY29uZmlndXJhdGlvbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQVksTUFBTSxlQUFlLENBQUM7QUFDckQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUUvQixPQUFPLEVBS0gsNkJBQTZCLEVBSTdCLE1BQU0sRUFDTixTQUFTLEVBQ1QsV0FBVyxFQUNkLE1BQU0sc0NBQXNDLENBQUM7OztBQWE5QyxNQUFNLE9BQU8sb0JBQW9CO0lBTTdCLFlBQVkseUJBQW1FLEVBQzNFLDBCQUE4RCxFQUM5RCxvQkFBa0Q7UUEwRS9DLFlBQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNyRCxhQUFRLEdBQUcsV0FBVyxDQUFDLFFBQVEsSUFBSSxXQUFXLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM5RSxhQUFRLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQztRQUNoQyxvQkFBZSxHQUFHLGlDQUFpQyxDQUFDO1FBQzNELHdCQUF3QjtRQUVoQixjQUFTLEdBQVcsSUFBSSxDQUFDO1FBQ3pCLGFBQVEsR0FBVyxJQUFJLENBQUM7UUFDeEIsYUFBUSxHQUFXLElBQUksQ0FBQztRQUN4Qiw2QkFBd0IsR0FBWSxJQUFJLENBQUM7UUFDekMsZ0NBQTJCLEdBQVksSUFBSSxDQUFDO1FBQzVDLHVCQUFrQixHQUFZLElBQUksQ0FBQztRQUNuQyx5QkFBb0IsR0FBWSxJQUFJLENBQUM7UUFFckMsNEJBQXVCLEdBQXFCLElBQUksT0FBTyxFQUFXLENBQUM7UUFDM0UsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFlBQVks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WSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ3pCLENBQUM7OzJHQTdPUSxvQkFBb0I7K0VBQXBCLG9CQUFvQixXQUFwQixvQkFBb0I7a0RBQXBCLG9CQUFvQjtjQURoQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtcbiAgICBJVHJhbnNsYXRpb25TZXJ2aWNlQ29udHJhY3QsXG4gICAgSVRoZW1lTWFuYWdlckNvbnRyYWN0LFxuICAgIElMb2NhbFN0b3JlTWFuYWdlckNvbnRyYWN0LFxuICAgIElDb25maWd1cmF0aW9uU2VydmljZUNvbnRyYWN0LFxuICAgIENvbmZpZ3VyYXRpb25TZXJ2aWNlQ29uc3RhbnRzLFxuICAgIFRyYW5zbGF0aW9uU2VydmljZUFic3RyYWN0UHJvdmlkZXIsXG4gICAgTG9jYWxTdG9yZU1hbmFnZXJTZXJ2aWNlQWJzdHJhY3RQcm92aWRlcixcbiAgICBUaGVtZU1hbmFnZXJBYnN0cmFjdFByb3ZpZGVyLFxuICAgIERCa2V5cyxcbiAgICBVdGlsaXRpZXMsXG4gICAgZW52aXJvbm1lbnRcbn0gZnJvbSAnQHBvbHB3YXJlL25neC1hcHBraXQtY29udHJhY3RzLWFscGhhJztcblxuaW50ZXJmYWNlIFVzZXJDb25maWd1cmF0aW9uIHtcbiAgICBsYW5ndWFnZTogc3RyaW5nO1xuICAgIGhvbWVVcmw6IHN0cmluZztcbiAgICB0aGVtZUlkOiBudW1iZXI7XG4gICAgc2hvd0Rhc2hib2FyZFN0YXRpc3RpY3M6IGJvb2xlYW47XG4gICAgc2hvd0Rhc2hib2FyZE5vdGlmaWNhdGlvbnM6IGJvb2xlYW47XG4gICAgc2hvd0Rhc2hib2FyZFRvZG86IGJvb2xlYW47XG4gICAgc2hvd0Rhc2hib2FyZEJhbm5lcjogYm9vbGVhbjtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbmZpZ3VyYXRpb25TZXJ2aWNlIGltcGxlbWVudHMgSUNvbmZpZ3VyYXRpb25TZXJ2aWNlQ29udHJhY3Qge1xuXG4gICAgcHJpdmF0ZSBsb2NhbFN0b3JhZ2U6IElMb2NhbFN0b3JlTWFuYWdlckNvbnRyYWN0O1xuICAgIHByaXZhdGUgdHJhbnNsYXRpb25TZXJ2aWNlOiBJVHJhbnNsYXRpb25TZXJ2aWNlQ29udHJhY3Q7XG4gICAgcHJpdmF0ZSB0aGVtZU1hbmFnZXI6IElUaGVtZU1hbmFnZXJDb250cmFjdDtcblxuICAgIGNvbnN0cnVjdG9yKGxvY2FsU3RvcmVNYW5hZ2VyUHJvdmlkZXI6IExvY2FsU3RvcmVNYW5hZ2VyU2VydmljZUFic3RyYWN0UHJvdmlkZXIsXG4gICAgICAgIHRyYW5zbGF0aW9uU2VydmljZVByb3ZpZGVyOiBUcmFuc2xhdGlvblNlcnZpY2VBYnN0cmFjdFByb3ZpZGVyLFxuICAgICAgICB0aGVtZU1hbmFnZXJQcm92aWRlcjogVGhlbWVNYW5hZ2VyQWJzdHJhY3RQcm92aWRlcikge1xuXG4gICAgICAgIHRoaXMubG9jYWxTdG9yYWdlID0gbG9jYWxTdG9yZU1hbmFnZXJQcm92aWRlci5nZXQoKTtcbiAgICAgICAgdGhpcy50cmFuc2xhdGlvblNlcnZpY2UgPSB0cmFuc2xhdGlvblNlcnZpY2VQcm92aWRlci5nZXQoKTtcbiAgICAgICAgdGhpcy50aGVtZU1hbmFnZXIgPSB0aGVtZU1hbmFnZXJQcm92aWRlci5nZXQoKTtcblxuICAgICAgICB0aGlzLmxvYWRMb2NhbENoYW5nZXMoKTtcbiAgICB9XG5cbiAgICBzZXQgbGFuZ3VhZ2UodmFsdWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9sYW5ndWFnZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLnNhdmVUb0xvY2FsU3RvcmUodmFsdWUsIERCa2V5cy5MQU5HVUFHRSk7XG4gICAgICAgIHRoaXMudHJhbnNsYXRpb25TZXJ2aWNlLmNoYW5nZUxhbmd1YWdlKHZhbHVlKTtcbiAgICB9XG4gICAgZ2V0IGxhbmd1YWdlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGFuZ3VhZ2UgfHwgQ29uZmlndXJhdGlvblNlcnZpY2VDb25zdGFudHMuZGVmYXVsdExhbmd1YWdlO1xuICAgIH1cblxuXG4gICAgc2V0IHRoZW1lSWQodmFsdWU6IG51bWJlcikge1xuICAgICAgICB2YWx1ZSA9ICt2YWx1ZTtcbiAgICAgICAgdGhpcy5fdGhlbWVJZCA9IHZhbHVlO1xuICAgICAgICB0aGlzLnNhdmVUb0xvY2FsU3RvcmUodmFsdWUsIERCa2V5cy5USEVNRV9JRCk7XG4gICAgICAgIHRoaXMudGhlbWVNYW5hZ2VyLmluc3RhbGxUaGVtZSh0aGlzLnRoZW1lTWFuYWdlci5nZXRUaGVtZUJ5SUQodmFsdWUpKTtcbiAgICB9XG4gICAgZ2V0IHRoZW1lSWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90aGVtZUlkIHx8IENvbmZpZ3VyYXRpb25TZXJ2aWNlQ29uc3RhbnRzLmRlZmF1bHRUaGVtZUlkO1xuICAgIH1cblxuXG4gICAgc2V0IGhvbWVVcmwodmFsdWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9ob21lVXJsID0gdmFsdWU7XG4gICAgICAgIHRoaXMuc2F2ZVRvTG9jYWxTdG9yZSh2YWx1ZSwgREJrZXlzLkhPTUVfVVJMKTtcbiAgICB9XG4gICAgZ2V0IGhvbWVVcmwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ob21lVXJsIHx8IENvbmZpZ3VyYXRpb25TZXJ2aWNlQ29uc3RhbnRzLmRlZmF1bHRIb21lVXJsO1xuICAgIH1cblxuXG4gICAgc2V0IHNob3dEYXNoYm9hcmRTdGF0aXN0aWNzKHZhbHVlOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX3Nob3dEYXNoYm9hcmRTdGF0aXN0aWNzID0gdmFsdWU7XG4gICAgICAgIHRoaXMuc2F2ZVRvTG9jYWxTdG9yZSh2YWx1ZSwgREJrZXlzLlNIT1dfREFTSEJPQVJEX1NUQVRJU1RJQ1MpO1xuICAgIH1cbiAgICBnZXQgc2hvd0Rhc2hib2FyZFN0YXRpc3RpY3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zaG93RGFzaGJvYXJkU3RhdGlzdGljcyAhPSBudWxsID8gdGhpcy5fc2hvd0Rhc2hib2FyZFN0YXRpc3RpY3MgOiBDb25maWd1cmF0aW9uU2VydmljZUNvbnN0YW50cy5kZWZhdWx0U2hvd0Rhc2hib2FyZFN0YXRpc3RpY3M7XG4gICAgfVxuXG5cbiAgICBzZXQgc2hvd0Rhc2hib2FyZE5vdGlmaWNhdGlvbnModmFsdWU6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5fc2hvd0Rhc2hib2FyZE5vdGlmaWNhdGlvbnMgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5zYXZlVG9Mb2NhbFN0b3JlKHZhbHVlLCBEQmtleXMuU0hPV19EQVNIQk9BUkRfTk9USUZJQ0FUSU9OUyk7XG4gICAgfVxuICAgIGdldCBzaG93RGFzaGJvYXJkTm90aWZpY2F0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Nob3dEYXNoYm9hcmROb3RpZmljYXRpb25zICE9IG51bGwgPyB0aGlzLl9zaG93RGFzaGJvYXJkTm90aWZpY2F0aW9ucyA6IENvbmZpZ3VyYXRpb25TZXJ2aWNlQ29uc3RhbnRzLmRlZmF1bHRTaG93RGFzaGJvYXJkTm90aWZpY2F0aW9ucztcbiAgICB9XG5cblxuICAgIHNldCBzaG93RGFzaGJvYXJkVG9kbyh2YWx1ZTogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9zaG93RGFzaGJvYXJkVG9kbyA9IHZhbHVlO1xuICAgICAgICB0aGlzLnNhdmVUb0xvY2FsU3RvcmUodmFsdWUsIERCa2V5cy5TSE9XX0RBU0hCT0FSRF9UT0RPKTtcbiAgICB9XG4gICAgZ2V0IHNob3dEYXNoYm9hcmRUb2RvKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2hvd0Rhc2hib2FyZFRvZG8gIT0gbnVsbCA/IHRoaXMuX3Nob3dEYXNoYm9hcmRUb2RvIDogQ29uZmlndXJhdGlvblNlcnZpY2VDb25zdGFudHMuZGVmYXVsdFNob3dEYXNoYm9hcmRUb2RvO1xuICAgIH1cblxuXG4gICAgc2V0IHNob3dEYXNoYm9hcmRCYW5uZXIodmFsdWU6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5fc2hvd0Rhc2hib2FyZEJhbm5lciA9IHZhbHVlO1xuICAgICAgICB0aGlzLnNhdmVUb0xvY2FsU3RvcmUodmFsdWUsIERCa2V5cy5TSE9XX0RBU0hCT0FSRF9CQU5ORVIpO1xuICAgIH1cbiAgICBnZXQgc2hvd0Rhc2hib2FyZEJhbm5lcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Nob3dEYXNoYm9hcmRCYW5uZXIgIT0gbnVsbCA/IHRoaXMuX3Nob3dEYXNoYm9hcmRCYW5uZXIgOiBDb25maWd1cmF0aW9uU2VydmljZUNvbnN0YW50cy5kZWZhdWx0U2hvd0Rhc2hib2FyZEJhbm5lcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgYmFzZVVybCA9IGVudmlyb25tZW50LmJhc2VVcmwgfHwgVXRpbGl0aWVzLmJhc2VVcmwoKTtcbiAgICBwdWJsaWMgdG9rZW5VcmwgPSBlbnZpcm9ubWVudC50b2tlblVybCB8fCBlbnZpcm9ubWVudC5iYXNlVXJsIHx8IFV0aWxpdGllcy5iYXNlVXJsKCk7XG4gICAgcHVibGljIGxvZ2luVXJsID0gZW52aXJvbm1lbnQubG9naW5Vcmw7XG4gICAgcHVibGljIGZhbGxiYWNrQmFzZVVybCA9ICdodHRwczovL3F1aWNrYXBwLmViZW5tb25uZXkuY29tJztcbiAgICAvLyAqKipFbmQgb2YgZGVmYXVsdHMqKipcblxuICAgIHByaXZhdGUgX2xhbmd1YWdlOiBzdHJpbmcgPSBudWxsO1xuICAgIHByaXZhdGUgX2hvbWVVcmw6IHN0cmluZyA9IG51bGw7XG4gICAgcHJpdmF0ZSBfdGhlbWVJZDogbnVtYmVyID0gbnVsbDtcbiAgICBwcml2YXRlIF9zaG93RGFzaGJvYXJkU3RhdGlzdGljczogYm9vbGVhbiA9IG51bGw7XG4gICAgcHJpdmF0ZSBfc2hvd0Rhc2hib2FyZE5vdGlmaWNhdGlvbnM6IGJvb2xlYW4gPSBudWxsO1xuICAgIHByaXZhdGUgX3Nob3dEYXNoYm9hcmRUb2RvOiBib29sZWFuID0gbnVsbDtcbiAgICBwcml2YXRlIF9zaG93RGFzaGJvYXJkQmFubmVyOiBib29sZWFuID0gbnVsbDtcblxuICAgIHByaXZhdGUgb25Db25maWd1cmF0aW9uSW1wb3J0ZWQ6IFN1YmplY3Q8Ym9vbGVhbj4gPSBuZXcgU3ViamVjdDxib29sZWFuPigpO1xuICAgIGNvbmZpZ3VyYXRpb25JbXBvcnRlZCQgPSB0aGlzLm9uQ29uZmlndXJhdGlvbkltcG9ydGVkLmFzT2JzZXJ2YWJsZSgpO1xuXG5cblxuICAgIHByaXZhdGUgbG9hZExvY2FsQ2hhbmdlcygpIHtcblxuICAgICAgICBpZiAodGhpcy5sb2NhbFN0b3JhZ2UuZXhpc3RzKERCa2V5cy5MQU5HVUFHRSkpIHtcbiAgICAgICAgICAgIHRoaXMuX2xhbmd1YWdlID0gdGhpcy5sb2NhbFN0b3JhZ2UuZ2V0RGF0YU9iamVjdDxzdHJpbmc+KERCa2V5cy5MQU5HVUFHRSwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy50cmFuc2xhdGlvblNlcnZpY2UuY2hhbmdlTGFuZ3VhZ2UodGhpcy5fbGFuZ3VhZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZXNldExhbmd1YWdlKCk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsU3RvcmFnZS5leGlzdHMoREJrZXlzLlRIRU1FX0lEKSkge1xuICAgICAgICAgICAgdGhpcy5fdGhlbWVJZCA9IHRoaXMubG9jYWxTdG9yYWdlLmdldERhdGFPYmplY3Q8bnVtYmVyPihEQmtleXMuVEhFTUVfSUQsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMudGhlbWVNYW5hZ2VyLmluc3RhbGxUaGVtZSh0aGlzLnRoZW1lTWFuYWdlci5nZXRUaGVtZUJ5SUQodGhpcy5fdGhlbWVJZCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZXNldFRoZW1lKCk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsU3RvcmFnZS5leGlzdHMoREJrZXlzLkhPTUVfVVJMKSkge1xuICAgICAgICAgICAgdGhpcy5faG9tZVVybCA9IHRoaXMubG9jYWxTdG9yYWdlLmdldERhdGFPYmplY3Q8c3RyaW5nPihEQmtleXMuSE9NRV9VUkwsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsU3RvcmFnZS5leGlzdHMoREJrZXlzLlNIT1dfREFTSEJPQVJEX1NUQVRJU1RJQ1MpKSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93RGFzaGJvYXJkU3RhdGlzdGljcyA9IHRoaXMubG9jYWxTdG9yYWdlLmdldERhdGFPYmplY3Q8Ym9vbGVhbj4oREJrZXlzLlNIT1dfREFTSEJPQVJEX1NUQVRJU1RJQ1MsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsU3RvcmFnZS5leGlzdHMoREJrZXlzLlNIT1dfREFTSEJPQVJEX05PVElGSUNBVElPTlMpKSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93RGFzaGJvYXJkTm90aWZpY2F0aW9ucyA9IHRoaXMubG9jYWxTdG9yYWdlLmdldERhdGFPYmplY3Q8Ym9vbGVhbj4oREJrZXlzLlNIT1dfREFTSEJPQVJEX05PVElGSUNBVElPTlMsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsU3RvcmFnZS5leGlzdHMoREJrZXlzLlNIT1dfREFTSEJPQVJEX1RPRE8pKSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93RGFzaGJvYXJkVG9kbyA9IHRoaXMubG9jYWxTdG9yYWdlLmdldERhdGFPYmplY3Q8Ym9vbGVhbj4oREJrZXlzLlNIT1dfREFTSEJPQVJEX1RPRE8sIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmxvY2FsU3RvcmFnZS5leGlzdHMoREJrZXlzLlNIT1dfREFTSEJPQVJEX0JBTk5FUikpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dEYXNoYm9hcmRCYW5uZXIgPSB0aGlzLmxvY2FsU3RvcmFnZS5nZXREYXRhT2JqZWN0PGJvb2xlYW4+KERCa2V5cy5TSE9XX0RBU0hCT0FSRF9CQU5ORVIsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgcHJpdmF0ZSBzYXZlVG9Mb2NhbFN0b3JlKGRhdGE6IGFueSwga2V5OiBzdHJpbmcpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmxvY2FsU3RvcmFnZS5zYXZlUGVybWFuZW50RGF0YShkYXRhLCBrZXkpKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBpbXBvcnQoanNvblZhbHVlOiBzdHJpbmcpIHtcblxuICAgICAgICB0aGlzLmNsZWFyTG9jYWxDaGFuZ2VzKCk7XG5cbiAgICAgICAgaWYgKGpzb25WYWx1ZSkge1xuICAgICAgICAgICAgY29uc3QgaW1wb3J0VmFsdWU6IFVzZXJDb25maWd1cmF0aW9uID0gVXRpbGl0aWVzLkpzb25UcnlQYXJzZShqc29uVmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAoaW1wb3J0VmFsdWUubGFuZ3VhZ2UgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMubGFuZ3VhZ2UgPSBpbXBvcnRWYWx1ZS5sYW5ndWFnZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGltcG9ydFZhbHVlLnRoZW1lSWQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMudGhlbWVJZCA9ICtpbXBvcnRWYWx1ZS50aGVtZUlkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaW1wb3J0VmFsdWUuaG9tZVVybCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ob21lVXJsID0gaW1wb3J0VmFsdWUuaG9tZVVybDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGltcG9ydFZhbHVlLnNob3dEYXNoYm9hcmRTdGF0aXN0aWNzICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dEYXNoYm9hcmRTdGF0aXN0aWNzID0gaW1wb3J0VmFsdWUuc2hvd0Rhc2hib2FyZFN0YXRpc3RpY3M7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpbXBvcnRWYWx1ZS5zaG93RGFzaGJvYXJkTm90aWZpY2F0aW9ucyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RGFzaGJvYXJkTm90aWZpY2F0aW9ucyA9IGltcG9ydFZhbHVlLnNob3dEYXNoYm9hcmROb3RpZmljYXRpb25zO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaW1wb3J0VmFsdWUuc2hvd0Rhc2hib2FyZFRvZG8gIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0Rhc2hib2FyZFRvZG8gPSBpbXBvcnRWYWx1ZS5zaG93RGFzaGJvYXJkVG9kbztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGltcG9ydFZhbHVlLnNob3dEYXNoYm9hcmRCYW5uZXIgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0Rhc2hib2FyZEJhbm5lciA9IGltcG9ydFZhbHVlLnNob3dEYXNoYm9hcmRCYW5uZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9uQ29uZmlndXJhdGlvbkltcG9ydGVkLm5leHQoKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBleHBvcnQoY2hhbmdlc09ubHkgPSB0cnVlKTogc3RyaW5nIHtcblxuICAgICAgICBjb25zdCBleHBvcnRWYWx1ZTogVXNlckNvbmZpZ3VyYXRpb24gPSB7XG4gICAgICAgICAgICBsYW5ndWFnZTogY2hhbmdlc09ubHkgPyB0aGlzLl9sYW5ndWFnZSA6IHRoaXMubGFuZ3VhZ2UsXG4gICAgICAgICAgICB0aGVtZUlkOiBjaGFuZ2VzT25seSA/IHRoaXMuX3RoZW1lSWQgOiB0aGlzLnRoZW1lSWQsXG4gICAgICAgICAgICBob21lVXJsOiBjaGFuZ2VzT25seSA/IHRoaXMuX2hvbWVVcmwgOiB0aGlzLmhvbWVVcmwsXG4gICAgICAgICAgICBzaG93RGFzaGJvYXJkU3RhdGlzdGljczogY2hhbmdlc09ubHkgPyB0aGlzLl9zaG93RGFzaGJvYXJkU3RhdGlzdGljcyA6IHRoaXMuc2hvd0Rhc2hib2FyZFN0YXRpc3RpY3MsXG4gICAgICAgICAgICBzaG93RGFzaGJvYXJkTm90aWZpY2F0aW9uczogY2hhbmdlc09ubHkgPyB0aGlzLl9zaG93RGFzaGJvYXJkTm90aWZpY2F0aW9ucyA6IHRoaXMuc2hvd0Rhc2hib2FyZE5vdGlmaWNhdGlvbnMsXG4gICAgICAgICAgICBzaG93RGFzaGJvYXJkVG9kbzogY2hhbmdlc09ubHkgPyB0aGlzLl9zaG93RGFzaGJvYXJkVG9kbyA6IHRoaXMuc2hvd0Rhc2hib2FyZFRvZG8sXG4gICAgICAgICAgICBzaG93RGFzaGJvYXJkQmFubmVyOiBjaGFuZ2VzT25seSA/IHRoaXMuX3Nob3dEYXNoYm9hcmRCYW5uZXIgOiB0aGlzLnNob3dEYXNoYm9hcmRCYW5uZXJcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZXhwb3J0VmFsdWUpO1xuICAgIH1cblxuXG4gICAgcHVibGljIGNsZWFyTG9jYWxDaGFuZ2VzKCkge1xuICAgICAgICB0aGlzLl9sYW5ndWFnZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3RoZW1lSWQgPSBudWxsO1xuICAgICAgICB0aGlzLl9ob21lVXJsID0gbnVsbDtcbiAgICAgICAgdGhpcy5fc2hvd0Rhc2hib2FyZFN0YXRpc3RpY3MgPSBudWxsO1xuICAgICAgICB0aGlzLl9zaG93RGFzaGJvYXJkTm90aWZpY2F0aW9ucyA9IG51bGw7XG4gICAgICAgIHRoaXMuX3Nob3dEYXNoYm9hcmRUb2RvID0gbnVsbDtcbiAgICAgICAgdGhpcy5fc2hvd0Rhc2hib2FyZEJhbm5lciA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UuZGVsZXRlRGF0YShEQmtleXMuTEFOR1VBR0UpO1xuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5kZWxldGVEYXRhKERCa2V5cy5USEVNRV9JRCk7XG4gICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmRlbGV0ZURhdGEoREJrZXlzLkhPTUVfVVJMKTtcbiAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UuZGVsZXRlRGF0YShEQmtleXMuU0hPV19EQVNIQk9BUkRfU1RBVElTVElDUyk7XG4gICAgICAgIHRoaXMubG9jYWxTdG9yYWdlLmRlbGV0ZURhdGEoREJrZXlzLlNIT1dfREFTSEJPQVJEX05PVElGSUNBVElPTlMpO1xuICAgICAgICB0aGlzLmxvY2FsU3RvcmFnZS5kZWxldGVEYXRhKERCa2V5cy5TSE9XX0RBU0hCT0FSRF9UT0RPKTtcbiAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2UuZGVsZXRlRGF0YShEQmtleXMuU0hPV19EQVNIQk9BUkRfQkFOTkVSKTtcblxuICAgICAgICB0aGlzLnJlc2V0TGFuZ3VhZ2UoKTtcbiAgICAgICAgdGhpcy5yZXNldFRoZW1lKCk7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIHJlc2V0TGFuZ3VhZ2UoKSB7XG4gICAgICAgIGNvbnN0IGxhbmd1YWdlID0gdGhpcy50cmFuc2xhdGlvblNlcnZpY2UudXNlQnJvd3Nlckxhbmd1YWdlKCk7XG5cbiAgICAgICAgaWYgKGxhbmd1YWdlKSB7XG4gICAgICAgICAgICB0aGlzLl9sYW5ndWFnZSA9IGxhbmd1YWdlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbGFuZ3VhZ2UgPSB0aGlzLnRyYW5zbGF0aW9uU2VydmljZS51c2VEZWZhdWx0TGFuZ2FnZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXNldFRoZW1lKCkge1xuICAgICAgICB0aGlzLnRoZW1lTWFuYWdlci5pbnN0YWxsVGhlbWUoKTtcbiAgICAgICAgdGhpcy5fdGhlbWVJZCA9IG51bGw7XG4gICAgfVxufVxuIl19