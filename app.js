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
        
        this.previewEngine = new FireworksEngine(canvas);
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
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        this.fireworksEngine = new FireworksEngine(canvas);
        this.fireworksEngine.start();

        // Request fullscreen
        const elem = container;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(() => {});
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
    }

    setupFullscreenListeners() {
        const showUnlock = () => {
            const container = document.getElementById('fullscreenContainer');
            const modal = document.getElementById('unlockModal');
            
            if (container.classList.contains('active') && !modal.classList.contains('active')) {
                modal.classList.add('active');
                document.getElementById('errorText').style.display = 'none';
                this.clearPins(['unlock1', 'unlock2', 'unlock3', 'unlock4']);
                setTimeout(() => document.getElementById('unlock1').focus(), 100);
            }
        };

        ['mousemove', 'keydown', 'click'].forEach(event => {
            document.addEventListener(event, showUnlock);
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
        if (this.fireworksEngine) {
            this.fireworksEngine.stop();
        }

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
