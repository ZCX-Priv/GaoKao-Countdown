(function() {
    'use strict';

    const { SettingsManager, Countdown, LoadingManager, QuoteManager, NoticeManager, SnowManager, DeviceManager } = GaoKao;

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
            this.deviceManager = new DeviceManager().detect();
            this.settingsManager = new SettingsManager(this.deviceManager);
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

            this.isDateMode = false;
            
            this.isInitializing = true;

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
                fullscreenBtn: document.getElementById('fullscreen-btn'),
                settingsModal: document.getElementById('settings-modal'),
                closeSettings: document.getElementById('close-settings'),
                glassCards: document.querySelectorAll('.glass-card, .glass-card-sm'),
                loadingPage: document.getElementById('loading-page'),
                appContainer: document.getElementById('app'),
                bgColorContainer: document.getElementById('bg-color-container'),
                themeMode: document.getElementById('theme-mode'),
                bgSource: document.getElementById('bg-source'),
                bgColorRadios: document.getElementsByName('bg-color'),
                textColorRadios: document.getElementsByName('text-color'),
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
            
            const targetDate = settings.targetDate ? new Date(`${settings.targetDate.replace(/\//g, '-')}T${settings.targetTime}`) : null;
            this.countdown.setTarget(targetDate, settings.eventName);
            this.countdown.start(settings.showMs);

            this.syncSettingsUI(settings);
            this.applyVisualSettings(settings);
            this.bindEvents();
            
            this.isInitializing = false;
            
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
            const themeBtns = this.dom.themeMode.querySelectorAll('.theme-icon-btn');
            themeBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.value === settings.themeMode);
            });
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
            
            for (const radio of this.dom.textColorRadios) {
                if (radio.value === settings.textColor) {
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

            this.updateThemeModeState(settings.liquidEffect);
        }

        updateThemeModeState(liquidEnabled) {
            const themeItem = this.dom.themeMode.closest('.setting-item');
            const themeBtns = this.dom.themeMode.querySelectorAll('.theme-icon-btn');
            if (liquidEnabled) {
                themeBtns.forEach(btn => btn.disabled = true);
                themeItem.classList.add('disabled');
            } else {
                themeBtns.forEach(btn => btn.disabled = false);
                themeItem.classList.remove('disabled');
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

            const countdownDisplay = document.querySelector('.countdown-display');
            const textColor = settings.textColor === 'black' ? '#000000' : '#ffffff';
            
            document.documentElement.style.setProperty('--text-color', textColor);
        }

        bindEvents() {
            const settings = this.settingsManager.getSettings();
            const isAnimationEnabled = () => this.settingsManager.getSettings().enableAnimation;
            
            const countdownCard = document.getElementById('countdown-card');
            const timeElements = [this.dom.days, this.dom.hours, this.dom.minutes, this.dom.seconds, this.dom.milliseconds];
            countdownCard.addEventListener('click', (e) => {
                this.isDateMode = !this.isDateMode;
                countdownCard.classList.remove('switching');
                void countdownCard.offsetWidth;
                countdownCard.classList.add('switching');
                timeElements.forEach(el => {
                    if (el && !el.classList.contains('hidden')) {
                        el.classList.remove('tick');
                        void el.offsetWidth;
                        el.classList.add('tick');
                    }
                });
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                const rect = countdownCard.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                countdownCard.appendChild(ripple);
                setTimeout(() => {
                    ripple.remove();
                    countdownCard.classList.remove('switching');
                }, 400);
                if (this.isDateMode) {
                    this.countdown.stop();
                    this.countdown.start(this.settingsManager.getSettings().showMs);
                } else {
                    this.countdown.stop();
                    this.countdown.start(this.settingsManager.getSettings().showMs);
                }
            });
            
            this.dom.settingsBtn.addEventListener('click', () => {
                this.dom.settingsModal.classList.remove('closing');
                if (isAnimationEnabled()) {
                    this.dom.settingsModal.classList.remove('hidden');
                } else {
                    this.dom.settingsModal.classList.remove('hidden');
                    this.dom.settingsModal.classList.add('no-animation');
                }
                const settings = this.settingsManager.getSettings();
                const textColor = settings.textColor === 'black' ? '#000000' : '#ffffff';
                document.documentElement.style.setProperty('--text-color', textColor);
            });

            this.dom.fullscreenBtn.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        this.noticeManager.show('无法进入全屏模式');
                    });
                } else {
                    document.exitFullscreen();
                }
            });

            document.addEventListener('fullscreenchange', () => {
                const svg = this.dom.fullscreenBtn.querySelector('svg');
                if (document.fullscreenElement) {
                    svg.innerHTML = '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>';
                } else {
                    svg.innerHTML = '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>';
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
                if (this.isInitializing) return;
                
                const targetDateValue = this.dom.targetDate.value.trim();
                const targetTimeValue = this.dom.targetTime.value.trim();
                
                let normalizedDate = '';
                let normalizedTime = '';

                if (targetDateValue) {
                    const normalizedDateValue = targetDateValue.replace(/／/g, '/').replace(/－/g, '-');
                    const dateRegex = /^(\d{1,4})\/(\d{1,2})\/(\d{1,2})$|^(\d{1,4})-(\d{1,2})-(\d{1,2})$/;
                    const match = normalizedDateValue.match(dateRegex);
                    if (!match) {
                        this.noticeManager.show('日期格式错误，请使用 年/月/日 或 年-月-日 格式', 'error');
                        return;
                    }
                    const year = match[1] ? Number(match[1]) : Number(match[4]);
                    const month = match[2] ? Number(match[2]) : Number(match[5]);
                    const day = match[3] ? Number(match[3]) : Number(match[6]);
                    if (year < 1900 || year > 9999) {
                        this.noticeManager.show('年份无效，请输入1900-9999之间的年份', 'error');
                        return;
                    }
                    const dateObj = new Date(year, month - 1, day);
                    if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
                        this.noticeManager.show('日期无效，请输入正确的日期', 'error');
                        return;
                    }
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    const todayTimestamp = now.getTime();
                    const inputTimestamp = new Date(year, month - 1, day).getTime();
                    const isToday = inputTimestamp === todayTimestamp;
                    if (inputTimestamp < todayTimestamp) {
                        this.noticeManager.show('日期必须晚于今天', 'error');
                        return;
                    }
                    const dateStr = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
                    
                    if (targetDateValue !== normalizedDateValue) {
                        this.dom.targetDate.value = dateStr;
                    }
                    
                    normalizedDate = dateStr;
                }
                
                if (targetTimeValue) {
                    const normalizedTimeValue = targetTimeValue.replace(/：/g, ':').replace(/－/g, '-');
                    const timeRegex = /^(\d{1,2}):(\d{1,2})$|^(\d{1,2})-(\d{1,2})$/;
                    const match = normalizedTimeValue.match(timeRegex);
                    if (!match) {
                        this.noticeManager.show('时间格式错误，请使用 时:分 或 时-分 格式', 'error');
                        return;
                    }
                    const hours = match[1] ? Number(match[1]) : Number(match[3]);
                    const minutes = match[2] ? Number(match[2]) : Number(match[4]);
                    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                        this.noticeManager.show('时间无效，请输入0-23时0-59分', 'error');
                        return;
                    }
                    if (normalizedDate) {
                        const now = new Date();
                        const todayStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
                        if (normalizedDate === todayStr) {
                            const currentHours = now.getHours();
                            const currentMinutes = now.getMinutes();
                            if (hours < currentHours || (hours === currentHours && minutes <= currentMinutes)) {
                                this.noticeManager.show('今天的时间必须晚于当前时间', 'error');
                                return;
                            }
                        }
                    }
                    normalizedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                    
                    if (targetTimeValue !== normalizedTimeValue) {
                        this.dom.targetTime.value = normalizedTime;
                    }
                }
                
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

                const activeThemeBtn = this.dom.themeMode.querySelector('.theme-icon-btn.active');
                const themeMode = activeThemeBtn ? activeThemeBtn.dataset.value : 'system';

                const newSettings = {
                    themeMode: themeMode,
                    bgSource: this.dom.bgSource.value,
                    bgColor: bgColor,
                    quoteType: quoteTypes,
                    showMs: this.dom.showMs.checked,
                    snowEffect: this.dom.snowEffect.checked,
                    liquidEffect: this.dom.liquidEffect.checked,
                    enableAnimation: this.dom.enableAnimation.checked,
                    eventName: this.dom.eventName.value || '高考',
                    targetDate: normalizedDate || null,
                    targetTime: normalizedTime || '09:00',
                    textColor: (() => {
                        for (const radio of this.dom.textColorRadios) {
                            if (radio.checked) return radio.value;
                        }
                        return 'white';
                    })()
                };
                this.settingsManager.saveSettings(newSettings);
                
                this.noticeManager.show('设置已保存');
            };

            const inputs = [
                this.dom.bgSource, 
                this.dom.showMs, this.dom.snowEffect,
                this.dom.liquidEffect, this.dom.enableAnimation
            ];
            
            inputs.forEach(input => {
                input.addEventListener('change', saveHandler);
            });

            this.dom.eventName.addEventListener('blur', saveHandler);
            this.dom.targetDate.addEventListener('change', saveHandler);
            this.dom.targetTime.addEventListener('change', saveHandler);

            const themeBtns = this.dom.themeMode.querySelectorAll('.theme-icon-btn');
            themeBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    themeBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    saveHandler();
                });
            });

            this.dom.bgColorRadios.forEach(radio => {
                radio.addEventListener('change', saveHandler);
                radio.addEventListener('blur', saveHandler);
            });

            this.dom.textColorRadios.forEach(radio => {
                radio.addEventListener('change', saveHandler);
            });

            this.dom.quoteTypeCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', saveHandler);
            });

            this.dom.liquidEffect.addEventListener('change', () => {
                this.updateThemeModeState(this.dom.liquidEffect.checked);
            });

            window.addEventListener('settingsChanged', (e) => {
                const settings = e.detail;
                
                const targetDate = settings.targetDate ? new Date(`${settings.targetDate.replace(/\//g, '-')}T${settings.targetTime}`) : null;
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
            if (this.isDateMode) {
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth() + 1;
                const day = now.getDate();
                const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
                const weekday = weekdays[now.getDay()];
                
                const dateText = `${year}年${month}月${day}日 ${weekday}`;
                if (this.dom.countdownTitle.textContent !== dateText) {
                    this.dom.countdownTitle.textContent = dateText;
                }
                
                const hours = now.getHours();
                const minutes = now.getMinutes();
                const seconds = now.getSeconds();
                const milliseconds = now.getMilliseconds();
                
                this.dom.hours.textContent = String(hours).padStart(2, '0');
                this.dom.minutes.textContent = String(minutes).padStart(2, '0');
                this.dom.seconds.textContent = String(seconds).padStart(2, '0');
                
                if (this.dom.milliseconds) {
                    this.dom.milliseconds.textContent = String(milliseconds).padStart(3, '0');
                }
                
                this.dom.days.parentElement.classList.add('hidden');
                const currentSettings = this.settingsManager.getSettings();
                if (currentSettings.showMs) {
                    this.dom.msContainer.classList.remove('hidden');
                } else {
                    this.dom.msContainer.classList.add('hidden');
                }
            } else {
                this.dom.days.parentElement.classList.remove('hidden');
                const currentSettings = this.settingsManager.getSettings();
                if (currentSettings.showMs) {
                    this.dom.msContainer.classList.remove('hidden');
                }
                
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
                    element.classList.remove('tick');
                    void element.offsetWidth;
                    element.classList.add('tick');
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
