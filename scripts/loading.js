(function(GaoKao) {
    'use strict';

    GaoKao.LoadingManager = class LoadingManager {
        constructor() {
            this.loadingPage = document.getElementById('loading-page');
            this.loadingText = document.getElementById('loading-text');
            this.app = document.getElementById('app');
            this.loadingTimer = null;
            this.isFinished = false;
            this.canFinish = false;
            this.loadedResources = false;
        }

        start() {
            this.loadingText.style.opacity = '0';
            this.loadingTimer = setTimeout(() => {
                this.loadingText.style.opacity = '1';
            }, 2000);
        }

        setLoaded() {
            this.loadedResources = true;
            if (this.canFinish) {
                this.finish();
            }
        }

        checkAndFinish() {
            this.canFinish = true;
            if (this.loadedResources) {
                this.finish();
            }
        }

        finish() {
            if (this.isFinished || !this.canFinish) return;
            this.isFinished = true;
            
            if (this.loadingTimer) {
                clearTimeout(this.loadingTimer);
                this.loadingTimer = null;
            }
            
            this.loadingPage.style.opacity = '0';
            setTimeout(() => {
                this.loadingPage.classList.add('hidden');
                this.app.classList.remove('hidden');
            }, 500);
        }
    };

})(window.GaoKao = window.GaoKao || {});
