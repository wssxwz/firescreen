// Realistic Fireworks Engine - Based on professional algorithms
// Inspired by Firework_Simulator

const PI_2 = Math.PI * 2;
const GRAVITY = 0.9;

class Shell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = -12 - Math.random() * 3;
        this.life = 1;
        this.trail = [];
        this.color = `hsl(${Math.random() * 60 + 15}, 100%, 70%)`;
    }

    update() {
        this.vy += GRAVITY * 0.015;
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.01;

        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 20) this.trail.shift();
        this.trail.forEach(t => t.alpha *= 0.9);

        return this.vy >= -2 || this.life <= 0;
    }

    draw(ctx) {
        // Draw trail
        this.trail.forEach(point => {
            ctx.save();
            ctx.globalAlpha = point.alpha;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 5;
            ctx.shadowColor = this.color;
            ctx.fillRect(point.x - 1.5, point.y - 1.5, 3, 3);
            ctx.restore();
        });

        // Draw shell
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, PI_2);
        ctx.fill();
        ctx.restore();
    }
}

class Star {
    constructor(x, y, angle, speed, color, size = 1) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = color;
        this.life = 1;
        this.size = size;
        this.brightness = 1;
        this.trail = [];
    }

    update() {
        this.vy += GRAVITY * 0.01;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.008;
        this.brightness = this.life;

        if (this.life > 0.7) {
            this.trail.push({
                x: this.x,
                y: this.y,
                size: this.size * this.life,
                alpha: 1
            });
        }
        if (this.trail.length > 8) this.trail.shift();
        this.trail.forEach(t => t.alpha *= 0.85);
    }

    draw(ctx) {
        if (this.life <= 0) return;

        // Draw trail
        this.trail.forEach(point => {
            ctx.save();
            ctx.globalAlpha = point.alpha * this.life;
            const gradient = ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, point.size * 3
            );
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.5, this.addAlpha(this.color, 0.3));
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.size * 3, 0, PI_2);
            ctx.fill();
            ctx.restore();
        });

        // Draw main star
        ctx.save();
        ctx.globalAlpha = this.life;
        
        // Glow
        const glowGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 5
        );
        glowGradient.addColorStop(0, '#fff');
        glowGradient.addColorStop(0.2, this.color);
        glowGradient.addColorStop(0.4, this.addAlpha(this.color, 0.5));
        glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 5, 0, PI_2);
        ctx.fill();

        // Core
        ctx.globalAlpha = this.life * this.brightness;
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.5, 0, PI_2);
        ctx.fill();
        ctx.restore();
    }

    addAlpha(color, alpha) {
        if (color.startsWith('hsl')) {
            return color.replace(')', `, ${alpha})`).replace('hsl', 'hsla');
        }
        return color;
    }

    isDead() {
        return this.life <= 0;
    }
}

class RealisticFireworks {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.shells = [];
        this.stars = [];
        this.animationId = null;
        this.launchInterval = null;
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start() {
        this.launchInterval = setInterval(() => this.launchShell(), 600);
        this.animate();
    }

    stop() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.launchInterval) clearInterval(this.launchInterval);
        this.shells = [];
        this.stars = [];
    }

    launchShell() {
        const x = this.canvas.width * (0.2 + Math.random() * 0.6);
        const y = this.canvas.height;
        this.shells.push(new Shell(x, y));
    }

    burst(shell) {
        const patterns = [
            this.burstChrysanthemum,
            this.burstPalm,
            this.burstRing,
            this.burstWillow,
            this.burstCrossette
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        pattern.call(this, shell.x, shell.y);
    }

    burstChrysanthemum(x, y) {
        const colors = [
            'hsl(0, 100%, 60%)',
            'hsl(30, 100%, 60%)',
            'hsl(45, 100%, 60%)',
            'hsl(60, 100%, 60%)',
            'hsl(200, 100%, 60%)',
            'hsl(280, 100%, 60%)'
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const count = 80 + Math.floor(Math.random() * 40);

        for (let i = 0; i < count; i++) {
            const angle = PI_2 / count * i + Math.random() * 0.2;
            const speed = 3 + Math.random() * 5;
            const size = 1.5 + Math.random() * 1.5;
            this.stars.push(new Star(x, y, angle, speed, color, size));
        }
    }

    burstPalm(x, y) {
        const color = 'hsl(45, 100%, 65%)';
        const count = 60;

        for (let i = 0; i < count; i++) {
            const angle = Math.PI / 3 + (Math.PI / 3) * Math.random() - Math.PI / 6;
            const speed = 2 + Math.random() * 6;
            const size = 2 + Math.random();
            this.stars.push(new Star(x, y, angle, speed, color, size));
        }
    }

    burstRing(x, y) {
        const colors = ['hsl(200, 100%, 60%)', 'hsl(280, 100%, 60%)'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const count = 60;

        for (let i = 0; i < count; i++) {
            const angle = PI_2 / count * i;
            const speed = 4 + Math.random() * 2;
            const size = 1.5 + Math.random();
            this.stars.push(new Star(x, y, angle, speed, color, size));
        }
    }

    burstWillow(x, y) {
        const color = 'hsl(45, 100%, 70%)';
        const count = 80;

        for (let i = 0; i < count; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
            const speed = 4 + Math.random() * 4;
            const size = 1.5 + Math.random() * 1.5;
            const star = new Star(x, y, angle, speed, color, size);
            star.vy -= 2;  // Extra upward velocity
            this.stars.push(star);
        }
    }

    burstCrossette(x, y) {
        const color = 'hsl(' + Math.random() * 360 + ', 100%, 60%)';
        const branches = 8;

        for (let i = 0; i < branches; i++) {
            const angle = PI_2 / branches * i;
            const speed = 5 + Math.random() * 2;
            const size = 2.5;
            this.stars.push(new Star(x, y, angle, speed, color, size));
        }
    }

    animate() {
        // Fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 5, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw shells
        for (let i = this.shells.length - 1; i >= 0; i--) {
            const shell = this.shells[i];
            const shouldBurst = shell.update();
            shell.draw(this.ctx);

            if (shouldBurst) {
                this.burst(shell);
                this.shells.splice(i, 1);
            }
        }

        // Update and draw stars
        for (let i = this.stars.length - 1; i >= 0; i--) {
            const star = this.stars[i];
            star.update();
            star.draw(this.ctx);

            if (star.isDead()) {
                this.stars.splice(i, 1);
            }
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealisticFireworks;
}