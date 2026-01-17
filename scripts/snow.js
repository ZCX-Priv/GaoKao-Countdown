(function(GaoKao) {
    'use strict';

    GaoKao.SnowManager = class SnowManager {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.width = 0;
            this.height = 0;
            this.particles = [];
            this.animationId = null;
            this.active = false;
            
            this.handleResize = this.resize.bind(this);
        }

        init() {
            if (this.canvas) return;

            this.canvas = document.createElement('canvas');
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '5';
            this.canvas.id = 'snow-canvas';
            
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            
            window.addEventListener('resize', this.handleResize);
            this.resize();
        }

        resize() {
            if (!this.canvas) return;
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        }

        createParticles() {
            const particleCount = Math.floor(this.width * 0.15);
            this.particles = [];
            for (let i = 0; i < particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    radius: Math.random() * 3 + 1,
                    speedY: Math.random() * 1 + 0.5,
                    speedX: Math.random() * 0.5 - 0.25,
                    opacity: Math.random() * 0.5 + 0.3
                });
            }
        }

        start() {
            if (this.active) return;
            this.init();
            this.createParticles();
            this.active = true;
            this.canvas.style.display = 'block';
            this.animate();
        }

        stop() {
            this.active = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            if (this.canvas) {
                this.canvas.style.display = 'none';
            }
        }

        animate() {
            if (!this.active) return;

            this.ctx.clearRect(0, 0, this.width, this.height);

            for (const p of this.particles) {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                this.ctx.fill();

                p.y += p.speedY;
                p.x += p.speedX;

                if (p.y > this.height) {
                    p.y = -p.radius;
                    p.x = Math.random() * this.width;
                }
                if (p.x > this.width) {
                    p.x = 0;
                } else if (p.x < 0) {
                    p.x = this.width;
                }
            }

            this.animationId = requestAnimationFrame(() => this.animate());
        }
    };

})(window.GaoKao = window.GaoKao || {});
