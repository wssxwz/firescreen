// Professional Fireworks Engine - Realistic Effects

class Particle {
    constructor(x, y, vx, vy, color, type = 'spark') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.type = type;
        this.alpha = 1;
        this.life = 1;
        this.gravity = 0.08;
        this.friction = 0.98;
        this.trail = [];
        this.brightness = 1;
        
        if (type === 'spark') {
            this.radius = 2 + Math.random() * 2;
            this.decay = 0.01;
        } else if (type === 'glow') {
            this.radius = 1 + Math.random();
            this.decay = 0.015;
        }
    }

    update() {
        // Store trail
        if (this.type === 'spark' && this.trail.length < 15) {
            this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
        }
        
        // Physics
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.alpha = Math.max(0, this.life);
        this.brightness = this.life;
    }

    draw(ctx) {
        if (this.alpha <= 0) return;

        // Draw trail
        if (this.trail.length > 0) {
            this.trail.forEach((point, i) => {
                const trailAlpha = (i / this.trail.length) * this.alpha * 0.5;
                ctx.save();
                ctx.globalAlpha = trailAlpha;
                ctx.beginPath();
                ctx.arc(point.x, point.y, this.radius * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.restore();
            });
            this.trail.shift();
        }

        // Draw main particle with glow
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 3
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.3, this.addAlpha(this.color, 0.6));
        gradient.addColorStop(1, this.addAlpha(this.color, 0));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core bright spot
        ctx.globalAlpha = this.alpha * this.brightness;
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    addAlpha(color, alpha) {
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return color;
    }

    isDead() {
        return this.life <= 0;
    }
}

class Rocket {
    constructor(x, targetY, canvas) {
        this.x = x;
        this.y = canvas.height;
        this.targetY = targetY;
        this.vy = -8 - Math.random() * 4;
        this.exploded = false;
        this.trail = [];
        this.hue = Math.random() * 60 + 30; // Golden hues
    }

    update() {
        this.vy += 0.15; // Gravity
        this.y += this.vy;
        
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 20) this.trail.shift();
        
        this.trail.forEach(t => t.alpha *= 0.92);

        if (this.vy >= 0 || this.y <= this.targetY) {
            this.exploded = true;
        }
    }

    draw(ctx) {
        // Trail
        this.trail.forEach((point, i) => {
            ctx.save();
            ctx.globalAlpha = point.alpha;
            ctx.fillStyle = `hsl(${this.hue}, 80%, 70%)`;
            ctx.shadowBlur = 5;
            ctx.shadowColor = `hsl(${this.hue}, 80%, 70%)`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Rocket head
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class FireworksEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.rockets = [];
        this.animationId = null;
        this.rocketInterval = null;
    }

    start() {
        this.resize();
        this.rocketInterval = setInterval(() => this.launchRocket(), 800);
        this.animate();
    }

    stop() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.rocketInterval) clearInterval(this.rocketInterval);
        this.particles = [];
        this.rockets = [];
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    launchRocket() {
        const x = Math.random() * this.canvas.width;
        const targetY = this.canvas.height * (0.2 + Math.random() * 0.3);
        this.rockets.push(new Rocket(x, targetY, this.canvas));
    }

    createExplosion(x, y) {
        const colors = [
            '#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4',
            '#45B7D1', '#FFC837', '#F5E6D3', '#E8D5C4',
            '#FF69B4', '#87CEEB', '#98D8C8', '#F4E4C1'
        ];

        const type = Math.random();
        let particleCount, patterns;

        if (type < 0.3) {
            // Palm (like image 1 - dense, drooping)
            particleCount = 150;
            patterns = 'palm';
        } else if (type < 0.6) {
            // Chrysanthemum (like image 2 - layered, full)
            particleCount = 200;
            patterns = 'chrysanthemum';
        } else {
            // Willow (like image 3 - long trails)
            particleCount = 120;
            patterns = 'willow';
        }

        const primaryColor = colors[Math.floor(Math.random() * colors.length)];
        const secondaryColor = colors[Math.floor(Math.random() * colors.length)];

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.1;
            let speed, color, particleType;

            switch(patterns) {
                case 'palm':
                    speed = 3 + Math.random() * 5;
                    color = i < particleCount * 0.7 ? primaryColor : '#FFD700';
                    particleType = 'spark';
                    break;
                    
                case 'chrysanthemum':
                    const layer = Math.floor(i / (particleCount / 3));
                    speed = 4 + Math.random() * 3 + layer;
                    color = layer === 0 ? '#FFD700' : layer === 1 ? primaryColor : secondaryColor;
                    particleType = i % 3 === 0 ? 'spark' : 'glow';
                    break;
                    
                case 'willow':
                    speed = 5 + Math.random() * 4;
                    color = i < particleCount * 0.5 ? '#FFD700' : primaryColor;
                    particleType = 'spark';
                    break;
            }

            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - (patterns === 'willow' ? 2 : 0);
            
            this.particles.push(new Particle(x, y, vx, vy, color, particleType));
        }

        // Add extra sparkles
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6;
            this.particles.push(
                new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#FFD700', 'glow')
            );
        }
    }

    animate() {
        this.ctx.fillStyle = 'rgba(10, 15, 25, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw rockets
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const rocket = this.rockets[i];
            rocket.update();
            rocket.draw(this.ctx);

            if (rocket.exploded) {
                this.createExplosion(rocket.x, rocket.y);
                this.rockets.splice(i, 1);
            }
        }

        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            particle.draw(this.ctx);

            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }
}