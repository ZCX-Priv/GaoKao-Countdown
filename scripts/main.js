(function() {
    'use strict';

    const { SettingsManager, Countdown, LoadingManager, QuoteManager, NoticeManager, SnowManager } = GaoKao;

    class LiquidManager {
        constructor() {
            this.overlay = document.getElementById('liquid-overlay');
            this.clipPath = document.getElementById('cards-clip');
            this.rafId = null;
            this.isRunning = false;
        }
        
        getCards() {
             // Dynamically fetch visible cards including modal if active
             const cards = Array.from(document.querySelectorAll('.glass-card, .glass-card-sm, .quote-card, .notice-bubble'));
             const modal = document.querySelector('.modal-container');
             // Only add modal if it's visible (closest overlay not hidden) AND not closing
             if (modal) {
                 const overlay = modal.closest('.modal-overlay');
                 if (overlay && !overlay.classList.contains('hidden') && !overlay.classList.contains('closing')) {
                     cards.push(modal);
                 }
             }
             return cards;
        }

        start() {
            if (this.isRunning) return;
            this.isRunning = true;
            this.overlay.classList.add('active');
            this.update();
        }

        stop() {
            this.isRunning = false;
            this.overlay.classList.remove('active');
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
        }

        update() {
            if (!this.isRunning) return;

            // Clear existing rects
            while (this.clipPath.firstChild) {
                this.clipPath.removeChild(this.clipPath.firstChild);
            }

            // Create new rects for each visible card
            const cards = this.getCards();
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    const svgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    svgRect.setAttribute('x', rect.left);
                    svgRect.setAttribute('y', rect.top);
                    svgRect.setAttribute('width', rect.width);
                    svgRect.setAttribute('height', rect.height);
                    svgRect.setAttribute('rx', '20'); // Matches border-radius
                    svgRect.setAttribute('ry', '20');
                    this.clipPath.appendChild(svgRect);
                }
            });

            this.rafId = requestAnimationFrame(this.update.bind(this));
        }

        setBackground(style) {
            // Copy relevant background properties from an element style or string
            // For simplicity, we assume we receive the final background string or logic here
            // But actually, we should just sync with document.body.style
            
            // In this specific app structure, body background is set inline.
            // So we can just copy it.
            this.overlay.style.backgroundImage = document.body.style.backgroundImage;
        }
    }

    class App {
        constructor() {
            this.settingsManager = new SettingsManager();
            this.countdown = new Countdown(this.updateUI.bind(this));
            this.loadingManager = new LoadingManager();
            this.quoteManager = new QuoteManager();
            this.noticeManager = new NoticeManager();
            this.snowManager = new SnowManager();
            this.liquidManager = new LiquidManager();

            this.previousValues = {
                days: null,
                hours: null,
                minutes: null,
                seconds: null,
                milliseconds: null
            };

            this.dom = {
                app: document.getElementById('app'),
                countdownTitle: document.getElementById('countdown-title'),
                days: document.getElementById('days'),
                hours: document.getElementById('hours'),
                minutes: document.getElementById('minutes'),
                seconds: document.getElementById('seconds'),
                milliseconds: document.getElementById('milliseconds'),
                msContainer: document.getElementById('ms-container'),
                settingsBtn: document.getElementById('settings-btn'),
                settingsModal: document.getElementById('settings-modal'),
                closeSettings: document.getElementById('close-settings'),
                glassCards: document.querySelectorAll('.glass-card, .glass-card-sm'),
                loadingPage: document.getElementById('loading-page'),
                appContainer: document.getElementById('app'),
                bgColorContainer: document.getElementById('bg-color-container'),
                themeMode: document.getElementById('theme-mode'),
                bgSource: document.getElementById('bg-source'),
                bgColorRadios: document.getElementsByName('bg-color'),
                quoteTypeGroup: document.getElementById('quote-type-group'),
                quoteTypeCheckboxes: document.getElementsByName('quote-type'),
                showMs: document.getElementById('show-ms'),
                snowEffect: document.getElementById('snow-effect'),
                liquidEffect: document.getElementById('liquid-effect'),
                enableAnimation: document.getElementById('enable-animation'),
                eventName: document.getElementById('event-name'),
                targetDate: document.getElementById('target-date'),
                targetTime: document.getElementById('target-time'),
                tabs: document.querySelectorAll('.tab-btn'),
                panes: document.querySelectorAll('.tab-pane')
            };
        }

        async init() {
            await this.settingsManager.init();
            const settings = this.settingsManager.getSettings();
            
            if (!settings.enableAnimation) {
                document.body.style.transition = 'none';
                this.dom.loadingPage.style.transition = 'none';
                this.dom.appContainer.style.transition = 'none';
                this.dom.appContainer.style.animation = 'none';
            }
            
            const targetDate = settings.targetDate ? new Date(`${settings.targetDate}T${settings.targetTime}`) : null;
            this.countdown.setTarget(targetDate, settings.eventName);
            this.countdown.start(settings.showMs);

            this.syncSettingsUI(settings);
            this.applyVisualSettings(settings);
            this.bindEvents();
            
            this.loadingManager.start();
            
            this.quoteManager.load(settings.quoteType).then(() => {
                this.loadingManager.setLoaded();
            });
            
            this.waitForBgLoaded();
            
            setTimeout(() => {
                this.loadingManager.checkAndFinish();
            }, 2000);
        }

        waitForBgLoaded() {
            const settings = this.settingsManager.getSettings();
            if (settings.bgSource !== 'bing') return;
            const bgUrl = 'https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN';
            const img = new Image();
            img.onload = () => {
                document.body.style.backgroundImage = `url('${bgUrl}')`;
            };
            img.onerror = () => {
                document.body.style.backgroundImage = '';
            };
            img.src = bgUrl;
        }

        syncSettingsUI(settings) {
            this.dom.themeMode.value = settings.themeMode;
            this.dom.bgSource.value = settings.bgSource;
            
            const quoteTypes = Array.isArray(settings.quoteType) ? settings.quoteType : [];
            for (const checkbox of this.dom.quoteTypeCheckboxes) {
                checkbox.checked = quoteTypes.includes(checkbox.value);
            }
            
            this.dom.showMs.checked = settings.showMs;
            this.dom.snowEffect.checked = settings.snowEffect;
            this.dom.liquidEffect.checked = settings.liquidEffect;
            this.dom.enableAnimation.checked = settings.enableAnimation;
            this.dom.eventName.value = settings.eventName;
            this.dom.targetDate.value = settings.targetDate || '';
            this.dom.targetTime.value = settings.targetTime || '09:00';
            
            for (const radio of this.dom.bgColorRadios) {
                if (radio.value === settings.bgColor) {
                    radio.checked = true;
                    break;
                }
            }
            
            if (settings.bgSource === 'color') {
                this.dom.bgColorContainer.style.display = 'flex';
            } else {
                this.dom.bgColorContainer.style.display = 'none';
            }
            
            if (settings.showMs) {
                this.dom.msContainer.classList.remove('hidden');
            } else {
                this.dom.msContainer.classList.add('hidden');
            }
        }

        applyVisualSettings(settings) {
            if (settings.snowEffect) {
                this.snowManager.start();
            } else {
                this.snowManager.stop();
            }

            // Toggle Liquid Effect
            if (settings.liquidEffect) {
                this.liquidManager.start();
                this.dom.glassCards.forEach(card => card.classList.add('liquid-mode'));
                if (this.dom.settingsModal.querySelector('.modal-container')) {
                    this.dom.settingsModal.querySelector('.modal-container').classList.add('liquid-mode');
                }
                // Update any existing notices
                document.querySelectorAll('.notice-bubble').forEach(n => n.classList.add('liquid-mode'));
            } else {
                this.liquidManager.stop();
                this.dom.glassCards.forEach(card => card.classList.remove('liquid-mode'));
                if (this.dom.settingsModal.querySelector('.modal-container')) {
                    this.dom.settingsModal.querySelector('.modal-container').classList.remove('liquid-mode');
                }
                // Update any existing notices
                document.querySelectorAll('.notice-bubble').forEach(n => n.classList.remove('liquid-mode'));
            }

            // Clean up inline filters just in case
            this.dom.glassCards.forEach(card => {
                card.style.filter = '';
            });

            const updateOverlayBg = () => {
                if (settings.liquidEffect) {
                    this.liquidManager.setBackground();
                }
            };

            if (settings.bgSource === 'bing') {
                const bgUrl = 'https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN';
                const img = new Image();
                img.onload = () => {
                    document.body.style.backgroundImage = `url('${bgUrl}')`;
                    updateOverlayBg();
                };
                img.onerror = () => {
                    document.body.style.backgroundImage = 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
                    updateOverlayBg();
                };
                img.src = bgUrl;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundAttachment = 'fixed';
            } else if (settings.bgSource === 'color') {
                const colorMap = {
                    'blue': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    'orange': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                    'purple': 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                    'green': 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'
                };
                document.body.style.backgroundImage = colorMap[settings.bgColor] || colorMap['blue'];
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundAttachment = 'fixed';
                updateOverlayBg();
            } else {
                document.body.style.backgroundImage = 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundAttachment = 'fixed';
                updateOverlayBg();
            }
        }

        bindEvents() {
            const settings = this.settingsManager.getSettings();
            const isAnimationEnabled = () => this.settingsManager.getSettings().enableAnimation;
            
            this.dom.settingsBtn.addEventListener('click', () => {
                this.dom.settingsModal.classList.remove('closing'); // Reset closing state if any
                if (isAnimationEnabled()) {
                    this.dom.settingsModal.classList.remove('hidden');
                } else {
                    this.dom.settingsModal.classList.remove('hidden');
                    this.dom.settingsModal.classList.add('no-animation');
                }
            });

            const closeSettingsHandler = () => {
                if (!isAnimationEnabled()) {
                    this.dom.settingsModal.classList.add('hidden');
                    this.dom.settingsModal.classList.remove('no-animation');
                    return;
                }

                this.dom.settingsModal.classList.add('closing');
                
                const container = this.dom.settingsModal.querySelector('.modal-container');
                const onAnimationEnd = () => {
                    this.dom.settingsModal.classList.remove('closing');
                    this.dom.settingsModal.classList.add('hidden');
                    this.dom.settingsModal.classList.remove('no-animation'); // Cleanup
                    container.removeEventListener('animationend', onAnimationEnd);
                };
                
                container.addEventListener('animationend', onAnimationEnd, { once: true });
            };

            this.dom.closeSettings.addEventListener('click', closeSettingsHandler);

            this.dom.settingsModal.addEventListener('click', (e) => {
                if (e.target === this.dom.settingsModal) {
                    closeSettingsHandler();
                }
            });

            this.dom.tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    this.dom.tabs.forEach(t => t.classList.remove('active'));
                    this.dom.panes.forEach(p => p.classList.remove('active'));
                    
                    tab.classList.add('active');
                    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
                });
            });

            this.dom.bgSource.addEventListener('change', () => {
                if (this.dom.bgSource.value === 'color') {
                    this.dom.bgColorContainer.style.display = 'flex';
                } else {
                    this.dom.bgColorContainer.style.display = 'none';
                }
            });

            const quoteAllCheckbox = document.getElementById('quote-all');
            this.dom.quoteTypeCheckboxes.forEach(checkbox => {
                if (checkbox.id !== 'quote-all') {
                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked) {
                            quoteAllCheckbox.checked = false;
                        } else {
                            const anyChecked = Array.from(this.dom.quoteTypeCheckboxes)
                                .filter(cb => cb.id !== 'quote-all')
                                .some(cb => cb.checked);
                            if (!anyChecked) {
                                quoteAllCheckbox.checked = true;
                            }
                        }
                    });
                }
            });

            quoteAllCheckbox.addEventListener('change', () => {
                if (quoteAllCheckbox.checked) {
                    this.dom.quoteTypeCheckboxes.forEach(cb => {
                        if (cb.id !== 'quote-all') {
                            cb.checked = false;
                        }
                    });
                }
            });

            const saveHandler = () => {
                let bgColor = 'blue';
                for (const radio of this.dom.bgColorRadios) {
                    if (radio.checked) {
                        bgColor = radio.value;
                        break;
                    }
                }

                const quoteTypes = [];
                for (const checkbox of this.dom.quoteTypeCheckboxes) {
                    if (checkbox.checked) {
                        quoteTypes.push(checkbox.value);
                    }
                }

                const newSettings = {
                    themeMode: this.dom.themeMode.value,
                    bgSource: this.dom.bgSource.value,
                    bgColor: bgColor,
                    quoteType: quoteTypes,
                    showMs: this.dom.showMs.checked,
                    snowEffect: this.dom.snowEffect.checked,
                    liquidEffect: this.dom.liquidEffect.checked,
                    enableAnimation: this.dom.enableAnimation.checked,
                    eventName: this.dom.eventName.value || '高考',
                    targetDate: this.dom.targetDate.value || null,
                    targetTime: this.dom.targetTime.value || '09:00'
                };
                this.settingsManager.saveSettings(newSettings);
                
                this.noticeManager.show('设置已保存');
            };

            const inputs = [
                this.dom.themeMode, this.dom.bgSource, 
                this.dom.showMs, this.dom.snowEffect,
                this.dom.liquidEffect, this.dom.enableAnimation,
                this.dom.eventName, this.dom.targetDate, this.dom.targetTime
            ];
            
            inputs.forEach(input => {
                input.addEventListener('change', saveHandler);
            });

            this.dom.bgColorRadios.forEach(radio => {
                radio.addEventListener('change', saveHandler);
                radio.addEventListener('blur', saveHandler);
            });

            this.dom.quoteTypeCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', saveHandler);
            });

            this.dom.eventName.addEventListener('blur', saveHandler);
            this.dom.targetDate.addEventListener('change', saveHandler);
            this.dom.targetTime.addEventListener('change', saveHandler);

            window.addEventListener('settingsChanged', (e) => {
                const settings = e.detail;
                
                const targetDate = settings.targetDate ? new Date(`${settings.targetDate}T${settings.targetTime}`) : null;
                this.countdown.setTarget(targetDate, settings.eventName);
                this.countdown.start(settings.showMs);
                
                this.applyVisualSettings(settings);
                
                if (settings.showMs) {
                    this.dom.msContainer.classList.remove('hidden');
                } else {
                    this.dom.msContainer.classList.add('hidden');
                }

                this.quoteManager.load(settings.quoteType);
            });
        }

        updateUI(data) {
            this.dom.days.textContent = String(data.days).padStart(2, '0');
            this.dom.hours.textContent = String(data.hours).padStart(2, '0');
            this.dom.minutes.textContent = String(data.minutes).padStart(2, '0');
            this.dom.seconds.textContent = String(data.seconds).padStart(2, '0');

            if (this.dom.milliseconds) {
                this.dom.milliseconds.textContent = String(data.milliseconds).padStart(3, '0');
            }

            if (this.dom.countdownTitle.textContent !== data.statusText) {
                this.dom.countdownTitle.textContent = data.statusText;
            }

            const timeValues = [this.dom.days, this.dom.hours, this.dom.minutes, this.dom.seconds, this.dom.milliseconds].filter(el => el);
            const isEnded = data.statusText.includes('结束');

            timeValues.forEach(el => {
                el.classList.remove('urgent', 'ended');
                if (isEnded) {
                    el.classList.add('ended');
                } else if (data.days < 60) {
                    el.classList.add('urgent');
                }
            });

            if (this.settingsManager.getSettings().enableAnimation) {
                this.animateChangedValues(data);
            }
        }

        animateChangedValues(data) {
            const valueMap = {
                days: data.days,
                hours: data.hours,
                minutes: data.minutes,
                seconds: data.seconds,
                milliseconds: data.milliseconds
            };

            const elements = {
                days: this.dom.days,
                hours: this.dom.hours,
                minutes: this.dom.minutes,
                seconds: this.dom.seconds,
                milliseconds: this.dom.milliseconds
            };

            Object.keys(valueMap).forEach(key => {
                const currentValue = valueMap[key];
                const element = elements[key];

                if (this.previousValues[key] !== currentValue) {
                    element.classList.remove('bounce');
                    void element.offsetWidth;
                    element.classList.add('bounce');
                }
            });

            this.previousValues = { ...valueMap };
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        const app = new App();
        app.init();
    });

})();
