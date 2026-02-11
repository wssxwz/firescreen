// Professional Fireworks Engine - Based on Firework_Simulator
// Ultra-realistic, sharp, and colorful

const COLOR = {
    Red: '#ff0043',
    Green: '#14fc56',
    Blue: '#1e7fff',
    Purple: '#e60aff',
    Gold: '#ffbf36',
    White: '#ffffff'
};

const COLOR_CODES = Object.values(COLOR);

class Star {
    constructor(x, y, color, angle, speed, life) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.color = color;
        this.speedX = Math.sin(angle) * speed;
        this.speedY = Math.cos(angle) * speed;
        this.life = life;
        this.maxLife = life;
        this.airDrag = 0.98;
    }

    update() {
        this.prevX = this.x;
        this.prevY = this.y;
        
        this.speedX *= this.airDrag;
        this.speedY *= this.airDrag;
        this.speedY += 0.03; // Gravity
        
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        if (alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

class Shell {
    constructor(x, canvas) {
        this.x = x;
        this.y = canvas.height;
        this.canvas = canvas;
        
        const launchSpeed = 10 + Math.random() * 3;
        this.speedY = -launchSpeed;
        this.speedX = (Math.random() - 0.5) * 2;
        
        // Target height - ensure it's within screen
        this.targetY = canvas.height * 0.25 + Math.random() * canvas.height * 0.25;
        
        this.color = COLOR_CODES[Math.floor(Math.random() * COLOR_CODES.length)];
        this.size = 1 + Math.random() * 2;
        this.exploded = false;
    }

    update() {
        this.speedY += 0.15; // Gravity
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Explode when reaching target or starting to fall
        if (this.y <= this.targetY || this.speedY >= 0) {
            this.exploded = true;
            return true;
        }
        return false;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ProFireworks {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
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
        this.launchInterval = setInterval(() => this.launch(), 600);
        this.animate();
    }

    stop() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.launchInterval) clearInterval(this.launchInterval);
        this.shells = [];
        this.stars = [];
    }

    launch() {
        const x = this.canvas.width * (0.2 + Math.random() * 0.6);
        this.shells.push(new Shell(x, this.canvas));
    }

    burst(shell) {
        const x = shell.x;
        const y = shell.y;
        const color1 = COLOR_CODES[Math.floor(Math.random() * COLOR_CODES.length)];
        const color2 = Math.random() < 0.5 ? color1 : COLOR_CODES[Math.floor(Math.random() * COLOR_CODES.length)];
        
        const pattern = Math.floor(Math.random() * 5);
        
        switch(pattern) {
            case 0: // Chrysanthemum
                this.burstChrysanthemum(x, y, color1, color2);
                break;
            case 1: // Ring
                this.burstRing(x, y, color1);
                break;
            case 2: // Crossette
                this.burstCrossette(x, y, color1);
                break;
            case 3: // Willow
                this.burstWillow(x, y, color1);
                break;
            case 4: // Palm
                this.burstPalm(x, y, color1);
                break;
        }
    }

    burstChrysanthemum(x, y, color1, color2) {
        const starCount = 50 + Math.floor(Math.random() * 30);
        const starLife = 60 + Math.floor(Math.random() * 40);
        
        for (let i = 0; i < starCount; i++) {
            const angle = (Math.PI * 2 / starCount) * i;
            const speed = 2 + Math.random() * 4;
            const color = i % 2 === 0 ? color1 : color2;
            const life = starLife + (Math.random() - 0.5) * 20;
            
            this.stars.push(new Star(x, y, color, angle, speed, life));
        }
    }

    burstRing(x, y, color) {
        const starCount = 40;
        const starLife = 70;
        const speed = 4;
        
        for (let i = 0; i < starCount; i++) {
            const angle = (Math.PI * 2 / starCount) * i;
            this.stars.push(new Star(x, y, color, angle, speed, starLife));
        }
    }

    burstCrossette(x, y, color) {
        const branches = 8;
        const starsPerBranch = 8;
        const starLife = 50;
        
        for (let i = 0; i < branches; i++) {
            const angle = (Math.PI * 2 / branches) * i;
            const baseSpeed = 5;
            
            for (let j = 0; j < starsPerBranch; j++) {
                const speed = baseSpeed + j * 0.3;
                const life = starLife - j * 3;
                this.stars.push(new Star(x, y, color, angle, speed, life));
            }
        }
    }

    burstWillow(x, y, color) {
        const starCount = 40;
        const starLife = 80;
        
        for (let i = 0; i < starCount; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.5;
            const speed = 3 + Math.random() * 3;
            const star = new Star(x, y, color, angle, speed, starLife);
            star.speedY -= 2; // Extra upward
            this.stars.push(star);
        }
    }

    burstPalm(x, y, color) {
        const starCount = 30;
        const starLife = 70;
        
        for (let i = 0; i < starCount; i++) {
            const angle = Math.PI * (0.3 + Math.random() * 0.4);
            const speed = 2 + Math.random() * 4;
            this.stars.push(new Star(x, y, color, angle, speed, starLife));
        }
    }

    animate() {
        // Clear with slight fade
        this.ctx.fillStyle = 'rgba(0, 0, 10, 0.15)';
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

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProFireworks;
}