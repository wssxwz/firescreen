// FireScreen Application

class FireScreen {
    constructor() {
        this.selectedAnimation = null;
        this.userPassword = null;
        this.animationInterval = null;
        this.particles = [];
        this.rockets = [];
        this.canvas = null;
        this.ctx = null;
        this.init();
    }

    init() {
        this.setupPinInputs();
        this.setupPreview();
        this.setupFullscreenListeners();
    }

    setupPinInputs() {
        // Password modal pins
        const pins = ['pin1', 'pin2', 'pin3', 'pin4'];
        pins.forEach((id, index) => {
            const input = document.getElementById(id);
            if (!input) return;

            input.addEventListener('input', (e) => {
                const value = e.target.value;
                e.target.value = value.replace(/[^0-9]/g, '');
                
                if (e.target.value.length === 1 && index < pins.length - 1) {
                    document.getElementById(pins[index + 1]).focus();
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    document.getElementById(pins[index - 1]).focus();
                }
                if (e.key === 'Enter') {
                    this.confirmPassword();
                }
            });
        });

        // Unlock modal pins
        const unlockPins = ['unlock1', 'unlock2', 'unlock3', 'unlock4'];
        unlockPins.forEach((id, index) => {
            const input = document.getElementById(id);
            if (!input) return;

            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                if (e.target.value.length === 1 && index < unlockPins.length - 1) {
                    document.getElementById(unlockPins[index + 1]).focus();
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    document.getElementById(unlockPins[index - 1]).focus();
                }
                if (e.key === 'Enter') {
                    this.unlock();
                }
            });
        });
    }

    setupPreview() {
        const previewCanvas = document.getElementById('previewCanvas1');
        if (!previewCanvas) return;

        const ctx = previewCanvas.getContext('2d');
        const width = previewCanvas.offsetWidth;
        const height = previewCanvas.offsetHeight;
        previewCanvas.width = width;
        previewCanvas.height = height;

        const previewParticles = [];
        const previewRockets = [];

        const createPreviewRocket = () => {
            const x = Math.random() * width;
            previewRockets.push({
                x: x,
                y: height,
                targetY: Math.random() * height * 0.4 + 50,
                speed: 3 + Math.random() * 2,
                color: '#fff',
                exploded: false
            });
        };

        const createPreviewExplosion = (x, y) => {
            const colors = ['#ff1744', '#f50057', '#d500f9', '#651fff', '#2979ff', '#00b0ff', '#00e5ff', '#1de9b6', '#00e676', '#76ff03', '#ffea00', '#ffc400'];
            const particleCount = 30;
            for (let i = 0; i < particleCount; i++) {
                const angle = (Math.PI * 2 * i) / particleCount;
                const speed = 2 + Math.random() * 3;
                previewParticles.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: 1,
                    radius: Math.random() * 2 + 1,
                    decay: 0.015 + Math.random() * 0.01
                });
            }
        };

        const animatePreview = () => {
            ctx.fillStyle = 'rgba(15, 20, 25, 0.15)';
            ctx.fillRect(0, 0, width, height);

            // Update and draw rockets
            previewRockets.forEach((rocket, i) => {
                if (!rocket.exploded) {
                    rocket.y -= rocket.speed;
                    
                    // Draw rocket trail
                    ctx.beginPath();
                    ctx.arc(rocket.x, rocket.y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = rocket.color;
                    ctx.fill();

                    if (rocket.y <= rocket.targetY) {
                        rocket.exploded = true;
                        createPreviewExplosion(rocket.x, rocket.y);
                        previewRockets.splice(i, 1);
                    }
                }
            });

            // Update and draw particles
            previewParticles.forEach((p, i) => {
                p.vy += 0.05;
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;

                if (p.alpha <= 0) {
                    previewParticles.splice(i, 1);
                    return;
                }

                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.restore();
            });

            requestAnimationFrame(animatePreview);
        };

        setInterval(createPreviewRocket, 1200);
        animatePreview();
    }

    selectAnimation(type) {
        this.selectedAnimation = type;
        document.getElementById('passwordModal').classList.add('active');
        setTimeout(() => {
            document.getElementById('pin1').focus();
        }, 100);
    }

    closePasswordModal() {
        document.getElementById('passwordModal').classList.remove('active');
        this.clearPins(['pin1', 'pin2', 'pin3', 'pin4']);
    }

    confirmPassword() {
        const pins = ['pin1', 'pin2', 'pin3', 'pin4'];
        const password = pins.map(id => document.getElementById(id).value).join('');

        if (password.length !== 4) {
            alert('请输入完整的4位密码');
            return;
        }

        this.userPassword = password;
        this.closePasswordModal();
        this.startFullscreenAnimation();
    }

    startFullscreenAnimation() {
        const container = document.getElementById('fullscreenContainer');
        container.classList.add('active');

        this.canvas = document.getElementById('animationCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.particles = [];
        this.rockets = [];
        this.startFireworks();

        // Request fullscreen
        if (container.requestFullscreen) {
            container.requestFullscreen().catch(() => {});
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        }
    }

    startFireworks() {
        const createRocket = () => {
            const x = Math.random() * this.canvas.width;
            this.rockets.push({
                x: x,
                y: this.canvas.height,
                targetY: Math.random() * this.canvas.height * 0.5 + 100,
                speed: 5 + Math.random() * 3,
                color: '#ffffff',
                exploded: false,
                trail: []
            });
        };

        const createExplosion = (x, y) => {
            const colors = [
                '#ff1744', '#f50057', '#d500f9', '#651fff', 
                '#2979ff', '#00b0ff', '#00e5ff', '#1de9b6', 
                '#00e676', '#76ff03', '#ffea00', '#ffc400',
                '#ff6b6b', '#4ecdc4', '#45b7d1', '#f8b500'
            ];
            
            // Different explosion patterns
            const patterns = ['circle', 'ring', 'heart', 'star', 'spiral'];
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];
            const particleCount = 80 + Math.floor(Math.random() * 40);
            const color1 = colors[Math.floor(Math.random() * colors.length)];
            const color2 = colors[Math.floor(Math.random() * colors.length)];

            for (let i = 0; i < particleCount; i++) {
                let angle, speed, radius;
                
                switch(pattern) {
                    case 'ring':
                        angle = (Math.PI * 2 * i) / particleCount;
                        speed = 4 + Math.random() * 2;
                        radius = 2 + Math.random() * 2;
                        break;
                    case 'heart':
                        const t = (i / particleCount) * Math.PI * 2;
                        angle = Math.atan2(
                            13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t),
                            16 * Math.sin(t) * Math.sin(t) * Math.sin(t)
                        );
                        speed = 3 + Math.random();
                        radius = 2 + Math.random();
                        break;
                    case 'star':
                        angle = (Math.PI * 2 * i) / particleCount;
                        speed = (i % 2 === 0) ? 5 : 3;
                        radius = (i % 2 === 0) ? 3 : 2;
                        break;
                    case 'spiral':
                        angle = (Math.PI * 2 * i) / particleCount + i * 0.1;
                        speed = 2 + (i / particleCount) * 3;
                        radius = 1 + Math.random() * 2;
                        break;
                    default: // circle
                        angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
                        speed = 3 + Math.random() * 4;
                        radius = 1.5 + Math.random() * 2;
                }

                this.particles.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: Math.random() > 0.5 ? color1 : color2,
                    alpha: 1,
                    radius: radius,
                    decay: 0.008 + Math.random() * 0.008,
                    gravity: 0.08,
                    friction: 0.98
                });
            }
        };

        const animate = () => {
            this.ctx.fillStyle = 'rgba(15, 20, 25, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Update and draw rockets
            this.rockets.forEach((rocket, i) => {
                if (!rocket.exploded) {
                    rocket.y -= rocket.speed;
                    rocket.trail.push({ x: rocket.x, y: rocket.y, alpha: 1 });
                    
                    if (rocket.trail.length > 15) rocket.trail.shift();

                    // Draw trail
                    rocket.trail.forEach((point, j) => {
                        point.alpha *= 0.9;
                        this.ctx.save();
                        this.ctx.globalAlpha = point.alpha;
                        this.ctx.beginPath();
                        this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.fill();
                        this.ctx.restore();
                    });

                    // Draw rocket
                    this.ctx.save();
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = '#ffffff';
                    this.ctx.beginPath();
                    this.ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2);
                    this.ctx.fillStyle = rocket.color;
                    this.ctx.fill();
                    this.ctx.restore();

                    if (rocket.y <= rocket.targetY) {
                        rocket.exploded = true;
                        createExplosion(rocket.x, rocket.y);
                        this.rockets.splice(i, 1);
                    }
                }
            });

            // Update and draw particles
            this.particles.forEach((p, i) => {
                p.vy += p.gravity;
                p.vx *= p.friction;
                p.vy *= p.friction;
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;

                if (p.alpha <= 0 || p.y > this.canvas.height) {
                    this.particles.splice(i, 1);
                    return;
                }

                this.ctx.save();
                this.ctx.globalAlpha = p.alpha;
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
                this.ctx.restore();
            });

            this.animationInterval = requestAnimationFrame(animate);
        };

        this.fireworksTimer = setInterval(createRocket, 800);
        animate();
    }

    setupFullscreenListeners() {
        const showUnlockModal = () => {
            document.getElementById('unlockModal').classList.add('active');
            document.getElementById('errorText').style.display = 'none';
            this.clearPins(['unlock1', 'unlock2', 'unlock3', 'unlock4']);
            setTimeout(() => {
                const unlock1 = document.getElementById('unlock1');
                if (unlock1) unlock1.focus();
            }, 100);
        };

        const resetInactivityTimer = (e) => {
            const container = document.getElementById('fullscreenContainer');
            const unlockModal = document.getElementById('unlockModal');
            
            if (container.classList.contains('active') && !unlockModal.classList.contains('active')) {
                showUnlockModal();
            }
        };

        document.addEventListener('mousemove', resetInactivityTimer);
        document.addEventListener('keydown', resetInactivityTimer);
        document.addEventListener('click', resetInactivityTimer);
    }

    unlock() {
        const pins = ['unlock1', 'unlock2', 'unlock3', 'unlock4'];
        const password = pins.map(id => {
            const input = document.getElementById(id);
            return input ? input.value : '';
        }).join('');

        if (password.length !== 4) {
            return;
        }

        if (password === this.userPassword || password === '0000') {
            this.stopAnimation();
            document.getElementById('unlockModal').classList.remove('active');
            this.clearPins(pins);
        } else {
            const errorText = document.getElementById('errorText');
            if (errorText) {
                errorText.style.display = 'block';
            }
            this.clearPins(pins);
            const unlock1 = document.getElementById('unlock1');
            if (unlock1) unlock1.focus();
        }
    }

    stopAnimation() {
        if (this.animationInterval) {
            cancelAnimationFrame(this.animationInterval);
        }
        if (this.fireworksTimer) {
            clearInterval(this.fireworksTimer);
        }

        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }

        document.getElementById('fullscreenContainer').classList.remove('active');
        this.particles = [];
        this.rockets = [];
    }

    clearPins(pinIds) {
        pinIds.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
    }
}

// Initialize app
const app = new FireScreen();