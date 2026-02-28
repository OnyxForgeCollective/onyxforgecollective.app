const GITHUB_ORG = "prescionx"; // Burayı kendi GitHub organizasyon adınla değiştir

async function fetchRepos() {
    const grid = document.getElementById('repo-grid');
    
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_ORG}/repos?sort=updated`);
        const repos = await response.json();

        grid.innerHTML = ''; // Loading metnini temizle

        repos.forEach(repo => {
            if (!repo.fork) { // Sadece kendi projelerini göster
                const card = document.createElement('div');
                card.className = 'repo-card';
                
                card.innerHTML = `
                    <h3>${repo.name}</h3>
                    <p>${repo.description || 'No description available.'}</p>
                    <div class="repo-stats">
                        <span>⭐ ${repo.stargazers_count}</span>
                        <span>🍴 ${repo.forks_count}</span>
                        <span>${repo.language || 'Code'}</span>
                    </div>
                    <a href="${repo.html_url}" target="_blank" style="color:white; display:block; margin-top:15px; font-size:0.8rem;">View Source →</a>
                `;
                grid.appendChild(card);
            }
        });
    } catch (error) {
        grid.innerHTML = '<p>Error loading repositories. Please visit GitHub directly.</p>';
        console.error("GitHub API Error:", error);
    }
}

fetchRepos();