document.addEventListener("alpine:init", () => {
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
                    }, // Replace with actual URLs
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

        init() {
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
        },
    }));
});
