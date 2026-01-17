(function(GaoKao) {
    'use strict';

    const STORAGE_KEY = 'gaokao_countdown_settings';

    const DEFAULT_SETTINGS = {
        themeMode: 'system',
        showMs: false,
        snowEffect: false,
        liquidEffect: false,
        enableAnimation: true,
        eventName: '高考',
        targetDate: null,
        targetTime: '09:00',
        bgSource: 'bing',
        bgColor: 'blue',
        quoteType: ['all']
    };

    GaoKao.SettingsManager = class SettingsManager {
        constructor() {
            this.settings = { ...DEFAULT_SETTINGS };
        }

        init() {
            return new Promise((resolve) => {
                this.loadSettings();
                this.applySettings();
                resolve(this.settings);
            });
        }

        loadSettings() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
                }
            } catch (e) {
                console.warn('Failed to load settings:', e);
            }
        }

        saveSettings(newSettings) {
            this.settings = { ...this.settings, ...newSettings };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
            } catch (e) {
                console.warn('Failed to save settings:', e);
            }
            this.applySettings();
        }

        applySettings() {
            const html = document.documentElement;
            
            if (this.settings.themeMode === 'system') {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                html.setAttribute('data-theme', isDark ? 'dark' : 'light');
            } else {
                html.setAttribute('data-theme', this.settings.themeMode);
            }

            window.dispatchEvent(new CustomEvent('settingsChanged', { detail: this.settings }));
        }
        
        getSettings() {
            return this.settings;
        }
    };

})(window.GaoKao = window.GaoKao || {});
