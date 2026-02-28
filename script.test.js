const assert = require('assert');

// Manual DOM setup
global.document = {
    getElementById: (id) => {
        if (id === 'repo-grid') return global.mockGrid;
        return null;
    },
    createElement: (tag) => {
        return {
            tagName: tag,
            className: '',
            style: {},
            innerHTML: ''
        };
    }
};

// Simple global grid mock object
global.mockGrid = {
    innerHTML: '',
    children: [],
    appendChild: function(child) {
        this.children.push(child);
    }
};

// Capture console.error
let originalConsoleError = console.error;
let consoleErrors = [];

describe('fetchRepos', function() {
    let fetchRepos;
    let originalFetch;

    before(function() {
        originalFetch = global.fetch;

        // Suppress console.error in tests, but capture it
        console.error = (msg, err) => {
            consoleErrors.push({msg, err});
        };

        // Load module
        const mod = require('./script.js');
        fetchRepos = mod.fetchRepos;
    });

    after(function() {
        global.fetch = originalFetch;
        console.error = originalConsoleError;
    });

    beforeEach(function() {
        global.mockGrid.innerHTML = 'loading...'; // Initial state
        global.mockGrid.children = [];
        consoleErrors = [];
    });

    it('should show repositories and correctly filter out forks', async function() {
        // Mock fetch for successful response
        global.fetch = async (url) => {
            return {
                ok: true,
                json: async () => [
                    { name: 'repo1', fork: false, description: 'desc1', stargazers_count: 1, forks_count: 0, language: 'JS', html_url: 'http://link1' },
                    { name: 'repo2', fork: true, description: 'desc2', stargazers_count: 2, forks_count: 1, language: 'Python', html_url: 'http://link2' },
                    { name: 'repo3', fork: false, description: null, stargazers_count: 3, forks_count: 2, language: null, html_url: 'http://link3' }
                ]
            };
        };

        await fetchRepos();

        assert.strictEqual(global.mockGrid.innerHTML, ''); // Loading cleared
        assert.strictEqual(global.mockGrid.children.length, 2); // 2 non-fork repos

        const card1HTML = global.mockGrid.children[0].innerHTML;
        assert.ok(card1HTML.includes('repo1'), 'Should contain repo1 name');
        assert.ok(card1HTML.includes('desc1'), 'Should contain repo1 desc');
        assert.ok(card1HTML.includes('JS'), 'Should contain language JS');

        const card2HTML = global.mockGrid.children[1].innerHTML;
        assert.ok(card2HTML.includes('repo3'), 'Should contain repo3 name');
        assert.ok(card2HTML.includes('No description available.'), 'Should handle null desc');
        assert.ok(card2HTML.includes('Code'), 'Should handle null language');
    });

    it('should show no public repositories found message if all are forks or array is empty', async function() {
        // Mock fetch for successful response but empty/filtered
        global.fetch = async (url) => {
            return {
                ok: true,
                json: async () => [
                    { name: 'repo1', fork: true }
                ]
            };
        };

        await fetchRepos();

        assert.ok(global.mockGrid.innerHTML.includes('No public repositories found.'));
        assert.strictEqual(global.mockGrid.children.length, 0);
    });

    it('should handle HTTP error cases (e.g. 404/500)', async function() {
        global.fetch = async (url) => {
            return {
                ok: false,
                status: 404
            };
        };

        await fetchRepos();

        assert.ok(global.mockGrid.innerHTML.includes('Error loading repositories. Please visit GitHub directly.'));
        assert.strictEqual(consoleErrors.length, 1);
        assert.ok(consoleErrors[0].err.message.includes('404'));
    });

    it('should handle network error cases (fetch rejection)', async function() {
        global.fetch = async (url) => {
            throw new Error('Network failure');
        };

        await fetchRepos();

        assert.ok(global.mockGrid.innerHTML.includes('Error loading repositories. Please visit GitHub directly.'));
        assert.strictEqual(consoleErrors.length, 1);
        assert.strictEqual(consoleErrors[0].err.message, 'Network failure');
    });

    it('should verify the rel="noopener noreferrer" requirement in the generated HTML', async function() {
        global.fetch = async (url) => {
            return {
                ok: true,
                json: async () => [
                    { name: 'repo1', fork: false, html_url: 'http://example.com' }
                ]
            };
        };

        await fetchRepos();

        assert.strictEqual(global.mockGrid.children.length, 1);
        const cardHTML = global.mockGrid.children[0].innerHTML;

        // Security directive check
        assert.ok(cardHTML.includes('target="_blank"'), 'Must have target="_blank"');
        assert.ok(cardHTML.includes('rel="noopener noreferrer"'), 'Must have rel="noopener noreferrer" for security');
    });
});
