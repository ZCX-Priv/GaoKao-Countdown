(function(GaoKao) {
    'use strict';

    GaoKao.NoticeManager = class NoticeManager {
        constructor() {
            this.container = document.getElementById('notice-container');
        }

        show(message, duration = 3000) {
            const bubble = document.createElement('div');
            bubble.className = 'notice-bubble';
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
