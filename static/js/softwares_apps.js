/**
 * SOFTWARES & APPS COMPONENT LOGIC
 * Manages product tabs, rendering, version accordions, and downloads.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Data definition for Softwares & Apps
    const products = [
        {
            id: "copaguru-software",
            name: "CopaGuru",
            publisher: "Nova Ankit Solutions",
            category: "softwares",
            type: "Windows Software",
            rating: "4.8",
            description: "A comprehensive offline training tool for COPA (Computer Operator & Programming Assistant) preparation, including exam simulation engines, structured study modules, and automated score sheets.",
            icon: "terminal",
            fields: [
                { label: "File Size", value: "45 MB" },
                { label: "License", value: "Free to try" },
                { label: "OS Support", value: "Windows 10/11 (64-bit)" },
                { label: "Developer", value: "Ankit Yadav" }
            ],
            primaryAction: {
                label: "Download EXE",
                url: "#",
                icon: "download"
            },
            versions: [
                {
                    version: "v2.1.2",
                    date: "2026-06-15",
                    description: "Optimized test engine performance, loaded 5 additional syllabus mock tests, and resolved database caching bug.",
                    downloadUrl: "#"
                },
                {
                    version: "v2.0.0",
                    date: "2026-03-10",
                    description: "Complete UI overhaul. Integrated local SQLite storage, updated quiz timers, and added progress analytics charts.",
                    downloadUrl: "#"
                },
                {
                    version: "v1.0.0",
                    date: "2025-10-01",
                    description: "First public stable release of CopaGuru Desktop. Included essential theory question banks and interactive practice modules.",
                    downloadUrl: "#"
                }
            ]
        },
        {
            id: "copaguru-app",
            name: "CopaGuru",
            publisher: "Nova Ankit Solutions",
            category: "apps",
            type: "Android & iOS App",
            rating: "4.9",
            description: "Learn coding and prepare for technical COPA exams on the go. Offers mobile-optimized bite-sized lessons, interactive flashcards, and a dedicated training forum for students.",
            icon: "smartphone",
            fields: [
                { label: "File Size", value: "24 MB" },
                { label: "License", value: "Free / Ads Supported" },
                { label: "Platforms", value: "Android & iOS" },
                { label: "Publisher", value: "Ankit Yadav" }
            ],
            primaryAction: {
                label: "Install Mobile App",
                url: "#",
                icon: "smartphone"
            },
            versions: [
                {
                    version: "v3.0.1",
                    date: "2026-07-01",
                    description: "Added AI-powered doubt-solver chat, high-contrast dark theme, and improved question feedback submission.",
                    downloadUrl: "#"
                },
                {
                    version: "v2.5.0",
                    date: "2026-04-12",
                    description: "Offline resources download feature, custom student profiles, and fixed navigation drawer layout for tablet displays.",
                    downloadUrl: "#"
                },
                {
                    version: "v1.0.0",
                    date: "2025-08-15",
                    description: "Initial launch on Google Play Store and Apple App Store. Supported basic lesson plans, registration systems, and user rankings.",
                    downloadUrl: "#"
                }
            ]
        },
        {
            id: "nova-ide-helper",
            name: "Nova IDE Helper",
            publisher: "Nova Ankit Solutions",
            category: "softwares",
            type: "Windows Software",
            rating: "4.7",
            description: "A fast, floating overlay helper utility for trainee developers. Offers syntax cheat sheets, code snippet libraries, and developer-friendly keyboard shortcuts.",
            icon: "code-2",
            fields: [
                { label: "File Size", value: "18 MB" },
                { label: "License", value: "Open Source" },
                { label: "OS Support", value: "Windows 10, 11" },
                { label: "Developer", value: "Ankit Yadav" }
            ],
            primaryAction: {
                label: "Download Installer",
                url: "#",
                icon: "download"
            },
            versions: [
                {
                    version: "v1.2.0",
                    date: "2026-05-20",
                    description: "Updated HTML5 semantic layouts list, added CSS flexbox/grid quick references, and integrated quick snippet search.",
                    downloadUrl: "#"
                },
                {
                    version: "v1.0.0",
                    date: "2026-02-05",
                    description: "Initial release. Key shortcuts, snippet saving database, and custom transparency floating mode.",
                    downloadUrl: "#"
                }
            ]
        },
        {
            id: "nova-attendance-tracker",
            name: "Nova Attendance Tracker",
            publisher: "Nova Ankit Solutions",
            category: "apps",
            type: "Mobile & Web App",
            rating: "4.6",
            description: "A digital attendance sheet and performance ledger designed for instructors. Tracks student login hours, module completions, and quiz scores dynamically.",
            icon: "calendar-range",
            fields: [
                { label: "Size", value: "12 MB" },
                { label: "License", value: "Free to Use" },
                { label: "Platforms", value: "Web, Android App" },
                { label: "Publisher", value: "Ankit Yadav" }
            ],
            primaryAction: {
                label: "Launch Web App",
                url: "#",
                icon: "external-link"
            },
            versions: [
                {
                    version: "v2.0.0",
                    date: "2026-06-01",
                    description: "Redesigned instructor dashboard, added CSV exports, email summaries, and classroom management rules.",
                    downloadUrl: "#"
                },
                {
                    version: "v1.0.0",
                    date: "2025-11-10",
                    description: "Initial build. Supports basic list creations, daily check-in marks, and local backup databases.",
                    downloadUrl: "#"
                }
            ]
        }
    ];

    // DOM Elements
    const tabButtons = document.querySelectorAll('.prod-tab-btn');
    const productsContainer = document.querySelector('.products-container');

    let activeTab = 'softwares'; // default active tab

    // Initialize Rendering
    renderProducts();

    // Tab Switch Event Listeners
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Remove active from all
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active to current
            button.classList.add('active');

            // Switch tab state and re-render
            activeTab = button.getAttribute('data-tab');
            renderProducts();
        });
    });

    /**
     * Renders products under the active tab category
     */
    function renderProducts() {
        if (!productsContainer) return;

        // Clear container
        productsContainer.innerHTML = '';

        // Filter products
        const filteredProducts = products.filter(p => p.category === activeTab);

        if (filteredProducts.length === 0) {
            productsContainer.innerHTML = `<div class="empty-products">No items found in this category.</div>`;
            return;
        }

        // Create Grid
        const grid = document.createElement('div');
        grid.className = 'products-grid';

        filteredProducts.forEach((product, idx) => {
            const card = document.createElement('div');
            card.className = 'product-card glass fade-in-up';
            card.style.animationDelay = `${idx * 0.1}s`;

            // Setup custom icon background classes
            const iconClass = product.category === 'softwares' ? 'software' : 'app';

            // Generate fields HTML
            const fieldsHtml = product.fields.map(f => `
                <div class="prod-field">
                    <span class="prod-field-label">${f.label}</span>
                    <span class="prod-field-val">${f.value}</span>
                </div>
            `).join('');

            // Sort versions (newest first, oldest last)
            const sortedVersions = [...product.versions].sort((a, b) => {
                // To be robust, parse dates
                return new Date(b.date) - new Date(a.date);
            });

            // Generate version timeline list HTML
            const versionsHtml = sortedVersions.map(v => `
                <div class="version-item">
                    <div class="version-item-header">
                        <span class="version-item-num">${v.version}</span>
                        <span class="version-item-date">${formatDate(v.date)}</span>
                    </div>
                    <div class="version-item-desc">${v.description}</div>
                    <a href="${v.downloadUrl}" class="version-item-download">
                        <i data-lucide="download"></i> Download ${v.version}
                    </a>
                </div>
            `).join('');

            // Assemble Card HTML
            card.innerHTML = `
                <div class="prod-card-header">
                    <div class="prod-icon-wrapper ${iconClass}">
                        <i data-lucide="${product.icon}"></i>
                    </div>
                    <div class="prod-title-meta">
                        <h3 class="prod-name">${product.name}</h3>
                        <span class="prod-publisher">${product.publisher}</span>
                        <div class="prod-rating">
                            <i data-lucide="star"></i>
                            <span>${product.rating}/5.0</span>
                        </div>
                    </div>
                    <span class="prod-version-badge">${sortedVersions[0]?.version || 'v1.0.0'}</span>
                </div>
                
                <p class="prod-desc">${product.description}</p>
                
                <div class="prod-fields-grid">
                    ${fieldsHtml}
                </div>
                
                <div class="prod-actions">
                    <a href="${product.primaryAction.url}" class="btn prod-btn-primary">
                        <i data-lucide="${product.primaryAction.icon}"></i> ${product.primaryAction.label}
                    </a>
                    <button class="btn prod-btn-secondary toggle-versions" data-target="${product.id}-versions">
                        <i data-lucide="history"></i> Versions
                    </button>
                </div>
                
                <div id="${product.id}-versions" class="version-list-panel">
                    <h4 class="version-list-title"><i data-lucide="git-branch"></i> Version History (Newest First)</h4>
                    <div class="version-items">
                        ${versionsHtml}
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });

        productsContainer.appendChild(grid);

        // Bind Version Toggle Event Listeners
        const toggleButtons = productsContainer.querySelectorAll('.toggle-versions');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const panel = document.getElementById(targetId);
                if (panel) {
                    const isOpen = panel.classList.toggle('open');
                    
                    // Toggle toggle button styling
                    if (isOpen) {
                        btn.style.borderColor = 'var(--accent-blue)';
                        btn.style.color = 'var(--accent-blue)';
                    } else {
                        btn.style.borderColor = '';
                        btn.style.color = '';
                    }
                }
            });
        });

        // Initialize Lucide Icons for dynamic content
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Helper to format YYYY-MM-DD to Month DD, YYYY
     */
    function formatDate(dateString) {
        try {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', options);
        } catch {
            return dateString;
        }
    }
});
