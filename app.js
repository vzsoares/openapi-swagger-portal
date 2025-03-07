document.addEventListener("alpine:init", () => {
    Alpine.directive("include", async (el, { expression, modifiers }) => {
        try {
            // Fetch the content from the specified URL using the Fetch API
            const response = await fetch(expression);

            if (modifiers.includes("markdown")) {
                const content = await response.text();
                // Parse the Markdown content using the marked library
                const parsedContent = marked(content);

                // Inject the parsed content into the element using x-html directive
                el.innerHTML = parsedContent;
                return;
            }

            // Get the pure text response
            const content = await response.text();
            // Inject the fetched content into the element using x-html directive
            el.innerHTML = content;
        } catch (error) {
            console.error("Error fetching content:", error);
        }
    });

    Alpine.data("apiPortal", () => ({
        domains: [
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
        ],
        selectedDomain: null,
        selectedApi: null,
        swaggerUI: null,
        mobileMenuOpen: false,
        sidebarOpen: false,

        init() {
            // Set default sidebar state based on screen size
            this.sidebarOpen = window.innerWidth >= 768;

            // Initialize with the first API from the first domain
            if (this.domains.length > 0 && this.domains[0].apis.length > 0) {
                this.selectedDomain = this.domains[0].name;
                this.loadApi(this.domains[0].apis[0].url);
            }

            // Parse URL parameters to potentially load a specific API
            const urlParams = new URLSearchParams(window.location.search);
            const apiUrl = urlParams.get("url");
            const domain = urlParams.get("domain");

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
