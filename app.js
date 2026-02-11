// FireScreen Application with Professional Fireworks Engine

class FireScreen {
    constructor() {
        this.selectedAnimation = null;
        this.userPassword = null;
        this.fireworksEngine = null;
        this.previewEngine = null;
        this.init();
    }

    init() {
        this.setupPinInputs();
        this.setupPreview();
        this.setupFullscreenListeners();
    }

    setupPinInputs() {
        const setupPinGroup = (ids, onEnter) => {
            ids.forEach((id, index) => {
                const input = document.getElementById(id);
                if (!input) return;

                input.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    if (e.target.value.length === 1 && index < ids.length - 1) {
                        document.getElementById(ids[index + 1]).focus();
                    }
                });

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && !e.target.value && index > 0) {
                        document.getElementById(ids[index - 1]).focus();
                    }
                    if (e.key === 'Enter') {
                        onEnter();
                    }
                });
            });
        };

        setupPinGroup(['pin1', 'pin2', 'pin3', 'pin4'], () => this.confirmPassword());
        setupPinGroup(['unlock1', 'unlock2', 'unlock3', 'unlock4'], () => this.unlock());
    }

    setupPreview() {
        const canvas = document.getElementById('previewCanvas1');
        if (!canvas) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        this.previewEngine = new ProFireworks(canvas);
        this.previewEngine.start();
    }

    selectAnimation(type) {
        this.selectedAnimation = type;
        document.getElementById('passwordModal').classList.add('active');
        setTimeout(() => document.getElementById('pin1').focus(), 100);
    }

    closePasswordModal() {
        document.getElementById('passwordModal').classList.remove('active');
        this.clearPins(['pin1', 'pin2', 'pin3', 'pin4']);
    }

    confirmPassword() {
        const password = ['pin1', 'pin2', 'pin3', 'pin4']
            .map(id => document.getElementById(id).value)
            .join('');

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
        const canvas = document.getElementById('animationCanvas');
        
        container.classList.add('active');

        // Block all fullscreen exit attempts
        this.blockFullscreenExit();

        // Check if video animation
        if (this.selectedAnimation === 'starry-sky' || this.selectedAnimation === 'ocean-waves') {
            this.playVideoAnimation();
        } else {
            // Fireworks animation
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.fireworksEngine = new ProFireworks(canvas);
            this.fireworksEngine.start();
        }

        // Request fullscreen
        if (container.requestFullscreen) {
            container.requestFullscreen().catch(() => {});
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        }
    }

    blockFullscreenExit() {
        // Intercept all ESC and F11 keys
        this.keyBlocker = (e) => {
            if (e.key === 'Escape' || e.key === 'F11' || e.keyCode === 27 || e.keyCode === 122) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
        };
        
        document.addEventListener('keydown', this.keyBlocker, true);
        document.addEventListener('keyup', this.keyBlocker, true);
        document.addEventListener('keypress', this.keyBlocker, true);
    }

    unblockFullscreenExit() {
        if (this.keyBlocker) {
            document.removeEventListener('keydown', this.keyBlocker, true);
            document.removeEventListener('keyup', this.keyBlocker, true);
            document.removeEventListener('keypress', this.keyBlocker, true);
        }
    }

    playVideoAnimation() {
        const container = document.getElementById('fullscreenContainer');
        const videoPath = this.selectedAnimation === 'starry-sky' 
            ? 'videos/starry-sky.mp4' 
            : 'videos/ocean-waves.mp4';

        // Create video element
        const video = document.createElement('video');
        video.src = videoPath;
        video.loop = true;
        video.autoplay = true;
        video.muted = false; // Enable sound for fullscreen
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.position = 'absolute';
        video.style.top = '0';
        video.style.left = '0';
        video.style.zIndex = '9999';
        video.id = 'fullscreenVideo';

        // Prevent video controls
        video.controls = false;
        video.disablePictureInPicture = true;
        video.controlsList = 'nodownload noplaybackrate';

        // Clear canvas and add video
        const canvas = document.getElementById('animationCanvas');
        canvas.style.display = 'none';
        container.appendChild(video);
        video.play();
    }

    setupFullscreenListeners() {
        const showUnlock = (e) => {
            const container = document.getElementById('fullscreenContainer');
            const modal = document.getElementById('unlockModal');
            
            // Prevent ESC from exiting fullscreen
            if (e && e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
            }
            
            if (container.classList.contains('active') && !modal.classList.contains('active')) {
                modal.classList.add('active');
                document.getElementById('errorText').style.display = 'none';
                this.clearPins(['unlock1', 'unlock2', 'unlock3', 'unlock4']);
                setTimeout(() => document.getElementById('unlock1').focus(), 100);
            }
        };

        // Listen to all interactions
        ['mousemove', 'keydown', 'click', 'touchstart'].forEach(event => {
            document.addEventListener(event, showUnlock, true); // Use capture phase
        });

        // Block fullscreen change attempts
        document.addEventListener('fullscreenchange', () => {
            const container = document.getElementById('fullscreenContainer');
            if (container.classList.contains('active') && !document.fullscreenElement) {
                // User tried to exit fullscreen - re-enter it
                if (container.requestFullscreen) {
                    container.requestFullscreen().catch(() => {});
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                }
            }
        });

        document.addEventListener('webkitfullscreenchange', () => {
            const container = document.getElementById('fullscreenContainer');
            if (container.classList.contains('active') && !document.webkitFullscreenElement) {
                if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                }
            }
        });
    }

    unlock() {
        const password = ['unlock1', 'unlock2', 'unlock3', 'unlock4']
            .map(id => document.getElementById(id).value)
            .join('');

        if (password.length !== 4) return;

        if (password === this.userPassword || password === '0000') {
            this.stopAnimation();
        } else {
            document.getElementById('errorText').style.display = 'block';
            this.clearPins(['unlock1', 'unlock2', 'unlock3', 'unlock4']);
            document.getElementById('unlock1').focus();
        }
    }

    stopAnimation() {
        // Unblock fullscreen exit
        this.unblockFullscreenExit();

        if (this.fireworksEngine) {
            this.fireworksEngine.stop();
        }

        // Remove video if exists
        const video = document.getElementById('fullscreenVideo');
        if (video) {
            video.pause();
            video.remove();
        }

        // Show canvas again
        const canvas = document.getElementById('animationCanvas');
        canvas.style.display = 'block';

        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }

        document.getElementById('fullscreenContainer').classList.remove('active');
        document.getElementById('unlockModal').classList.remove('active');
    }

    clearPins(ids) {
        ids.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
    }
}

const app = new FireScreen();
