import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Utilities } from '@polpware/ngx-appkit-contracts-alpha';
import { StorageManagerConstants } from '@polpware/ngx-appkit-contracts-alpha';
import * as i0 from "@angular/core";
/**
* Provides a wrapper for accessing the web storage API and synchronizing session storage across tabs/windows.
*/
export class LocalStoreManager {
    constructor() {
        this.syncKeys = [];
        this.initEvent = new Subject();
        this.reservedKeys = [
            'sync_keys',
            'addToSyncKeys',
            'removeFromSyncKeys',
            'getSessionStorage',
            'setSessionStorage',
            'addToSessionStorage',
            'removeFromSessionStorage',
            'clearAllSessionsStorage'
        ];
        this.sessionStorageTransferHandler = (event) => {
            if (!event.newValue) {
                return;
            }
            if (event.key == 'getSessionStorage') {
                if (sessionStorage.length) {
                    this.localStorageSetItem('setSessionStorage', sessionStorage);
                    localStorage.removeItem('setSessionStorage');
                }
            }
            else if (event.key == 'setSessionStorage') {
                if (!this.syncKeys.length) {
                    this.loadSyncKeys();
                }
                const data = JSON.parse(event.newValue);
                // console.info("Set => Key: Transfer setSessionStorage" + ",  data: " + JSON.stringify(data));
                for (const key in data) {
                    if (this.syncKeysContains(key)) {
                        this.sessionStorageSetItem(key, JSON.parse(data[key]));
                    }
                }
                this.onInit();
            }
            else if (event.key == 'addToSessionStorage') {
                const data = JSON.parse(event.newValue);
                // console.warn("Set => Key: Transfer addToSessionStorage" + ",  data: " + JSON.stringify(data));
                this.addToSessionStorageHelper(data.data, data.key);
            }
            else if (event.key == 'removeFromSessionStorage') {
                this.removeFromSessionStorageHelper(event.newValue);
            }
            else if (event.key == 'clearAllSessionsStorage' && sessionStorage.length) {
                this.clearInstanceSessionStorage();
            }
            else if (event.key == 'addToSyncKeys') {
                this.addToSyncKeysHelper(event.newValue);
            }
            else if (event.key == 'removeFromSyncKeys') {
                this.removeFromSyncKeysHelper(event.newValue);
            }
        };
    }
    initialiseStorageSyncListener() {
        if (LocalStoreManager.syncListenerInitialised == true) {
            return;
        }
        LocalStoreManager.syncListenerInitialised = true;
        window.addEventListener('storage', this.sessionStorageTransferHandler, false);
        this.syncSessionStorage();
    }
    deinitialiseStorageSyncListener() {
        window.removeEventListener('storage', this.sessionStorageTransferHandler, false);
        LocalStoreManager.syncListenerInitialised = false;
    }
    clearAllStorage() {
        this.clearAllSessionsStorage();
        this.clearLocalStorage();
    }
    clearAllSessionsStorage() {
        this.clearInstanceSessionStorage();
        localStorage.removeItem(LocalStoreManager.DBKEY_SYNC_KEYS);
        localStorage.setItem('clearAllSessionsStorage', '_dummy');
        localStorage.removeItem('clearAllSessionsStorage');
    }
    clearInstanceSessionStorage() {
        sessionStorage.clear();
        this.syncKeys = [];
    }
    clearLocalStorage() {
        localStorage.clear();
    }
    saveSessionData(data, key = StorageManagerConstants.DBKEY_USER_DATA) {
        this.testForInvalidKeys(key);
        this.removeFromSyncKeys(key);
        localStorage.removeItem(key);
        this.sessionStorageSetItem(key, data);
    }
    saveSyncedSessionData(data, key = StorageManagerConstants.DBKEY_USER_DATA) {
        this.testForInvalidKeys(key);
        localStorage.removeItem(key);
        this.addToSessionStorage(data, key);
    }
    savePermanentData(data, key = StorageManagerConstants.DBKEY_USER_DATA) {
        this.testForInvalidKeys(key);
        this.removeFromSessionStorage(key);
        this.localStorageSetItem(key, data);
    }
    moveDataToSessionStorage(key = StorageManagerConstants.DBKEY_USER_DATA) {
        this.testForInvalidKeys(key);
        const data = this.getData(key);
        if (data == null) {
            return;
        }
        this.saveSessionData(data, key);
    }
    moveDataToSyncedSessionStorage(key = StorageManagerConstants.DBKEY_USER_DATA) {
        this.testForInvalidKeys(key);
        const data = this.getData(key);
        if (data == null) {
            return;
        }
        this.saveSyncedSessionData(data, key);
    }
    moveDataToPermanentStorage(key = StorageManagerConstants.DBKEY_USER_DATA) {
        this.testForInvalidKeys(key);
        const data = this.getData(key);
        if (data == null) {
            return;
        }
        this.savePermanentData(data, key);
    }
    exists(key = StorageManagerConstants.DBKEY_USER_DATA) {
        let data = sessionStorage.getItem(key);
        if (data == null) {
            data = localStorage.getItem(key);
        }
        return data != null;
    }
    getData(key = StorageManagerConstants.DBKEY_USER_DATA) {
        this.testForInvalidKeys(key);
        let data = this.sessionStorageGetItem(key);
        if (data == null) {
            data = this.localStorageGetItem(key);
        }
        return data;
    }
    getDataObject(key = StorageManagerConstants.DBKEY_USER_DATA, isDateType = false) {
        let data = this.getData(key);
        if (data != null) {
            if (isDateType) {
                data = new Date(data);
            }
            return data;
        }
        else {
            return null;
        }
    }
    deleteData(key = StorageManagerConstants.DBKEY_USER_DATA) {
        this.testForInvalidKeys(key);
        this.removeFromSessionStorage(key);
        localStorage.removeItem(key);
    }
    getInitEvent() {
        return this.initEvent.asObservable();
    }
    syncSessionStorage() {
        localStorage.setItem('getSessionStorage', '_dummy');
        localStorage.removeItem('getSessionStorage');
    }
    addToSessionStorage(data, key) {
        this.addToSessionStorageHelper(data, key);
        this.addToSyncKeysBackup(key);
        this.localStorageSetItem('addToSessionStorage', { key, data });
        localStorage.removeItem('addToSessionStorage');
    }
    addToSessionStorageHelper(data, key) {
        this.addToSyncKeysHelper(key);
        this.sessionStorageSetItem(key, data);
    }
    removeFromSessionStorage(keyToRemove) {
        this.removeFromSessionStorageHelper(keyToRemove);
        this.removeFromSyncKeysBackup(keyToRemove);
        localStorage.setItem('removeFromSessionStorage', keyToRemove);
        localStorage.removeItem('removeFromSessionStorage');
    }
    removeFromSessionStorageHelper(keyToRemove) {
        sessionStorage.removeItem(keyToRemove);
        this.removeFromSyncKeysHelper(keyToRemove);
    }
    testForInvalidKeys(key) {
        if (!key) {
            throw new Error('key cannot be empty');
        }
        if (this.reservedKeys.some(x => x == key)) {
            throw new Error(`The storage key "${key}" is reserved and cannot be used. Please use a different key`);
        }
    }
    syncKeysContains(key) {
        return this.syncKeys.some(x => x == key);
    }
    loadSyncKeys() {
        if (this.syncKeys.length) {
            return;
        }
        this.syncKeys = this.getSyncKeysFromStorage();
    }
    getSyncKeysFromStorage(defaultValue = []) {
        const data = this.localStorageGetItem(LocalStoreManager.DBKEY_SYNC_KEYS);
        if (data == null) {
            return defaultValue;
        }
        else {
            return data;
        }
    }
    addToSyncKeys(key) {
        this.addToSyncKeysHelper(key);
        this.addToSyncKeysBackup(key);
        localStorage.setItem('addToSyncKeys', key);
        localStorage.removeItem('addToSyncKeys');
    }
    addToSyncKeysBackup(key) {
        const storedSyncKeys = this.getSyncKeysFromStorage();
        if (!storedSyncKeys.some(x => x == key)) {
            storedSyncKeys.push(key);
            this.localStorageSetItem(LocalStoreManager.DBKEY_SYNC_KEYS, storedSyncKeys);
        }
    }
    removeFromSyncKeysBackup(key) {
        const storedSyncKeys = this.getSyncKeysFromStorage();
        const index = storedSyncKeys.indexOf(key);
        if (index > -1) {
            storedSyncKeys.splice(index, 1);
            this.localStorageSetItem(LocalStoreManager.DBKEY_SYNC_KEYS, storedSyncKeys);
        }
    }
    addToSyncKeysHelper(key) {
        if (!this.syncKeysContains(key)) {
            this.syncKeys.push(key);
        }
    }
    removeFromSyncKeys(key) {
        this.removeFromSyncKeysHelper(key);
        this.removeFromSyncKeysBackup(key);
        localStorage.setItem('removeFromSyncKeys', key);
        localStorage.removeItem('removeFromSyncKeys');
    }
    removeFromSyncKeysHelper(key) {
        const index = this.syncKeys.indexOf(key);
        if (index > -1) {
            this.syncKeys.splice(index, 1);
        }
    }
    localStorageSetItem(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
    sessionStorageSetItem(key, data) {
        sessionStorage.setItem(key, JSON.stringify(data));
    }
    localStorageGetItem(key) {
        return Utilities.JsonTryParse(localStorage.getItem(key));
    }
    sessionStorageGetItem(key) {
        return Utilities.JsonTryParse(sessionStorage.getItem(key));
    }
    onInit() {
        setTimeout(() => {
            this.initEvent.next();
            this.initEvent.complete();
        });
    }
}
LocalStoreManager.syncListenerInitialised = false;
LocalStoreManager.DBKEY_SYNC_KEYS = 'sync_keys';
/** @nocollapse */ LocalStoreManager.ɵfac = function LocalStoreManager_Factory(t) { return new (t || LocalStoreManager)(); };
/** @nocollapse */ LocalStoreManager.ɵprov = i0.ɵɵdefineInjectable({ token: LocalStoreManager, factory: LocalStoreManager.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(LocalStoreManager, [{
        type: Injectable
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWwtc3RvcmUtbWFuYWdlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHBvbHB3YXJlL25neC1hcHBraXQtc2VydmljZXMtYWxwaGEvIiwic291cmNlcyI6WyJsaWIvc2VydmljZXMvbG9jYWwtc3RvcmUtbWFuYWdlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUUzQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFFakUsT0FBTyxFQUVILHVCQUF1QixFQUMxQixNQUFNLHNDQUFzQyxDQUFDOztBQUc5Qzs7RUFFRTtBQUNGLE1BQU0sT0FBTyxpQkFBaUI7SUFKOUI7UUFRWSxhQUFRLEdBQWEsRUFBRSxDQUFDO1FBQ3hCLGNBQVMsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBRTFCLGlCQUFZLEdBQ2hCO1lBQ0ksV0FBVztZQUNYLGVBQWU7WUFDZixvQkFBb0I7WUFDcEIsbUJBQW1CO1lBQ25CLG1CQUFtQjtZQUNuQixxQkFBcUI7WUFDckIsMEJBQTBCO1lBQzFCLHlCQUF5QjtTQUM1QixDQUFDO1FBZ0pFLGtDQUE2QixHQUFHLENBQUMsS0FBbUIsRUFBRSxFQUFFO1lBQzVELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO2dCQUNqQixPQUFPO2FBQ1Y7WUFFRCxJQUFJLEtBQUssQ0FBQyxHQUFHLElBQUksbUJBQW1CLEVBQUU7Z0JBQ2xDLElBQUksY0FBYyxDQUFDLE1BQU0sRUFBRTtvQkFDdkIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLG1CQUFtQixFQUFFLGNBQWMsQ0FBQyxDQUFDO29CQUM5RCxZQUFZLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUM7aUJBQ2hEO2FBQ0o7aUJBQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxJQUFJLG1C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T0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVPLHFCQUFxQixDQUFDLEdBQVcsRUFBRSxJQUFTO1FBQ2hELGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU8sbUJBQW1CLENBQUMsR0FBVztRQUNuQyxPQUFPLFNBQVMsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFTyxxQkFBcUIsQ0FBQyxHQUFXO1FBQ3JDLE9BQU8sU0FBUyxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVPLE1BQU07UUFDVixVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQzs7QUFyVmMseUNBQXVCLEdBQUcsS0FBSyxDQUFDO0FBRXZCLGlDQUFlLEdBQUcsV0FBVyxDQUFDO3FHQUg3QyxpQkFBaUI7NEVBQWpCLGlCQUFpQixXQUFqQixpQkFBaUI7a0RBQWpCLGlCQUFpQjtjQUo3QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IFV0aWxpdGllcyB9IGZyb20gJ0Bwb2xwd2FyZS9uZ3gtYXBwa2l0LWNvbnRyYWN0cy1hbHBoYSc7XG5cbmltcG9ydCB7XG4gICAgSUxvY2FsU3RvcmVNYW5hZ2VyQ29udHJhY3QsXG4gICAgU3RvcmFnZU1hbmFnZXJDb25zdGFudHNcbn0gZnJvbSAnQHBvbHB3YXJlL25neC1hcHBraXQtY29udHJhY3RzLWFscGhhJztcblxuQEluamVjdGFibGUoKVxuLyoqXG4qIFByb3ZpZGVzIGEgd3JhcHBlciBmb3IgYWNjZXNzaW5nIHRoZSB3ZWIgc3RvcmFnZSBBUEkgYW5kIHN5bmNocm9uaXppbmcgc2Vzc2lvbiBzdG9yYWdlIGFjcm9zcyB0YWJzL3dpbmRvd3MuXG4qL1xuZXhwb3J0IGNsYXNzIExvY2FsU3RvcmVNYW5hZ2VyIGltcGxlbWVudHMgSUxvY2FsU3RvcmVNYW5hZ2VyQ29udHJhY3Qge1xuICAgIHByaXZhdGUgc3RhdGljIHN5bmNMaXN0ZW5lckluaXRpYWxpc2VkID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBEQktFWV9TWU5DX0tFWVMgPSAnc3luY19rZXlzJztcbiAgICBwcml2YXRlIHN5bmNLZXlzOiBzdHJpbmdbXSA9IFtdO1xuICAgIHByaXZhdGUgaW5pdEV2ZW50ID0gbmV3IFN1YmplY3QoKTtcblxuICAgIHByaXZhdGUgcmVzZXJ2ZWRLZXlzOiBzdHJpbmdbXSA9XG4gICAgICAgIFtcbiAgICAgICAgICAgICdzeW5jX2tleXMnLFxuICAgICAgICAgICAgJ2FkZFRvU3luY0tleXMnLFxuICAgICAgICAgICAgJ3JlbW92ZUZyb21TeW5jS2V5cycsXG4gICAgICAgICAgICAnZ2V0U2Vzc2lvblN0b3JhZ2UnLFxuICAgICAgICAgICAgJ3NldFNlc3Npb25TdG9yYWdlJyxcbiAgICAgICAgICAgICdhZGRUb1Nlc3Npb25TdG9yYWdlJyxcbiAgICAgICAgICAgICdyZW1vdmVGcm9tU2Vzc2lvblN0b3JhZ2UnLFxuICAgICAgICAgICAgJ2NsZWFyQWxsU2Vzc2lvbnNTdG9yYWdlJ1xuICAgICAgICBdO1xuXG5cbiAgICBwdWJsaWMgaW5pdGlhbGlzZVN0b3JhZ2VTeW5jTGlzdGVuZXIoKSB7XG4gICAgICAgIGlmIChMb2NhbFN0b3JlTWFuYWdlci5zeW5jTGlzdGVuZXJJbml0aWFsaXNlZCA9PSB0cnVlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBMb2NhbFN0b3JlTWFuYWdlci5zeW5jTGlzdGVuZXJJbml0aWFsaXNlZCA9IHRydWU7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgdGhpcy5zZXNzaW9uU3RvcmFnZVRyYW5zZmVySGFuZGxlciwgZmFsc2UpO1xuICAgICAgICB0aGlzLnN5bmNTZXNzaW9uU3RvcmFnZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBkZWluaXRpYWxpc2VTdG9yYWdlU3luY0xpc3RlbmVyKCkge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc3RvcmFnZScsIHRoaXMuc2Vzc2lvblN0b3JhZ2VUcmFuc2ZlckhhbmRsZXIsIGZhbHNlKTtcbiAgICAgICAgTG9jYWxTdG9yZU1hbmFnZXIuc3luY0xpc3RlbmVySW5pdGlhbGlzZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJBbGxTdG9yYWdlKCkge1xuICAgICAgICB0aGlzLmNsZWFyQWxsU2Vzc2lvbnNTdG9yYWdlKCk7XG4gICAgICAgIHRoaXMuY2xlYXJMb2NhbFN0b3JhZ2UoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJBbGxTZXNzaW9uc1N0b3JhZ2UoKSB7XG4gICAgICAgIHRoaXMuY2xlYXJJbnN0YW5jZVNlc3Npb25TdG9yYWdlKCk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKExvY2FsU3RvcmVNYW5hZ2VyLkRCS0VZX1NZTkNfS0VZUyk7XG5cbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2NsZWFyQWxsU2Vzc2lvbnNTdG9yYWdlJywgJ19kdW1teScpO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnY2xlYXJBbGxTZXNzaW9uc1N0b3JhZ2UnKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJJbnN0YW5jZVNlc3Npb25TdG9yYWdlKCkge1xuICAgICAgICBzZXNzaW9uU3RvcmFnZS5jbGVhcigpO1xuICAgICAgICB0aGlzLnN5bmNLZXlzID0gW107XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyTG9jYWxTdG9yYWdlKCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2UuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2F2ZVNlc3Npb25EYXRhKGRhdGE6IGFueSwga2V5ID0gU3RvcmFnZU1hbmFnZXJDb25zdGFudHMuREJLRVlfVVNFUl9EQVRBKSB7XG4gICAgICAgIHRoaXMudGVzdEZvckludmFsaWRLZXlzKGtleSk7XG5cbiAgICAgICAgdGhpcy5yZW1vdmVGcm9tU3luY0tleXMoa2V5KTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcbiAgICAgICAgdGhpcy5zZXNzaW9uU3RvcmFnZVNldEl0ZW0oa2V5LCBkYXRhKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2F2ZVN5bmNlZFNlc3Npb25EYXRhKGRhdGE6IGFueSwga2V5ID0gU3RvcmFnZU1hbmFnZXJDb25zdGFudHMuREJLRVlfVVNFUl9EQVRBKSB7XG4gICAgICAgIHRoaXMudGVzdEZvckludmFsaWRLZXlzKGtleSk7XG5cbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcbiAgICAgICAgdGhpcy5hZGRUb1Nlc3Npb25TdG9yYWdlKGRhdGEsIGtleSk7XG4gICAgfVxuXG4gICAgcHVibGljIHNhdmVQZXJtYW5lbnREYXRhKGRhdGE6IGFueSwga2V5ID0gU3RvcmFnZU1hbmFnZXJDb25zdGFudHMuREJLRVlfVVNFUl9EQVRBKSB7XG4gICAgICAgIHRoaXMudGVzdEZvckludmFsaWRLZXlzKGtleSk7XG5cbiAgICAgICAgdGhpcy5yZW1vdmVGcm9tU2Vzc2lvblN0b3JhZ2Uoa2V5KTtcbiAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2VTZXRJdGVtKGtleSwgZGF0YSk7XG4gICAgfVxuXG4gICAgcHVibGljIG1vdmVEYXRhVG9TZXNzaW9uU3RvcmFnZShrZXkgPSBTdG9yYWdlTWFuYWdlckNvbnN0YW50cy5EQktFWV9VU0VSX0RBVEEpIHtcbiAgICAgICAgdGhpcy50ZXN0Rm9ySW52YWxpZEtleXMoa2V5KTtcblxuICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5nZXREYXRhKGtleSk7XG5cbiAgICAgICAgaWYgKGRhdGEgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zYXZlU2Vzc2lvbkRhdGEoZGF0YSwga2V5KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbW92ZURhdGFUb1N5bmNlZFNlc3Npb25TdG9yYWdlKGtleSA9IFN0b3JhZ2VNYW5hZ2VyQ29uc3RhbnRzLkRCS0VZX1VTRVJfREFUQSkge1xuICAgICAgICB0aGlzLnRlc3RGb3JJbnZhbGlkS2V5cyhrZXkpO1xuXG4gICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLmdldERhdGEoa2V5KTtcblxuICAgICAgICBpZiAoZGF0YSA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNhdmVTeW5jZWRTZXNzaW9uRGF0YShkYXRhLCBrZXkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBtb3ZlRGF0YVRvUGVybWFuZW50U3RvcmFnZShrZXkgPSBTdG9yYWdlTWFuYWdlckNvbnN0YW50cy5EQktFWV9VU0VSX0RBVEEpIHtcbiAgICAgICAgdGhpcy50ZXN0Rm9ySW52YWxpZEtleXMoa2V5KTtcblxuICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5nZXREYXRhKGtleSk7XG5cbiAgICAgICAgaWYgKGRhdGEgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zYXZlUGVybWFuZW50RGF0YShkYXRhLCBrZXkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBleGlzdHMoa2V5ID0gU3RvcmFnZU1hbmFnZXJDb25zdGFudHMuREJLRVlfVVNFUl9EQVRBKSB7XG4gICAgICAgIGxldCBkYXRhID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuXG4gICAgICAgIGlmIChkYXRhID09IG51bGwpIHtcbiAgICAgICAgICAgIGRhdGEgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRhdGEgIT0gbnVsbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RGF0YShrZXkgPSBTdG9yYWdlTWFuYWdlckNvbnN0YW50cy5EQktFWV9VU0VSX0RBVEEpIHtcbiAgICAgICAgdGhpcy50ZXN0Rm9ySW52YWxpZEtleXMoa2V5KTtcblxuICAgICAgICBsZXQgZGF0YSA9IHRoaXMuc2Vzc2lvblN0b3JhZ2VHZXRJdGVtKGtleSk7XG5cbiAgICAgICAgaWYgKGRhdGEgPT0gbnVsbCkge1xuICAgICAgICAgICAgZGF0YSA9IHRoaXMubG9jYWxTdG9yYWdlR2V0SXRlbShrZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuXG4gICAgcHVibGljIGdldERhdGFPYmplY3Q8VD4oa2V5ID0gU3RvcmFnZU1hbmFnZXJDb25zdGFudHMuREJLRVlfVVNFUl9EQVRBLCBpc0RhdGVUeXBlID0gZmFsc2UpOiBUIHtcbiAgICAgICAgbGV0IGRhdGEgPSB0aGlzLmdldERhdGEoa2V5KTtcblxuICAgICAgICBpZiAoZGF0YSAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoaXNEYXRlVHlwZSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBuZXcgRGF0ZShkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkYXRhIGFzIFQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBkZWxldGVEYXRhKGtleSA9IFN0b3JhZ2VNYW5hZ2VyQ29uc3RhbnRzLkRCS0VZX1VTRVJfREFUQSkge1xuICAgICAgICB0aGlzLnRlc3RGb3JJbnZhbGlkS2V5cyhrZXkpO1xuXG4gICAgICAgIHRoaXMucmVtb3ZlRnJvbVNlc3Npb25TdG9yYWdlKGtleSk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEluaXRFdmVudCgpOiBPYnNlcnZhYmxlPHt9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmluaXRFdmVudC5hc09ic2VydmFibGUoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNlc3Npb25TdG9yYWdlVHJhbnNmZXJIYW5kbGVyID0gKGV2ZW50OiBTdG9yYWdlRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCFldmVudC5uZXdWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PSAnZ2V0U2Vzc2lvblN0b3JhZ2UnKSB7XG4gICAgICAgICAgICBpZiAoc2Vzc2lvblN0b3JhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2VTZXRJdGVtKCdzZXRTZXNzaW9uU3RvcmFnZScsIHNlc3Npb25TdG9yYWdlKTtcbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnc2V0U2Vzc2lvblN0b3JhZ2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5rZXkgPT0gJ3NldFNlc3Npb25TdG9yYWdlJykge1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuc3luY0tleXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkU3luY0tleXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGV2ZW50Lm5ld1ZhbHVlKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUuaW5mbyhcIlNldCA9PiBLZXk6IFRyYW5zZmVyIHNldFNlc3Npb25TdG9yYWdlXCIgKyBcIiwgIGRhdGE6IFwiICsgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBkYXRhKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zeW5jS2V5c0NvbnRhaW5zKGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXNzaW9uU3RvcmFnZVNldEl0ZW0oa2V5LCBKU09OLnBhcnNlKGRhdGFba2V5XSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vbkluaXQoKTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5rZXkgPT0gJ2FkZFRvU2Vzc2lvblN0b3JhZ2UnKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGV2ZW50Lm5ld1ZhbHVlKTtcblxuICAgICAgICAgICAgLy8gY29uc29sZS53YXJuKFwiU2V0ID0+IEtleTogVHJhbnNmZXIgYWRkVG9TZXNzaW9uU3RvcmFnZVwiICsgXCIsICBkYXRhOiBcIiArIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcblxuICAgICAgICAgICAgdGhpcy5hZGRUb1Nlc3Npb25TdG9yYWdlSGVscGVyKGRhdGEuZGF0YSwgZGF0YS5rZXkpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleSA9PSAncmVtb3ZlRnJvbVNlc3Npb25TdG9yYWdlJykge1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUZyb21TZXNzaW9uU3RvcmFnZUhlbHBlcihldmVudC5uZXdWYWx1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09ICdjbGVhckFsbFNlc3Npb25zU3RvcmFnZScgJiYgc2Vzc2lvblN0b3JhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFySW5zdGFuY2VTZXNzaW9uU3RvcmFnZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleSA9PSAnYWRkVG9TeW5jS2V5cycpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkVG9TeW5jS2V5c0hlbHBlcihldmVudC5uZXdWYWx1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09ICdyZW1vdmVGcm9tU3luY0tleXMnKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUZyb21TeW5jS2V5c0hlbHBlcihldmVudC5uZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHN5bmNTZXNzaW9uU3RvcmFnZSgpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2dldFNlc3Npb25TdG9yYWdlJywgJ19kdW1teScpO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnZ2V0U2Vzc2lvblN0b3JhZ2UnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZFRvU2Vzc2lvblN0b3JhZ2UoZGF0YTogYW55LCBrZXk6IHN0cmluZykge1xuICAgICAgICB0aGlzLmFkZFRvU2Vzc2lvblN0b3JhZ2VIZWxwZXIoZGF0YSwga2V5KTtcbiAgICAgICAgdGhpcy5hZGRUb1N5bmNLZXlzQmFja3VwKGtleSk7XG5cbiAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2VTZXRJdGVtKCdhZGRUb1Nlc3Npb25TdG9yYWdlJywgeyBrZXksIGRhdGEgfSk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdhZGRUb1Nlc3Npb25TdG9yYWdlJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRUb1Nlc3Npb25TdG9yYWdlSGVscGVyKGRhdGE6IGFueSwga2V5OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5hZGRUb1N5bmNLZXlzSGVscGVyKGtleSk7XG4gICAgICAgIHRoaXMuc2Vzc2lvblN0b3JhZ2VTZXRJdGVtKGtleSwgZGF0YSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW1vdmVGcm9tU2Vzc2lvblN0b3JhZ2Uoa2V5VG9SZW1vdmU6IHN0cmluZykge1xuICAgICAgICB0aGlzLnJlbW92ZUZyb21TZXNzaW9uU3RvcmFnZUhlbHBlcihrZXlUb1JlbW92ZSk7XG4gICAgICAgIHRoaXMucmVtb3ZlRnJvbVN5bmNLZXlzQmFja3VwKGtleVRvUmVtb3ZlKTtcblxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncmVtb3ZlRnJvbVNlc3Npb25TdG9yYWdlJywga2V5VG9SZW1vdmUpO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgncmVtb3ZlRnJvbVNlc3Npb25TdG9yYWdlJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW1vdmVGcm9tU2Vzc2lvblN0b3JhZ2VIZWxwZXIoa2V5VG9SZW1vdmU6IHN0cmluZykge1xuXG4gICAgICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oa2V5VG9SZW1vdmUpO1xuICAgICAgICB0aGlzLnJlbW92ZUZyb21TeW5jS2V5c0hlbHBlcihrZXlUb1JlbW92ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0ZXN0Rm9ySW52YWxpZEtleXMoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigna2V5IGNhbm5vdCBiZSBlbXB0eScpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucmVzZXJ2ZWRLZXlzLnNvbWUoeCA9PiB4ID09IGtleSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHN0b3JhZ2Uga2V5IFwiJHtrZXl9XCIgaXMgcmVzZXJ2ZWQgYW5kIGNhbm5vdCBiZSB1c2VkLiBQbGVhc2UgdXNlIGEgZGlmZmVyZW50IGtleWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzeW5jS2V5c0NvbnRhaW5zKGtleTogc3RyaW5nKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuc3luY0tleXMuc29tZSh4ID0+IHggPT0ga2V5KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvYWRTeW5jS2V5cygpIHtcbiAgICAgICAgaWYgKHRoaXMuc3luY0tleXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN5bmNLZXlzID0gdGhpcy5nZXRTeW5jS2V5c0Zyb21TdG9yYWdlKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTeW5jS2V5c0Zyb21TdG9yYWdlKGRlZmF1bHRWYWx1ZTogc3RyaW5nW10gPSBbXSk6IHN0cmluZ1tdIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMubG9jYWxTdG9yYWdlR2V0SXRlbShMb2NhbFN0b3JlTWFuYWdlci5EQktFWV9TWU5DX0tFWVMpO1xuXG4gICAgICAgIGlmIChkYXRhID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YSBhcyBzdHJpbmdbXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYWRkVG9TeW5jS2V5cyhrZXk6IHN0cmluZykge1xuICAgICAgICB0aGlzLmFkZFRvU3luY0tleXNIZWxwZXIoa2V5KTtcbiAgICAgICAgdGhpcy5hZGRUb1N5bmNLZXlzQmFja3VwKGtleSk7XG5cbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2FkZFRvU3luY0tleXMnLCBrZXkpO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnYWRkVG9TeW5jS2V5cycpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYWRkVG9TeW5jS2V5c0JhY2t1cChrZXk6IHN0cmluZykge1xuICAgICAgICBjb25zdCBzdG9yZWRTeW5jS2V5cyA9IHRoaXMuZ2V0U3luY0tleXNGcm9tU3RvcmFnZSgpO1xuXG4gICAgICAgIGlmICghc3RvcmVkU3luY0tleXMuc29tZSh4ID0+IHggPT0ga2V5KSkge1xuICAgICAgICAgICAgc3RvcmVkU3luY0tleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgdGhpcy5sb2NhbFN0b3JhZ2VTZXRJdGVtKExvY2FsU3RvcmVNYW5hZ2VyLkRCS0VZX1NZTkNfS0VZUywgc3RvcmVkU3luY0tleXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW1vdmVGcm9tU3luY0tleXNCYWNrdXAoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3Qgc3RvcmVkU3luY0tleXMgPSB0aGlzLmdldFN5bmNLZXlzRnJvbVN0b3JhZ2UoKTtcblxuICAgICAgICBjb25zdCBpbmRleCA9IHN0b3JlZFN5bmNLZXlzLmluZGV4T2Yoa2V5KTtcblxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgc3RvcmVkU3luY0tleXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIHRoaXMubG9jYWxTdG9yYWdlU2V0SXRlbShMb2NhbFN0b3JlTWFuYWdlci5EQktFWV9TWU5DX0tFWVMsIHN0b3JlZFN5bmNLZXlzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYWRkVG9TeW5jS2V5c0hlbHBlcihrZXk6IHN0cmluZykge1xuICAgICAgICBpZiAoIXRoaXMuc3luY0tleXNDb250YWlucyhrZXkpKSB7XG4gICAgICAgICAgICB0aGlzLnN5bmNLZXlzLnB1c2goa2V5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVtb3ZlRnJvbVN5bmNLZXlzKGtleTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRnJvbVN5bmNLZXlzSGVscGVyKGtleSk7XG4gICAgICAgIHRoaXMucmVtb3ZlRnJvbVN5bmNLZXlzQmFja3VwKGtleSk7XG5cbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3JlbW92ZUZyb21TeW5jS2V5cycsIGtleSk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdyZW1vdmVGcm9tU3luY0tleXMnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbW92ZUZyb21TeW5jS2V5c0hlbHBlcihrZXk6IHN0cmluZykge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuc3luY0tleXMuaW5kZXhPZihrZXkpO1xuXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnN5bmNLZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGxvY2FsU3RvcmFnZVNldEl0ZW0oa2V5OiBzdHJpbmcsIGRhdGE6IGFueSkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNlc3Npb25TdG9yYWdlU2V0SXRlbShrZXk6IHN0cmluZywgZGF0YTogYW55KSB7XG4gICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oa2V5LCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2NhbFN0b3JhZ2VHZXRJdGVtKGtleTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBVdGlsaXRpZXMuSnNvblRyeVBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2Vzc2lvblN0b3JhZ2VHZXRJdGVtKGtleTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBVdGlsaXRpZXMuSnNvblRyeVBhcnNlKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oa2V5KSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkluaXQoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbml0RXZlbnQubmV4dCgpO1xuICAgICAgICAgICAgdGhpcy5pbml0RXZlbnQuY29tcGxldGUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19