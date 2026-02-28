// Manual DOM Mocks for Benchmarking
const { performance } = require('perf_hooks');

class Node {
    constructor(nodeName) {
        this.nodeName = nodeName;
        this.childNodes = [];
    }
    appendChild(node) {
        this.childNodes.push(node);
        node.parentNode = this;
        // Simulate minor overhead of adding to DOM (reflow/repaint mockup)
        if (this.nodeName !== '#document-fragment') {
            let sum = 0;
            for(let i=0; i<1000; i++) sum += i;
        }
        return node;
    }
}

class Element extends Node {
    constructor(tagName) {
        super(tagName.toUpperCase());
        this.tagName = tagName.toUpperCase();
        this.className = '';
        this.innerHTML = '';
        this.style = {};
    }
}

class DocumentFragment extends Node {
    constructor() {
        super('#document-fragment');
    }
}

const mockDocument = {
    createElement: (tagName) => new Element(tagName),
    createDocumentFragment: () => new DocumentFragment(),
    getElementById: (id) => new Element('div')
};

// Generate test data
const numItems = 1000;
const testRepos = Array.from({ length: numItems }, (_, i) => ({
    name: `Repo-${i}`,
    description: `Description for Repo-${i}`,
    stargazers_count: Math.floor(Math.random() * 100),
    forks_count: Math.floor(Math.random() * 50),
    language: 'JavaScript',
    html_url: `https://github.com/prescionx/Repo-${i}`,
    fork: false
}));

function renderDirectAppend(repos) {
    const grid = mockDocument.getElementById('repo-grid');
    grid.innerHTML = '';
    let delay = 0;

    repos.forEach(repo => {
        const cardWrapper = mockDocument.createElement('div');
        cardWrapper.className = `col-md-6 col-lg-4 animate__animated animate__fadeInUp`;
        cardWrapper.style.animationDelay = `${delay}s`;
        delay += 0.1;

        cardWrapper.innerHTML = `<div class="glass-card h-100 p-4 d-flex flex-column position-relative z-1">
            <h3 class="h4 mb-3" style="color: var(--accent);">${repo.name}</h3>
        </div>`;
        grid.appendChild(cardWrapper);
    });
}

function renderDocumentFragment(repos) {
    const grid = mockDocument.getElementById('repo-grid');
    grid.innerHTML = '';
    let delay = 0;

    const fragment = mockDocument.createDocumentFragment();

    repos.forEach(repo => {
        const cardWrapper = mockDocument.createElement('div');
        cardWrapper.className = `col-md-6 col-lg-4 animate__animated animate__fadeInUp`;
        cardWrapper.style.animationDelay = `${delay}s`;
        delay += 0.1;

        cardWrapper.innerHTML = `<div class="glass-card h-100 p-4 d-flex flex-column position-relative z-1">
            <h3 class="h4 mb-3" style="color: var(--accent);">${repo.name}</h3>
        </div>`;
        fragment.appendChild(cardWrapper);
    });

    grid.appendChild(fragment);
}

// Run Benchmark
console.log("Starting benchmark...");

// Warmup
for(let i=0; i<10; i++) {
    renderDirectAppend(testRepos.slice(0, 100));
    renderDocumentFragment(testRepos.slice(0, 100));
}

const startDirect = performance.now();
for(let i=0; i<10; i++) renderDirectAppend(testRepos);
const endDirect = performance.now();
const timeDirect = (endDirect - startDirect) / 10;
console.log(`Direct Append (Baseline): ${timeDirect.toFixed(2)} ms`);

const startFragment = performance.now();
for(let i=0; i<10; i++) renderDocumentFragment(testRepos);
const endFragment = performance.now();
const timeFragment = (endFragment - startFragment) / 10;
console.log(`DocumentFragment (Optimized): ${timeFragment.toFixed(2)} ms`);

const improvement = ((timeDirect - timeFragment) / timeDirect) * 100;
console.log(`Improvement: ${improvement.toFixed(2)}%`);
