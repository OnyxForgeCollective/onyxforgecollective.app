const GITHUB_ORG = "onyxforgecollective";
const TYPE = "orgs"; // users/orgs

// ─── Taglines ────────────────────────────────────────────────────────────────
const TAGLINES = [
    "Code.\nForge.\nShip.",
    "Build.\nBreak.\nGrow.",
    "Hack.\nCraft.\nLead.",
    "Open.\nBold.\nFree.",
    "Push.\nForge.\nRise.",
    "Make.\nShare.\nImpact.",
    "Fork.\nSpark.\nDeploy.",
    "Draft.\nTest.\nLaunch.",
    "Think.\nCode.\nForge.",
];

// ─── Theme ────────────────────────────────────────────────────────────────────
function getStoredTheme() {
    return localStorage.getItem('theme');
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    const heroLogo = document.getElementById('hero-logo');
    if (heroLogo) {
        heroLogo.src = theme === 'dark' ? 'img/svg/ofc-white-logo.svg' : 'img/svg/ofc-black-logo.svg';
    }
}

function resolveTheme() {
    const stored = getStoredTheme();
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function initTheme() {
    const theme = resolveTheme();
    applyTheme(theme);

    document.getElementById('theme-toggle').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || resolveTheme();
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        applyTheme(next);
    });

    // Keep in sync with OS preference changes only when no manual override
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!getStoredTheme()) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}

// ─── Tagline ──────────────────────────────────────────────────────────────────
function initTagline() {
    const el = document.getElementById('hero-tagline');
    if (!el) return;
    const pick = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
    el.innerHTML = pick.replace(/\n/g, '<br>');
}

// ─── Parallax on Logo ─────────────────────────────────────────────────────────
function initParallax() {
    const heroVisual = document.querySelector('.hero-visual');
    const logo = document.getElementById('hero-logo');
    if (!heroVisual || !logo) return;

    heroVisual.addEventListener('mousemove', e => {
        const rect = heroVisual.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);   // -1 to 1
        const dy = (e.clientY - cy) / (rect.height / 2);  // -1 to 1
        const rotateY = dx * 18;
        const rotateX = -dy * 14;
        logo.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.06)`;
    });

    heroVisual.addEventListener('mouseleave', () => {
        logo.style.transition = 'transform 0.5s ease';
        logo.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
        setTimeout(() => { logo.style.transition = 'transform 0.08s linear'; }, 500);
    });
}

// ─── README Modal ─────────────────────────────────────────────────────────────
function openReadmeModal(repo) {
    const modal       = document.getElementById('readme-modal');
    const title       = document.getElementById('readme-modal-title');
    const ghLink      = document.getElementById('readme-modal-gh-link');
    const content     = document.getElementById('readme-content');
    const loading     = document.getElementById('readme-loading');

    title.textContent = repo.name;
    ghLink.href       = repo.html_url;
    content.innerHTML = '';
    loading.style.display = 'flex';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    const owner = repo.full_name.split('/')[0];
    const branches = ['main', 'master'];

    (async () => {
        let md = null;
        for (const branch of branches) {
            try {
                const res = await fetch(
                    `https://raw.githubusercontent.com/${owner}/${repo.name}/${branch}/README.md`
                );
                if (res.ok) { md = await res.text(); break; }
            } catch (_e) { /* Branch not found — try next */ }
        }

        loading.style.display = 'none';
        if (md && typeof marked !== 'undefined') {
            content.innerHTML = marked.parse(md, { breaks: true });
            // Make all links open in a new tab safely
            content.querySelectorAll('a').forEach(a => {
                a.setAttribute('target', '_blank');
                a.setAttribute('rel', 'noopener noreferrer');
            });
        } else {
            content.innerHTML = '<p class="opacity-75 text-center">No README found for this repository.</p>';
        }
    })();
}

function closeReadmeModal() {
    const modal = document.getElementById('readme-modal');
    modal.classList.remove('open');
    document.body.style.overflow = '';
}

function initReadmeModal() {
    document.getElementById('readme-modal-close').addEventListener('click', closeReadmeModal);
    document.getElementById('readme-modal').addEventListener('click', e => {
        if (e.target === document.getElementById('readme-modal')) closeReadmeModal();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeReadmeModal();
    });
}

// ─── Fetch Repos ──────────────────────────────────────────────────────────────
async function fetchRepos() {
    const grid = document.getElementById('repo-grid');

    try {
        const response = await fetch(
            `https://api.github.com/${TYPE}/${GITHUB_ORG}/repos?sort=updated&type=all&per_page=100`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const repos = await response.json();

        grid.innerHTML = ''; // Clear loading spinner

        let delay = 0;
        if (repos.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center"><p class="lead">No public repositories found.</p></div>';
            return;
        }

        const fragment = document.createDocumentFragment();

        repos.forEach(repo => {
            const cardWrapper = document.createElement('div');
            cardWrapper.className = `col-md-6 col-lg-4 custom-fade-in-up`;
            cardWrapper.style.animationDelay = `${delay}s`;
            delay += 0.1;

            const card = document.createElement('div');
            card.className = 'glass-card clickable h-100 p-4 d-flex flex-column position-relative z-1';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `View details for ${repo.name}`);

            // Title row
            const titleRow = document.createElement('div');
            titleRow.className = 'd-flex align-items-center mb-3 flex-wrap gap-2';

            const title = document.createElement('h3');
            title.className = 'h4 mb-0';
            title.style.color = 'var(--accent)';
            title.textContent = repo.name;
            titleRow.appendChild(title);

            if (repo.fork) {
                const badge = document.createElement('span');
                badge.className = 'fork-badge';
                badge.innerHTML = '<i class="fas fa-code-branch"></i> Fork';
                titleRow.appendChild(badge);
            }
            card.appendChild(titleRow);

            const desc = document.createElement('p');
            desc.className = 'opacity-75 flex-grow-1';
            desc.style.fontSize = '0.95rem';
            desc.textContent = repo.description || 'No description available.';
            card.appendChild(desc);

            const stats = document.createElement('div');
            stats.className = 'repo-stats d-flex gap-3 opacity-50 small mt-auto pt-3';
            stats.innerHTML = `
                <span><i class="fas fa-star"></i> <span class="stars"></span></span>
                <span><i class="fas fa-code-branch"></i> <span class="forks"></span></span>
                <span><i class="fas fa-code"></i> <span class="lang"></span></span>
            `;
            stats.querySelector('.stars').textContent = repo.stargazers_count;
            stats.querySelector('.forks').textContent = repo.forks_count;
            stats.querySelector('.lang').textContent = repo.language || 'Code';
            card.appendChild(stats);

            const hint = document.createElement('p');
            hint.className = 'card-view-hint mb-0 mt-2';
            hint.textContent = 'Click to view README →';
            card.appendChild(hint);

            // Open modal on click or Enter key
            const openModal = () => openReadmeModal(repo);
            card.addEventListener('click', openModal);
            card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); } });

            cardWrapper.appendChild(card);
            fragment.appendChild(cardWrapper);
        });

        grid.appendChild(fragment);
    } catch (error) {
        grid.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Error loading repositories. Please visit GitHub directly.</p></div>';
        console.error("GitHub API Error:", error);
    }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
    initTheme();
    initTagline();

    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('hidden');
        setTimeout(() => preloader.style.display = 'none', 500);
    }

    fetchRepos();
    initReadmeModal();
    initParallax();
});

