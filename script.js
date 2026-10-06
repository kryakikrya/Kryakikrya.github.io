(function() {
    'use strict';

    // DOM Elements
    const activeLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const scrollContainer = document.querySelector('main');

    // Configuration
    const headerOffset = 160; // px
    const sectionPositions = sectionIdsToPositions(sections);

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
            })[
];

    // Active Link Handler
    function onScroll() {
        if (!scrollContainer) return;

        const scrollContainerHeight = scrollContainer.clientHeight;
        const containerScroll = scrollContainer.scrollTop + scrollContainerHeight / 2;

        let currentSection = 'about';
        let currentSectionHeight = sectionIdsToPositions(sections)[0]?.sectionHeight ?? 1000;

        for (const position of sectionPositions) {
            if (containerScroll - position.sectionHeight / 2 < 0) break;
            if(containerScroll - position.sectionHeight / 2 > position.element.offsetTop) {
                currentSection = position.id;
                currentSectionHeight = position.sectionHeight;
            }
        }

        setActiveLinks(currentSection);
    }

    function setActiveLinks(currentSection) {
        activeLinks.forEach((link) => {
            if (link.classList.contains(currentSection)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
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
