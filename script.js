/* =========================================================
   OnyxForgeCollective – script.js
   ========================================================= */

const GITHUB_ORG = "prescionx";

// ---- Fetch & render repos ----
async function fetchRepos() {
    const grid = document.getElementById("repo-grid");

    try {
        const res = await fetch(
            `https://api.github.com/users/${GITHUB_ORG}/repos?sort=updated`
        );
        const repos = await res.json();

        grid.innerHTML = "";

        repos.forEach((repo) => {
            if (repo.fork) return;

            const col = document.createElement("div");
            col.className = "col-sm-6 col-lg-4";

            const desc = repo.description
                ? escapeHTML(repo.description)
                : "No description available.";

            col.innerHTML = `
                <div class="glass-card repo-card reveal">
                    <h3>${escapeHTML(repo.name)}</h3>
                    <p class="repo-desc">${desc}</p>
                    <div class="repo-stats">
                        <span>&#9733; ${repo.stargazers_count}</span>
                        <span>&#127860; ${repo.forks_count}</span>
                        <span>${escapeHTML(repo.language || "Code")}</span>
                    </div>
                    <a class="repo-link" href="${escapeAttr(repo.html_url)}" target="_blank" rel="noopener noreferrer">
                        View Source &rarr;
                    </a>
                </div>`;

            grid.appendChild(col);
        });

        initReveal();
    } catch (err) {
        grid.innerHTML =
            '<div class="col-12 text-center py-5"><p>Error loading repositories. Please visit GitHub directly.</p></div>';
        console.error("GitHub API Error:", err);
    }
}

// ---- Escape helpers ----
function escapeHTML(str) {
    const el = document.createElement("span");
    el.textContent = str;
    return el.innerHTML;
}

function escapeAttr(str) {
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ---- Scroll-reveal (IntersectionObserver) ----
function initReveal() {
    const els = document.querySelectorAll(".reveal:not(.visible)");
    if (!els.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add("visible");
                    observer.unobserve(e.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    els.forEach((el) => observer.observe(el));
}

// ---- Boot ----
document.addEventListener("DOMContentLoaded", () => {
    fetchRepos();
    initReveal();
});