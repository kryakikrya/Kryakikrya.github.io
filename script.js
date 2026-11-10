(() => {
    'use strict';

    const root = document.documentElement;
    const sections = [...document.querySelectorAll('.section')];
    const navLinks = [...document.querySelectorAll('.nav-link')];
    const themeToggle = document.getElementById('theme-toggle');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function setTheme(theme) {
        root.dataset.theme = theme;
        const label = themeToggle?.querySelector('.theme-toggle-label');
        const symbol = themeToggle?.querySelector('.theme-symbol');
        if (label) label.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
        if (symbol) symbol.textContent = theme === 'dark' ? '☼' : '☾';
        themeToggle?.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
        try { localStorage.setItem('portfolio-theme', theme); } catch (_) { /* Theme remains active for this visit. */ }
    }

    themeToggle?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
    setTheme(root.dataset.theme || 'dark');

    function setActiveLink(id) {
        navLinks.forEach((link) => {
            const active = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }

    document.querySelector('.nav')?.addEventListener('click', (event) => {
        const link = event.target.closest('a.nav-link');
        if (!link) return;
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', link.getAttribute('href'));
        setActiveLink(target.id);
    });

    if ('IntersectionObserver' in window) {
        root.classList.add('reveal-ready');
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });
        sections.forEach((section) => revealObserver.observe(section));

        const navObserver = new IntersectionObserver((entries) => {
            const visible = entries.filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (visible) setActiveLink(visible.target.id);
        }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.15, 0.4, 0.7] });
        sections.forEach((section) => navObserver.observe(section));
    } else {
        sections.forEach((section) => section.classList.add('is-visible'));
    }

    if (!reducedMotion.matches) {
        const layers = [...document.querySelectorAll('.parallax-layer')];
        let framePending = false;
        const updateParallax = () => {
            layers.forEach((layer) => {
                layer.style.setProperty('--parallax-y', `${window.scrollY * (Number(layer.dataset.speed) || 0)}px`);
            });
            framePending = false;
        };
        window.addEventListener('scroll', () => {
            if (framePending) return;
            framePending = true;
            requestAnimationFrame(updateParallax);
        }, { passive: true });
        updateParallax();
    }

    document.querySelectorAll('.skill-accordion').forEach((item) => {
        item.addEventListener('toggle', () => item.classList.toggle('is-open', item.open));
        item.classList.toggle('is-open', item.open);
    });

    function init2048() {
        const game = document.getElementById('game');
        const boardElement = document.getElementById('game-2048-board');
        const scoreElement = document.getElementById('game-2048-score');
        const bestElement = document.getElementById('game-2048-best');
        const statusElement = document.getElementById('game-2048-status');
        const restartButton = document.getElementById('game-2048-restart');
        const continueButton = document.getElementById('game-2048-continue');
        if (!game || !boardElement || !scoreElement || !bestElement || !statusElement || !restartButton || !continueButton) return;

        let board;
        let score = 0;
        let best = 0;
        let won = false;
        let keepPlaying = false;
        let gameOver = false;
        try { best = Number(localStorage.getItem('best2048')) || 0; } catch (_) { best = 0; }

        function render() {
            boardElement.replaceChildren();
            board.forEach((row) => row.forEach((value) => {
                const tile = document.createElement('div');
                tile.className = value ? 'game-2048-tile' : 'game-2048-tile empty';
                tile.setAttribute('role', 'gridcell');
                tile.setAttribute('aria-label', value ? String(value) : 'Empty');
                if (value) { tile.textContent = String(value); tile.dataset.value = String(value); }
                boardElement.appendChild(tile);
            }));
            scoreElement.textContent = String(score);
            bestElement.textContent = String(best);
        }

        function addRandomTile() {
            const empty = [];
            board.forEach((row, r) => row.forEach((value, c) => { if (!value) empty.push([r, c]); }));
            if (!empty.length) return;
            const [r, c] = empty[Math.floor(Math.random() * empty.length)];
            board[r][c] = Math.random() < 0.9 ? 2 : 4;
        }

        function hasMoves() {
            for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
                if (!board[r][c] || (c < 3 && board[r][c] === board[r][c + 1]) || (r < 3 && board[r][c] === board[r + 1][c])) return true;
            }
            return false;
        }

        function move(direction) {
            if (gameOver || (won && !keepPlaying)) return;
            let moved = false;
            let gained = 0;
            for (let line = 0; line < 4; line++) {
                const coords = Array.from({ length: 4 }, (_, i) => {
                    if (direction === 'left') return [line, i];
                    if (direction === 'right') return [line, 3 - i];
                    if (direction === 'up') return [i, line];
                    return [3 - i, line];
                });
                const before = coords.map(([r, c]) => board[r][c]);
                const values = before.filter(Boolean);
                const merged = [];
                for (let i = 0; i < values.length; i++) {
                    if (values[i] === values[i + 1]) { const value = values[i] * 2; merged.push(value); gained += value; i++; }
                    else merged.push(values[i]);
                }
                while (merged.length < 4) merged.push(0);
                if (before.some((value, i) => value !== merged[i])) moved = true;
                coords.forEach(([r, c], i) => { board[r][c] = merged[i]; });
            }
            if (!moved) return;
            score += gained;
            if (score > best) {
                best = score;
                try { localStorage.setItem('best2048', String(best)); } catch (_) { /* Keep best score in memory. */ }
            }
            addRandomTile();
            render();
            if (!won && board.flat().includes(2048)) {
                won = true;
                statusElement.textContent = 'You reached 2048!';
                continueButton.classList.remove('hidden');
            }
            if (!hasMoves()) { gameOver = true; statusElement.textContent = 'Game over. Start a new game to try again.'; }
        }

        function startGame() {
            board = Array.from({ length: 4 }, () => Array(4).fill(0));
            score = 0; won = false; keepPlaying = false; gameOver = false;
            statusElement.textContent = '';
            continueButton.classList.add('hidden');
            addRandomTile(); addRandomTile(); render();
        }

        document.addEventListener('keydown', (event) => {
            if (event.target.matches('input, textarea, select, button, [contenteditable="true"]')) return;
            if (!game.matches(':hover') && document.activeElement !== boardElement) return;
            const keys = { arrowleft: 'left', arrowright: 'right', arrowup: 'up', arrowdown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' };
            const direction = keys[event.key.toLowerCase()];
            if (!direction) return;
            event.preventDefault();
            move(direction);
        });

        let startX = 0;
        let startY = 0;
        boardElement.addEventListener('touchstart', (event) => {
            startX = event.changedTouches[0].clientX;
            startY = event.changedTouches[0].clientY;
        }, { passive: true });
        boardElement.addEventListener('touchend', (event) => {
            const dx = event.changedTouches[0].clientX - startX;
            const dy = event.changedTouches[0].clientY - startY;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
            if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
            else move(dy > 0 ? 'down' : 'up');
        }, { passive: true });
        restartButton.addEventListener('click', startGame);
        continueButton.addEventListener('click', () => {
            keepPlaying = true;
            statusElement.textContent = '';
            continueButton.classList.add('hidden');
            boardElement.focus();
        });
        startGame();
    }

    init2048();
    window.GitHubPortfolio = { setActiveLink, setTheme };
})();
