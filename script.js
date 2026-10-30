(function() {
    'use strict';

    // DOM Elements
    const activeLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const scrollContainer = document.querySelector('main');

    // Configuration
    const headerOffset = 160; // px

    function sectionIdsToPositions(sections) {
        return Array.from(sections)
            .map((section) => {
                const elPosition = section.getBoundingClientRect().top;
                const offsetPosition = elPosition - headerOffset;
                return {
                    sectionHeight: window.innerHeight - offsetPosition,
                    id: section.id.split('-')[0],
                    element: section
                };
            });
    }

    // Active Link Handler
    function setActiveLinks(currentSection) {
        activeLinks.forEach((link) => {
            if (link.classList.contains(currentSection)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Scroll handling
    function onScroll() {
        if (!scrollContainer) return;
        const scrollContainerHeight = scrollContainer.clientHeight;
        const containerScroll = scrollContainer.scrollTop + scrollContainerHeight / 2;

        let currentSection = 'about';
        let sectionHeights = sectionIdsToPositions(sections);

        for (const position of sectionHeights) {
            if (containerScroll - position.sectionHeight / 2 < 0) break;
            if(containerScroll - position.sectionHeight / 2 > position.element.offsetTop) {
                currentSection = position.id;
            }
        }

        setActiveLinks(currentSection);
    }

    // Intersection Observer for fade-in animations
    function initIntersectionObserver() {
        const observerOptions = {
            threshold: 0.05,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        sections.forEach((section) => {
            observer.observe(section);
        });
    }

    // Animation initialization
    function initializeAnimations() {
        sections.forEach((section) => {
            section.style.animationPlayState = 'paused';
        });
        initIntersectionObserver();
    }

    // Smooth Scroll to Section
    function scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Navbar click events
    function initializeNavbar() {
        document.querySelector('.nav').addEventListener('click', (e) => {
            const target = e.target.closest('a');
            if (target) {
                const sectionId = target.getAttribute('href').substring(1);
                scrollToSection(sectionId);
            }
        });

        // Mobile menu close on external link click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-link')) {
                activeLinks.forEach((link) => {
                    link.classList.add('active');
                });
            }
        });
    }


    // 2048 Game Logic
    function init2048()
    {
        const gameSection = document.getElementById('game');
        const boardElement = document.getElementById('game-2048-board');
        const scoreElement = document.getElementById('game-2048-score');
        const bestElement = document.getElementById('game-2048-best');
        const statusElement = document.getElementById('game-2048-status');
        const restartButton = document.getElementById('game-2048-restart');
        const continueButton = document.getElementById('game-2048-continue');

        let board;
        let score = 0;
        let bestScore = Number(localStorage.getItem('best2048') || 0);
        let won = false;

        function render()
        {
            boardElement.replaceChildren();

            board.forEach(row =>
            {
                row.forEach(value =>
                {
                    const tile = document.createElement('div');

                    tile.className = 'game-2048-tile';
                    tile.setAttribute('role', 'gridcell');

                    if (value === 0)
                    {
                        tile.classList.add('empty');
                        tile.setAttribute('aria-label', 'Empty');
                    }
                    else
                    {
                        tile.textContent = value;
                        tile.dataset.value = value;
                        tile.setAttribute('aria-label', String(value));
                    }

                    boardElement.appendChild(tile);
                });
            });

            scoreElement.textContent = score;
            bestElement.textContent = bestScore;
        }

        function addRandomTile()
        {
            const emptyCells = [];

            board.forEach((row, rowIndex) =>
            {
                row.forEach((value, colIndex) =>
                {
                    if (value === 0)
                    {
                        emptyCells.push([rowIndex, colIndex]);
                    }
                });
            });

            if (emptyCells.length === 0) return;

            const [row, col] = emptyCells[
                Math.floor(Math.random() * emptyCells.length)
                ];

            board[row][col] = Math.random() < 0.9 ? 2 : 4;
        }

        function hasMoves()
        {
            for (let row = 0; row < 4; row++)
            {
                for (let col = 0; col < 4; col++)
                {
                    if (board[row][col] === 0) return true;

                    if (col < 3 && board[row][col] === board[row][col + 1])
                        return true;

                    if (row < 3 && board[row][col] === board[row + 1][col])
                        return true;
                }
            }

            return false;
        }

        function move(direction)
        {
            let moved = false;
            let gainedScore = 0;

            for (let line = 0; line < 4; line++)
            {
                const coordinates = Array.from({ length: 4 }, (_, position) =>
                {
                    if (direction === 'left') return [line, position];
                    if (direction === 'right') return [line, 3 - position];
                    if (direction === 'up') return [position, line];

                    return [3 - position, line];
                });

                const original = coordinates.map(
                    ([row, col]) => board[row][col]
                );

                const values = original.filter(value => value !== 0);
                const merged = [];

                for (let i = 0; i < values.length; i++)
                {
                    if (values[i] === values[i + 1])
                    {
                        const value = values[i] * 2;

                        merged.push(value);
                        gainedScore += value;
                        i++;
                    }
                    else
                    {
                        merged.push(values[i]);
                    }
                }

                while (merged.length < 4)
                {
                    merged.push(0);
                }

                if (original.some((value, index) => value !== merged[index]))
                {
                    moved = true;
                }

                coordinates.forEach(([row, col], index) =>
                {
                    board[row][col] = merged[index];
                });
            }

            if (!moved) return;

            score += gainedScore;

            if (score > bestScore)
            {
                bestScore = score;
                localStorage.setItem('best2048', bestScore);
            }

            addRandomTile();
            render();

            if (!won && board.flat().includes(2048))
            {
                won = true;
                statusElement.textContent = 'You reached 2048!';
                continueButton.classList.remove('hidden');
            }
            else if (!hasMoves())
            {
                statusElement.textContent = 'Game Over!';
            }
        }

        function startGame()
        {
            board = Array.from({ length: 4 }, () => Array(4).fill(0));
            score = 0;
            won = false;

            statusElement.textContent = '';
            continueButton.classList.add('hidden');

            addRandomTile();
            addRandomTile();

            render();
        }

        function handleKeyboard(e)
        {
            if (e.target.matches('input, textarea, select, [contenteditable="true"]'))
                return;

            if (!gameSection.matches(':hover') &&
                document.activeElement !== boardElement)
                return;

            const directions =
                {
                    arrowleft: 'left',
                    arrowright: 'right',
                    arrowup: 'up',
                    arrowdown: 'down',
                    a: 'left',
                    d: 'right',
                    w: 'up',
                    s: 'down'
                };

            const direction = directions[e.key.toLowerCase()];

            if (!direction) return;

            e.preventDefault();
            move(direction);
        }

        let touchStartX = 0;
        let touchStartY = 0;

        boardElement.addEventListener('touchstart', e =>
        {
            const touch = e.changedTouches[0];

            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: true });

        boardElement.addEventListener('touchend', e =>
        {
            const touch = e.changedTouches[0];

            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;

            if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 30)
                return;

            if (Math.abs(deltaX) > Math.abs(deltaY))
            {
                move(deltaX > 0 ? 'right' : 'left');
            }
            else
            {
                move(deltaY > 0 ? 'down' : 'up');
            }
        }, { passive: true });

        document.addEventListener('keydown', handleKeyboard);

        restartButton.addEventListener('click', startGame);

        continueButton.addEventListener('click', () =>
        {
            statusElement.textContent = '';
            continueButton.classList.add('hidden');
        });

        startGame();
    }

    init2048();

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        initializeAnimations();
        initializeNavbar();
    });

    // Expose publicly
    window.GitHubPortfolio = {
        scrollToSection,
        setActiveLinks,
        sectionIdsToPositions
    };






})();
