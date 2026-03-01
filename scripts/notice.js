(function(GaoKao) {
    'use strict';

    GaoKao.NoticeManager = class NoticeManager {
        constructor() {
            this.container = document.getElementById('notice-container');
        }

        show(message, type = 'info', duration = 3000) {
            const bubble = document.createElement('div');
            bubble.className = 'notice-bubble';
            if (type === 'error') {
                bubble.classList.add('error');
            }
            
            const icon = type === 'error' ? '✗' : '✓';
            
            // 从 localStorage 直接检查流光模式是否激活，以避免异步问题
            try {
                const stored = localStorage.getItem('gaokao_countdown_settings');
                if (stored) {
                    const settings = JSON.parse(stored);
                    if (settings.liquidEffect) {
                        bubble.classList.add('liquid-mode');
                    }
                }
            } catch (e) {
                console.warn('Failed to read settings for notice style:', e);
            }

            bubble.innerHTML = `
                <span>${icon} ${message}</span>
                <button class="notice-close">&times;</button>
            `;
            
            const closeBtn = bubble.querySelector('.notice-close');
            closeBtn.onclick = () => this.remove(bubble);

            this.container.appendChild(bubble);

            if (duration > 0) {
                setTimeout(() => this.remove(bubble), duration);
            }
        }

        remove(bubble) {
            const stored = localStorage.getItem('gaokao_countdown_settings');
            let enableAnimation = false;
            try {
                if (stored) {
                    const settings = JSON.parse(stored);
                    enableAnimation = settings.enableAnimation;
                }
            } catch (e) {
                console.warn('Failed to read settings for notice remove:', e);
            }
            
            if (!enableAnimation) {
                if (bubble.parentElement) {
                    bubble.remove();
                }
                return;
            }
            
            bubble.style.animation = 'slideUp 0.3s forwards';
            bubble.addEventListener('animationend', () => {
                if (bubble.parentElement) {
                    bubble.remove();
                }
            });
        }
    };

})(window.GaoKao = window.GaoKao || {});
