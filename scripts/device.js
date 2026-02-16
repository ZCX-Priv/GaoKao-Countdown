(function(GaoKao) {
    'use strict';

    const MEMORY_THRESHOLD_GB = 4;

    GaoKao.DeviceManager = class DeviceManager {
        constructor() {
            this.deviceMemory = 0;
            this.isLowMemoryDevice = false;
            this.detectionFailed = false;
        }

        detect() {
            this.checkDeviceMemory();
            return this;
        }

        checkDeviceMemory() {
            const memory = navigator.deviceMemory;

            if (memory === undefined) {
                this.detectionFailed = true;
                this.isLowMemoryDevice = true;
                this.deviceMemory = 0;
                console.warn('Device memory detection not supported, defaulting to low memory mode');
                return;
            }

            this.deviceMemory = memory;
            this.isLowMemoryDevice = memory < MEMORY_THRESHOLD_GB;

            console.log(`Device memory: ${memory}GB, Low memory device: ${this.isLowMemoryDevice}`);
        }

        shouldEnableAnimation() {
            if (this.detectionFailed || this.isLowMemoryDevice) {
                return false;
            }
            return true;
        }

        getDeviceMemory() {
            return this.deviceMemory;
        }

        isDetectionFailed() {
            return this.detectionFailed;
        }
    };

})(window.GaoKao = window.GaoKao || {});
