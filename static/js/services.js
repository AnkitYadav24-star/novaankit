/**
 * SERVICES & PRICING COMPONENT LOGIC
 * Fetches data from Google Sheets, manages filtering, and renders UI components
 */

document.addEventListener('DOMContentLoaded', () => {
    // API endpoint
    const SERVICES_API = '/api/services';

    // Local in-memory cache for fetched data
    let cachedServices = [];
    let uniqueCategories = [];

    // DOM Elements
    let servicesTableBody = document.getElementById('services-table-body');
    const tableContainer = document.getElementById('table-container');
    const categoriesGrid = document.getElementById('categories-grid');
    const searchInput = document.getElementById('services-search');
    const categorySelect = document.getElementById('services-category-filter');
    const categorySectionTitle = document.getElementById('category-section-title');

    // Load initial data
    fetchServices();

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderTable();
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            renderTable();
        });
    }

    /**
     * Fetches services from the API. Handles skeletons, error states, and cache loading.
     */
    async function fetchServices(forceRefresh = false) {
        showLoadingState();

        const url = forceRefresh ? `${SERVICES_API}?refresh=true` : SERVICES_API;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            if (result.status === 'success' && Array.isArray(result.data)) {
                cachedServices = result.data;
                
                // Extract unique categories
                uniqueCategories = [...new Set(cachedServices.map(s => s.Category))].filter(Boolean);
                
                // Setup filters and render UI
                populateCategoryFilter();
                renderTable();
                renderCategoriesCards();
            } else {
                throw new Error(result.message || 'Invalid API data format');
            }
        } catch (error) {
            console.error('Error loading services:', error);
            showErrorState();
        }
    }

    /**
     * Populates the category dropdown filter dynamically
     */
    function populateCategoryFilter() {
        if (!categorySelect) return;

        // Keep the first default "All Categories" option
        categorySelect.innerHTML = '<option value="all">All Categories</option>';

        uniqueCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    /**
     * Renders the services rows in the table with search & filter applied
     */
    function renderTable() {
        if (!servicesTableBody) return;

        // Get filter inputs
        const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedCategory = categorySelect ? categorySelect.value : 'all';

        // Filter the cached array
        const filtered = cachedServices.filter(service => {
            const matchesCategory = (selectedCategory === 'all' || service.Category === selectedCategory);
            
            const matchesSearch = !searchQuery || 
                service.Service_name.toLowerCase().includes(searchQuery) ||
                service.Category.toLowerCase().includes(searchQuery) ||
                service.Deliverables.toLowerCase().includes(searchQuery);

            return matchesCategory && matchesSearch;
        });

        // Clear existing rows
        servicesTableBody.innerHTML = '';

        if (filtered.length === 0) {
            showEmptyState();
            return;
        }

        // Generate rows
        filtered.forEach((service, index) => {
            const tr = document.createElement('tr');
            tr.className = 'fade-in-up';
            tr.style.animationDelay = `${index * 0.05}s`;

            // Prepare Category Badge Class Name
            const badgeClass = `badge-${service.Category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

            // Format Base Price
            let displayPrice = service.Base_price;
            if (!isNaN(service.Base_price) && service.Base_price !== '') {
                // If it is a number, format it nicely
                displayPrice = `₹${parseFloat(service.Base_price).toLocaleString('en-IN')}`;
            }

            // Split and format deliverables as tags
            const deliverablesArray = service.Deliverables.split(',')
                .map(d => d.trim())
                .filter(Boolean);

            let deliverablesHtml = '';
            if (deliverablesArray.length > 0) {
                deliverablesHtml = `<div class="deliverables-list">`;
                deliverablesHtml += deliverablesArray.map(tag => 
                    `<span class="deliverable-tag">${tag}</span>`
                ).join('');
                deliverablesHtml += `</div>`;
            } else {
                deliverablesHtml = '-';
            }

            // Construct row with data-labels for mobile layout
            tr.innerHTML = `
                <td class="td-service" data-label="Service">${service.Service_name}</td>
                <td data-label="Category">
                    <span class="category-badge ${badgeClass} badge-default">${service.Category}</span>
                </td>
                <td class="td-price" data-label="Price">${displayPrice}</td>
                <td data-label="Estimated Duration">${service.Duration_estimated || '-'}</td>
                <td class="td-deliverables" data-label="Deliverables">${deliverablesHtml}</td>
            `;

            servicesTableBody.appendChild(tr);
        });

        // Initialize Lucide Icons inside the table if any icons are present
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Renders category cards with dynamic professional content below the table
     */
    function renderCategoriesCards() {
        if (!categoriesGrid) return;

        // Group services by Category and count them
        const categoryCounts = {};
        cachedServices.forEach(service => {
            if (service.Category) {
                categoryCounts[service.Category] = (categoryCounts[service.Category] || 0) + 1;
            }
        });

        categoriesGrid.innerHTML = '';

        Object.keys(categoryCounts).forEach((category, index) => {
            const count = categoryCounts[category];
            const card = document.createElement('div');
            card.className = 'category-card glass fade-in-up';
            card.style.animationDelay = `${(index + 2) * 0.1}s`;

            // Get professional description
            const desc = getProfessionalDescription(category);
            const iconName = getCategoryIconName(category);
            const iconClass = getCategoryIconClass(category);

            card.innerHTML = `
                <div class="category-card-header">
                    <div class="category-card-icon ${iconClass}">
                        <i data-lucide="${iconName}"></i>
                    </div>
                    <span class="category-service-count">${count} ${count === 1 ? 'Service' : 'Services'}</span>
                </div>
                <h3 class="category-card-title">${category}</h3>
                <p class="category-card-desc">${desc}</p>
            `;

            categoriesGrid.appendChild(card);
        });

        // Create lucide icons for categories cards
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Dynamic Professional Description Provider
     */
    function getProfessionalDescription(categoryName) {
        const cat = categoryName.toLowerCase();
        
        if (cat.includes('web')) {
            return "End-to-end web engineering focused on speed, high-performance layouts, search engine optimization (SEO), and custom database integrations. Suitable for businesses looking to establish a premium digital footprint or scale modular platforms. Benefits include bulletproof security, interactive interfaces, and clean, enterprise-grade code structures.";
        }
        if (cat.includes('app') || cat.includes('mobile')) {
            return "Design, coding, and deployment of native and cross-platform mobile apps for iOS and Android. Perfect for startups and companies seeking fluid mobile experiences with touch optimization. Benefits include optimized rendering performance, native hardware capability, and secure offline-first application states.";
        }
        if (cat.includes('ui') || cat.includes('ux') || cat.includes('design')) {
            return "User-centric interface and user experience design pipelines built on deep user research, wireframing, prototyping, and modern layouts. Designed for products that value usability and intuitive visual alignment. Benefits include reduced user friction, higher retention, and a modern aesthetic appeal.";
        }
        if (cat.includes('marketing') || cat.includes('seo')) {
            return "Data-driven marketing architecture covering SEO auditing, campaign tracking, social metrics, and Google Analytics integrations. Designed to boost organic search presence and optimize online visibility. Benefits include structured search engine relevance and measurable conversions.";
        }
        if (cat.includes('train') || cat.includes('educat') || cat.includes('teach')) {
            return "Professional hands-on training programs and bootcamps covering backend architectures, frontend setups, and developer lifecycle management. Ideal for enterprise engineering teams and developers looking to scale. Benefits include production-level coding training and custom curriculum paths.";
        }
        if (cat.includes('consult')) {
            return "High-level strategic tech consulting including technology roadmap design, code audits, architecture evaluations, and team workflows. Suitable for startups and executives seeking guidance. Benefits include architectural risk mitigation, optimized resource planning, and scalable growth pathways.";
        }

        // Fallback dynamic explanation
        return `Custom portfolio-quality ${categoryName} services designed to optimize workflow operations, enhance technical stability, and scale business features. Tailored for individuals and companies looking to deploy expert engineering strategies. Benefits include reliable post-launch support and custom modular implementations.`;
    }

    /**
     * Map category to appropriate Lucide Icon Name
     */
    function getCategoryIconName(categoryName) {
        const cat = categoryName.toLowerCase();
        if (cat.includes('web')) return 'globe';
        if (cat.includes('app') || cat.includes('mobile')) return 'smartphone';
        if (cat.includes('ui') || cat.includes('ux') || cat.includes('design')) return 'layers';
        if (cat.includes('marketing') || cat.includes('seo')) return 'trending-up';
        if (cat.includes('train') || cat.includes('educat') || cat.includes('teach')) return 'presentation';
        if (cat.includes('consult')) return 'handshake';
        return 'briefcase'; // default
    }

    /**
     * Map category to CSS class for colors
     */
    function getCategoryIconClass(categoryName) {
        const cat = categoryName.toLowerCase();
        if (cat.includes('web')) return 'web';
        if (cat.includes('app') || cat.includes('mobile')) return 'app';
        if (cat.includes('ui') || cat.includes('ux') || cat.includes('design')) return 'uiux';
        if (cat.includes('marketing') || cat.includes('seo')) return 'marketing';
        return 'default'; // default
    }

    /**
     * Shows skeletons in table and categories containers during API fetch
     */
    function showLoadingState() {
        if (servicesTableBody) {
            let skeletonRows = '';
            for (let i = 0; i < 4; i++) {
                skeletonRows += `
                    <tr class="skeleton-row">
                        <td><div class="skeleton-bar medium"></div></td>
                        <td><div class="skeleton-bar skeleton-badge"></div></td>
                        <td><div class="skeleton-bar short" style="float: right;"></div></td>
                        <td><div class="skeleton-bar short"></div></td>
                        <td><div class="skeleton-bar"></div></td>
                    </tr>
                `;
            }
            servicesTableBody.innerHTML = skeletonRows;
        }

        if (categoriesGrid) {
            let skeletonCards = '';
            for (let i = 0; i < 3; i++) {
                skeletonCards += `
                    <div class="category-card glass skeleton-row skeleton-card">
                        <div class="skeleton-bar skeleton-badge" style="margin-bottom: 20px;"></div>
                        <div class="skeleton-bar medium" style="margin-bottom: 12px; height: 24px;"></div>
                        <div class="skeleton-bar" style="margin-bottom: 8px;"></div>
                        <div class="skeleton-bar" style="margin-bottom: 8px;"></div>
                        <div class="skeleton-bar short"></div>
                    </div>
                `;
            }
            categoriesGrid.innerHTML = skeletonCards;
        }
    }

    /**
     * Shows an error message in the table container if the API request fails
     */
    function showErrorState() {
        if (!tableContainer) return;

        // Render error inside table container
        tableContainer.innerHTML = `
            <div class="state-container fade-in-up">
                <div class="state-icon state-error-icon">
                    <i data-lucide="alert-triangle"></i>
                </div>
                <h3 class="state-title">Connection Error</h3>
                <p class="state-desc">Unable to load Services. Please try again later.</p>
                <button id="retry-btn" class="btn btn-primary" style="margin: 0 auto;">
                    <span>Retry</span>
                    <i data-lucide="refresh-cw" class="btn-icon"></i>
                </button>
            </div>
        `;

        if (categoriesGrid) {
            categoriesGrid.innerHTML = '';
        }

        // Attach retry event listener
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                // Restore structure before fetching
                restoreTableContainerStructure();
                fetchServices(true); // force cache refresh on retry
            });
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Shows empty state inside the table when search results return 0 matches
     */
    function showEmptyState() {
        if (!servicesTableBody) return;

        // Span across all columns in table
        servicesTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="padding: 0; border: none;">
                    <div class="state-container fade-in-up" style="background: transparent;">
                        <div class="state-icon state-empty-icon">
                            <i data-lucide="folder-open"></i>
                        </div>
                        <h3 class="state-title">No Results Found</h3>
                        <p class="state-desc" style="margin-bottom: 0;">No services matches your search or filter choice.</p>
                    </div>
                </td>
            </tr>
        `;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Helper to restore table structure if error state replaced it
     */
    function restoreTableContainerStructure() {
        if (!tableContainer) return;
        tableContainer.innerHTML = `
            <div class="table-wrapper">
                <table class="services-table">
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Category</th>
                            <th style="text-align: right;">Price</th>
                            <th>Estimated Duration</th>
                            <th>Deliverables</th>
                        </tr>
                    </thead>
                    <tbody id="services-table-body">
                    </tbody>
                </table>
            </div>
        `;
        // Re-assign the reference
        servicesTableBody = document.getElementById('services-table-body');
        // Let's re-run document selector just to be perfectly sure
        setTimeout(() => {
            const body = document.getElementById('services-table-body');
            if (body) {
                // Re-bind in current execution context
                location.href = "#"; // dummy
            }
        }, 10);
    }
});
