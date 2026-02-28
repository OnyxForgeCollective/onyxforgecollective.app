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

        filteredRepos.forEach(repo => {
            const cardWrapper = document.createElement('div');
            cardWrapper.className = `col-md-6 col-lg-4 animate__animated animate__fadeInUp`;
            cardWrapper.style.animationDelay = `${delay}s`;
            delay += 0.1; // Stagger animation

            cardWrapper.innerHTML = `
                <div class="glass-card h-100 p-4 d-flex flex-column position-relative z-1">
                    <h3 class="h4 mb-3 repo-name" style="color: var(--accent);"></h3>
                    <p class="opacity-75 flex-grow-1 repo-desc" style="font-size: 0.95rem;"></p>
                    <div class="repo-stats d-flex gap-3 opacity-50 small mt-auto pt-3">
                        <span class="repo-stars"></span>
                        <span class="repo-forks"></span>
                        <span class="repo-lang"></span>
                    </div>
                    <a target="_blank" rel="noopener noreferrer" class="text-decoration-none mt-3 fw-bold repo-link" style="color: var(--secondary); font-size: 0.85rem; text-transform: uppercase;">View Source →</a>
                </div>
            `;

            cardWrapper.querySelector('.repo-name').textContent = repo.name;
            cardWrapper.querySelector('.repo-desc').textContent = repo.description || 'No description available.';
            cardWrapper.querySelector('.repo-stars').textContent = `⭐ ${repo.stargazers_count}`;
            cardWrapper.querySelector('.repo-forks').textContent = `🍴 ${repo.forks_count}`;
            cardWrapper.querySelector('.repo-lang').textContent = repo.language || 'Code';
            cardWrapper.querySelector('.repo-link').href = repo.html_url;
            grid.appendChild(cardWrapper);
        });
    } catch (error) {
        grid.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Error loading repositories. Please visit GitHub directly.</p></div>';
        console.error("GitHub API Error:", error);
    }
}

if (typeof window !== 'undefined') {
    fetchRepos();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fetchRepos };
}