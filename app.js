// FireScreen Application

class FireScreen {
    constructor() {
        this.selectedAnimation = null;
        this.userPassword = null;
        this.animationInterval = null;
        this.particles = [];
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
                // Only allow numbers
                e.target.value = value.replace(/[^0-9]/g, '');
                
                // Auto focus next
                if (e.target.value.length === 1 && index < pins.length - 1) {
                    document.getElementById(pins[index + 1]).focus();
                }
            });

            input.addEventListener('keydown', (e) => {
                // Backspace to previous
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    document.getElementById(pins[index - 1]).focus();
                }
                // Enter to confirm
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
        // Preview fireworks animation
        const previewCanvas = document.getElementById('previewCanvas1');
        if (!previewCanvas) return;

        const ctx = previewCanvas.getContext('2d');
        const width = previewCanvas.offsetWidth;
        const height = previewCanvas.offsetHeight;
        previewCanvas.width = width;
        previewCanvas.height = height;

        const previewParticles = [];

        const createPreviewFirework = () => {
            const x = Math.random() * width;
            const y = Math.random() * height * 0.6;
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa07a', '#98d8c8'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            for (let i = 0; i < 15; i++) {
                previewParticles.push({
                    x, y, color,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    alpha: 1,
                    radius: Math.random() * 2 + 1
                });
            }
        };

        const animatePreview = () => {
            ctx.fillStyle = 'rgba(10, 14, 39, 0.15)';
            ctx.fillRect(0, 0, width, height);

            previewParticles.forEach((p, i) => {
                p.vy += 0.05;
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.015;

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

        setInterval(createPreviewFirework, 800);
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

        // Start fireworks from beginning
        this.particles = [];
        this.startFireworks();

        // Request fullscreen
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        }
    }

    startFireworks() {
        const animate = () => {
            this.ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach((p, i) => {
                p.vy += 0.1;
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.008;

                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                    return;
                }

                this.ctx.save();
                this.ctx.globalAlpha = p.alpha;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
                this.ctx.restore();
            });

            this.animationInterval = requestAnimationFrame(animate);
        };

        const createFirework = () => {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * (this.canvas.height * 0.6);
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa07a', '#98d8c8', '#f6e58d', '#a29bfe'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const particleCount = 50;

            for (let i = 0; i < particleCount; i++) {
                this.particles.push({
                    x, y, color,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    alpha: 1,
                    radius: Math.random() * 3 + 1
                });
            }
        };

        this.fireworksTimer = setInterval(createFirework, 600);
        animate();
    }

    setupFullscreenListeners() {
        let inactivityTimer;

        const showUnlockModal = () => {
            clearTimeout(inactivityTimer);
            document.getElementById('unlockModal').classList.add('active');
            document.getElementById('errorText').style.display = 'none';
            this.clearPins(['unlock1', 'unlock2', 'unlock3', 'unlock4']);
            setTimeout(() => {
                document.getElementById('unlock1').focus();
            }, 100);
        };

        const resetInactivityTimer = () => {
            const container = document.getElementById('fullscreenContainer');
            if (container.classList.contains('active')) {
                showUnlockModal();
            }
        };

        // Listen for user activity
        document.addEventListener('mousemove', resetInactivityTimer);
        document.addEventListener('keydown', resetInactivityTimer);
        document.addEventListener('click', resetInactivityTimer);
    }

    unlock() {
        const pins = ['unlock1', 'unlock2', 'unlock3', 'unlock4'];
        const password = pins.map(id => document.getElementById(id).value).join('');

        if (password.length !== 4) {
            return;
        }

        // Check password (user password or master password 0000)
        if (password === this.userPassword || password === '0000') {
            this.stopAnimation();
            document.getElementById('unlockModal').classList.remove('active');
            this.clearPins(pins);
        } else {
            document.getElementById('errorText').style.display = 'block';
            this.clearPins(pins);
            document.getElementById('unlock1').focus();
        }
    }

    stopAnimation() {
        // Stop animation
        if (this.animationInterval) {
            cancelAnimationFrame(this.animationInterval);
        }
        if (this.fireworksTimer) {
            clearInterval(this.fireworksTimer);
        }

        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }

        // Hide container
        document.getElementById('fullscreenContainer').classList.remove('active');
        this.particles = [];
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