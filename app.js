// Change this config
const config = {
    siteName: "API Portal",
    supportUrl: "https://github.com/vzsoares/openapi-swagger-portal",
    primaryColor: "#1e2939",
    secondaryColor: "#193cb8",
};
/**
 * Fetch your apis here!!!!!!!!!!!!!!
 * @returns {Promise<Array<{name: string, apis: Array<{name: string, url: string}>}>}
 */
async function getDomains() {
    return [
        {
            name: "Core Services",
            apis: [
                {
                    name: "Petstore API",
                    url: "https://petstore.swagger.io/v2/swagger.json?1",
                },
                {
                    name: "User Service",
                    url: "https://petstore.swagger.io/v2/swagger.json?2",
                },
            ],
        },
        {
            name: "Payment Services",
            apis: [
                {
                    name: "Payment API",
                    url: "https://petstore.swagger.io/v2/swagger.json?3",
                },
                {
                    name: "Invoice Service",
                    url: "https://petstore.swagger.io/v2/swagger.json?4",
                },
            ],
        },
        {
            name: "Catalog Services",
            apis: [
                {
                    name: "Products API",
                    url: "https://petstore.swagger.io/v2/swagger.json?5",
                },
                {
                    name: "Categories API",
                    url: "https://petstore.swagger.io/v2/swagger.json?6",
                },
            ],
        },
    ];
}

/////////////////////////////
// DONT TOUCH AFTER THIS LINE
/////////////////////////////

document.addEventListener("alpine:init", () => {
    Alpine.data("config", () => ({
        ...config,
        css: `
        @theme {
            --color-primary: ${config.primaryColor};
            --color-secondary: ${config.secondaryColor};
        }
`,
    }));
    Alpine.data("apiPortal", () => ({
        domains: [],
        selectedDomain: null,
        selectedApi: null,
        swaggerUI: null,
        sidebarOpen: false,

        async init() {
            this.domains = await getDomains();
            // Set default sidebar state based on screen size
            this.sidebarOpen = window.innerWidth >= 768;

            // Parse URL parameters to potentially load a specific API
            const urlParams = new URLSearchParams(window.location.search);
            const apiUrl = urlParams.get("url");
            const domain = urlParams.get("domain");

            // Initialize with the first API from the first domain
            if (
                !apiUrl &&
                this.domains.length > 0 &&
                this.domains[0].apis.length > 0
            ) {
                this.selectedDomain = this.domains[0].name;
                this.loadApi(this.domains[0].apis[0].url);
            }

            if (apiUrl) {
                this.loadApi(apiUrl);

                if (domain) {
                    this.selectDomain(domain);
                }
            }

            // Close mobile menu when resizing to desktop
            window.addEventListener("resize", () => {
                if (window.innerWidth >= 1024) {
                    this.mobileMenuOpen = false;
                }
                if (window.innerWidth >= 768) {
                    this.sidebarOpen = true;
                } else {
                    this.sidebarOpen = false;
                }
            });
        },

        selectDomain(domainName) {
            this.selectedDomain =
                this.selectedDomain === domainName ? null : domainName;
        },

        loadApi(url) {
            this.selectedApi = url;

            // Update the URL with the selected API
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set("url", url);

            // Find domain for this API
            for (const domain of this.domains) {
                for (const api of domain.apis) {
                    if (api.url === url) {
                        urlParams.set("domain", domain.name);
                        break;
                    }
                }
            }

            // Preserve the hash fragment (if any)
            const currentHash = window.location.hash;

            window.history.replaceState(
                {},
                "",
                `${window.location.pathname}?${urlParams}${currentHash}`,
            );

            // Initialize or update SwaggerUI
            const options = {
                url: url,
                dom_id: "#swagger",
                docExpansion: "list",
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset,
                ],
                plugins: [SwaggerUIBundle.plugins.DownloadUrl],
            };

            if (!this.swaggerUI) {
                this.swaggerUI = SwaggerUIBundle(options);
            } else {
                this.swaggerUI.specActions.updateUrl(url);
                this.swaggerUI.specActions.download(url);
            }

            // Export to window for use in custom js
            window.ui = this.swaggerUI;

            // Close sidebar on mobile after selecting an API
            if (window.innerWidth < 768) {
                this.sidebarOpen = false;
            }
        },
    }));
});
