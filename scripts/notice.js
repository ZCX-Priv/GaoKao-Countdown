(function(GaoKao) {
    'use strict';

    GaoKao.NoticeManager = class NoticeManager {
        constructor() {
            this.container = document.getElementById('notice-container');
        }

        show(message, duration = 3000) {
            const bubble = document.createElement('div');
            bubble.className = 'notice-bubble';
            
            // Check if liquid mode is active directly from localStorage to avoid async issues
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
                <span>${message}</span>
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
            bubble.style.animation = 'slideUp 0.3s forwards';
            bubble.addEventListener('animationend', () => {
                if (bubble.parentElement) {
                    bubble.remove();
                }
            });
        }
    };

})(window.GaoKao = window.GaoKao || {});
