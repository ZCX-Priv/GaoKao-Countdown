(function(GaoKao) {
    'use strict';

    GaoKao.Countdown = class Countdown {
        constructor(updateCallback) {
            this.updateCallback = updateCallback;
            this.timerId = null;
            this.targetDate = null;
            this.eventName = "高考";
            this.isRunning = false;
            this.showMs = false;
        }

        setTarget(customDate, eventName = "高考") {
            this.eventName = eventName;
            
            if (customDate instanceof Date && !isNaN(customDate.getTime())) {
                this.targetDate = customDate;
                const year = customDate.getFullYear();
                this.statusText = `距离 ${year} 年${eventName}还有:`;
                return;
            }
            
            const now = new Date();
            const currentYear = now.getFullYear();
            
            const examStart = new Date(currentYear, 5, 7, 9, 0, 0);
            const examEnd = new Date(currentYear, 5, 9, 18, 30, 0);

            if (now < examStart) {
                this.targetDate = examStart;
                this.statusText = `距离 ${currentYear} 年${eventName}还有:`;
            } else if (now >= examStart && now <= examEnd) {
                this.targetDate = examEnd;
                this.statusText = `距离 ${currentYear} 年${eventName}结束还有:`;
            } else {
                this.targetDate = new Date(currentYear + 1, 5, 7, 9, 0, 0);
                this.statusText = `距离 ${currentYear + 1} 年${eventName}还有:`;
            }
        }

        start(showMs = false) {
            this.showMs = showMs;
            if (this.isRunning) clearInterval(this.timerId);
            
            this.isRunning = true;
            this.tick();
            this.timerId = setInterval(() => this.tick(), this.showMs ? 10 : 1000);
        }

        stop() {
            clearInterval(this.timerId);
            this.isRunning = false;
        }

        tick() {
            const now = new Date();
            let diff = this.targetDate - now;

            if (diff <= 0) {
                diff = 0;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            const milliseconds = Math.floor((diff % 1000));

            this.updateCallback({
                days,
                hours,
                minutes,
                seconds,
                milliseconds,
                statusText: this.statusText,
                targetDate: this.targetDate
            });
        }
    };

})(window.GaoKao = window.GaoKao || {});
