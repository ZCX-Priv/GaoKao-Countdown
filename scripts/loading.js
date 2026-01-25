(function(GaoKao) {
    'use strict';

    GaoKao.LoadingManager = class LoadingManager {
        constructor() {
            this.loadingPage = document.getElementById('loading-page');
            this.app = document.getElementById('app');
            this.isFinished = false;
            this.canFinish = false;
            this.loadedResources = false;
        }

        start() {
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
            
            this.loadingPage.style.opacity = '0';
            setTimeout(() => {
                this.loadingPage.classList.add('hidden');
                this.app.classList.remove('hidden');
            }, 500);
        }
    };

})(window.GaoKao = window.GaoKao || {});
