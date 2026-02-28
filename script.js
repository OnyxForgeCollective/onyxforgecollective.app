const GITHUB_ORG = "prescionx"; // Burayı kendi GitHub organizasyon adınla değiştir

async function fetchRepos() {
    const grid = document.getElementById('repo-grid');
    
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_ORG}/repos?sort=updated`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const repos = await response.json();

        grid.innerHTML = ''; // Clear loading spinner

        let delay = 0;
        const filteredRepos = repos.filter(repo => !repo.fork);

        if (filteredRepos.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center"><p class="lead">No public repositories found.</p></div>';
            return;
        }

        const fragment = document.createDocumentFragment();

        filteredRepos.forEach(repo => {
            const cardWrapper = document.createElement('div');
            cardWrapper.className = `col-md-6 col-lg-4 custom-fade-in-up`;
            cardWrapper.style.animationDelay = `${delay}s`;
            delay += 0.1; // Stagger animation

            const card = document.createElement('div');
            card.className = 'glass-card h-100 p-4 d-flex flex-column position-relative z-1';

            const title = document.createElement('h3');
            title.className = 'h4 mb-3';
            title.style.color = 'var(--accent)';
            title.textContent = repo.name;
            card.appendChild(title);

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

            const link = document.createElement('a');
            link.href = repo.html_url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'text-decoration-none mt-3 fw-bold';
            link.style.color = 'var(--secondary)';
            link.style.fontSize = '0.85rem';
            link.style.textTransform = 'uppercase';
            link.textContent = 'View Source →';
            card.appendChild(link);

            cardWrapper.appendChild(card);
            grid.appendChild(cardWrapper);
        });

        grid.appendChild(fragment);
    } catch (error) {
        grid.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Error loading repositories. Please visit GitHub directly.</p></div>';
        console.error("GitHub API Error:", error);
    }
}

window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if(preloader) {
        preloader.classList.add('hidden');
        setTimeout(() => preloader.style.display = 'none', 500);
    }
});

fetchRepos();
