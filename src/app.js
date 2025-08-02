// Change this config
const config = {
    siteName: "API Portal",
    supportUrl: "https://github.com/vzsoares/openapi-swagger-portal",
    primaryColor: "#1e2939",
    secondaryColor: "#193cb8",
};
// LocalStorage utility functions
const STORAGE_KEY = "api-portal-custom-schemas";

function getCustomSchemas() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        console.log("Retrieved from localStorage:", stored);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Error loading custom schemas from localStorage:", error);
        return [];
    }
}

function saveCustomSchemas(schemas) {
    try {
        console.log("Saving custom schemas:", schemas);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(schemas));
        console.log("Successfully saved to localStorage");
    } catch (error) {
        console.error("Error saving custom schemas to localStorage:", error);
    }
}

/**
 * Get default schemas and merge with custom ones from localStorage
 * @returns {Promise<Array<{name: string, apis: Array<{name: string, url: string}>}>}
 */
async function getSchemas() {
    const defaultSchemas = [
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

    const customSchemas = getCustomSchemas();

    // Recreate blob URLs for JSON content
    const processedCustomSchemas = customSchemas.map((domain) => ({
        ...domain,
        apis: domain.apis.map((api) => {
            if (api.isLocal && api.jsonContent) {
                // Use a stable identifier for local JSON content
                try {
                    // Create a stable identifier for this API
                    const apiId = `local-api-${btoa(api.name).replace(/[^a-zA-Z0-9]/g, "")}`;
                    return {
                        ...api,
                        url: apiId, // Use API ID instead of URL
                        localId: apiId,
                    };
                } catch (error) {
                    console.error(
                        "Error processing local JSON for API:",
                        api.name,
                        error,
                    );
                    return api; // Return original if there's an error
                }
            }
            return api;
        }),
    }));

    return [...defaultSchemas, ...processedCustomSchemas];
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
        showAddForm: false,
        addingToDomain: "",
        newDomainName: "",
        newApiName: "",
        newApiUrl: "",
        inputMode: "url", // 'url' or 'json'
        newApiJson: "",

        async init() {
            this.domains = await getSchemas();
            // Set default sidebar state based on screen size
            this.sidebarOpen = window.innerWidth >= 768;

            // Parse URL parameters to potentially load a specific API
            const urlParams = new URLSearchParams(window.location.search);
            const apiUrl = urlParams.get("url");
            const localApiName = urlParams.get("localApi");
            const domain = urlParams.get("domain");
            
            console.log('URL params on init:', { apiUrl, localApiName, domain });

            // Initialize with the first API from the first domain
            if (
                !apiUrl && !localApiName &&
                this.domains.length > 0 &&
                this.domains[0].apis.length > 0
            ) {
                this.selectedDomain = this.domains[0].name;
                this.loadApi(this.domains[0].apis[0].url);
            }

            // Load API from URL parameters
            if (apiUrl) {
                this.loadApi(apiUrl);
            } else if (localApiName) {
                // Find and load local API by name
                console.log('Looking for local API:', localApiName);
                let foundLocalApi = false;
                for (const domainObj of this.domains) {
                    console.log('Checking domain:', domainObj.name);
                    for (const api of domainObj.apis) {
                        console.log('Checking API:', api.name, 'isLocal:', api.isLocal);
                        if (api.isLocal && api.name === localApiName) {
                            console.log('Found matching local API, loading:', api.url);
                            this.loadApi(api.url);
                            foundLocalApi = true;
                            break;
                        }
                    }
                    if (foundLocalApi) break;
                }
                if (!foundLocalApi) {
                    console.log('Local API not found:', localApiName);
                }
            }

            if (domain) {
                this.selectDomain(domain);
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

            // Check if this is a local JSON API
            let isLocalApi = false;
            let jsonContent = null;
            let apiName = null;

            for (const domain of this.domains) {
                for (const api of domain.apis) {
                    if (api.url === url && api.isLocal && api.jsonContent) {
                        isLocalApi = true;
                        jsonContent = api.jsonContent;
                        apiName = api.name;
                        break;
                    }
                }
                if (isLocalApi) break;
            }

            // Update the URL with the selected API
            const urlParams = new URLSearchParams(window.location.search);
            
            if (isLocalApi) {
                // For local APIs, use the API name instead of the local identifier
                console.log('Setting localApi parameter:', apiName);
                urlParams.set("localApi", apiName);
                urlParams.delete("url"); // Remove url param for local APIs
            } else {
                console.log('Setting url parameter:', url);
                urlParams.set("url", url);
                urlParams.delete("localApi"); // Remove localApi param for remote APIs
            }

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
            let options;

            if (isLocalApi && jsonContent) {
                // For local JSON APIs, use spec instead of url
                try {
                    const parsedJson = JSON.parse(jsonContent);
                    options = {
                        spec: parsedJson,
                        dom_id: "#swagger",
                        docExpansion: "list",
                        deepLinking: true,
                        presets: [
                            SwaggerUIBundle.presets.apis,
                            SwaggerUIBundle.SwaggerUIStandalonePreset,
                        ],
                        plugins: [SwaggerUIBundle.plugins.DownloadUrl],
                    };
                } catch (error) {
                    console.error("Error parsing local JSON:", error);
                    return;
                }
            } else {
                // For remote URLs, use url
                options = {
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
            }

            if (!this.swaggerUI) {
                this.swaggerUI = SwaggerUIBundle(options);
            } else {
                if (isLocalApi && jsonContent) {
                    // For local APIs, update the spec directly
                    try {
                        const parsedJson = JSON.parse(jsonContent);
                        this.swaggerUI.specActions.updateSpec(
                            JSON.stringify(parsedJson),
                        );
                    } catch (error) {
                        console.error("Error updating local JSON spec:", error);
                    }
                } else {
                    // For remote APIs, update URL
                    this.swaggerUI.specActions.updateUrl(url);
                    this.swaggerUI.specActions.download(url);
                }
            }

            // Export to window for use in custom js
            window.ui = this.swaggerUI;

            // Close sidebar on mobile after selecting an API
            if (window.innerWidth < 768) {
                this.sidebarOpen = false;
            }
        },

        openAddForm(domainName = "") {
            this.showAddForm = true;
            this.addingToDomain = domainName;
            this.newDomainName = domainName;
            this.newApiName = "";
            this.newApiUrl = "";
            this.inputMode = "url";
            this.newApiJson = "";
        },

        closeAddForm() {
            this.showAddForm = false;
            this.addingToDomain = "";
            this.newDomainName = "";
            this.newApiName = "";
            this.newApiUrl = "";
            this.inputMode = "url";
            this.newApiJson = "";
        },

        async addSchema() {
            if (!this.newApiName) {
                alert("Please fill in the API name");
                return;
            }

            if (this.inputMode === "url" && !this.newApiUrl) {
                alert("Please provide a valid URL");
                return;
            }

            if (this.inputMode === "json" && !this.newApiJson.trim()) {
                alert("Please paste the JSON content");
                return;
            }

            let apiUrl = this.newApiUrl;

            // If JSON mode, just validate the JSON
            if (this.inputMode === "json") {
                try {
                    // Validate JSON
                    const parsedJson = JSON.parse(this.newApiJson);
                    // Create a stable identifier for this API
                    apiUrl = `local-api-${btoa(this.newApiName).replace(/[^a-zA-Z0-9]/g, "")}`;
                } catch (error) {
                    alert(
                        "Invalid JSON format. Please check your JSON syntax.",
                    );
                    return;
                }
            }

            const customSchemas = getCustomSchemas();
            const domainName = this.newDomainName || "Custom APIs";

            // Find existing domain or create new one
            let domain = customSchemas.find((d) => d.name === domainName);
            if (!domain) {
                domain = { name: domainName, apis: [] };
                customSchemas.push(domain);
            }

            // Check for duplicate API names in the domain
            if (domain.apis.some((api) => api.name === this.newApiName)) {
                alert("An API with this name already exists in the domain");
                return;
            }

            // Add new API
            domain.apis.push({
                name: this.newApiName,
                url: apiUrl,
                isLocal: this.inputMode === "json", // Flag to track local JSON APIs
                jsonContent:
                    this.inputMode === "json" ? this.newApiJson : undefined, // Store JSON content
            });

            console.log("About to save custom schemas:", customSchemas);
            // Save to localStorage
            saveCustomSchemas(customSchemas);

            // Refresh domains
            this.domains = await getSchemas();

            this.closeAddForm();
        },

        async removeCustomApi(domainName, apiName) {
            if (!confirm("Are you sure you want to remove this API?")) {
                return;
            }

            const customSchemas = getCustomSchemas();
            const domainIndex = customSchemas.findIndex(
                (d) => d.name === domainName,
            );

            if (domainIndex === -1) return;

            const domain = customSchemas[domainIndex];

            domain.apis = domain.apis.filter((api) => api.name !== apiName);

            // Remove domain if no APIs left
            if (domain.apis.length === 0) {
                customSchemas.splice(domainIndex, 1);
            }

            saveCustomSchemas(customSchemas);
            this.domains = await getSchemas();

            // Clear selection if removed API was selected
            if (
                this.selectedApi &&
                this.domains.every((d) =>
                    d.apis.every((api) => api.url !== this.selectedApi),
                )
            ) {
                this.selectedApi = null;
            }
        },

        isCustomDomain(domainName) {
            const customSchemas = getCustomSchemas();
            return customSchemas.some((d) => d.name === domainName);
        },
    }));
});
