export class MySettingsService {
    _isMobile = sessionStorage.getItem('isMobile') == 'true';
    _settingsName = 'push-comes-to-shove';
    _version = 'v0.4'; // increase when settings object changes
    _settings = undefined;
    _defaultSettings = undefined;

    constructor() {
        this._loadSettings();
    }

    saveSettings(settings) {
        localStorage.setItem(this._settingsName, JSON.stringify(settings));
        this._settings = settings;
    }

    getSettings() {
        return this._settings || this._getDefaultSettings();
    }

    _getDefaultSettings() {
        this._defaultSettings = this._defaultSettings || {
            version: this._version
        };
        return this._defaultSettings;
    }

    resetSettings() {
        this._settings = this._getDefaultSettings();
        this.saveSettings(this._settings);
    }

    _loadSettings() {
        const settings = JSON.parse(localStorage.getItem(this._settingsName));
        if (!settings || settings.version !== this._version) this.resetSettings();
        else this._settings = settings;
    }
}
