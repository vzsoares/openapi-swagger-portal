import Alpine from "alpinejs";
import SwaggerUIBundle, { SwaggerUIOptions } from "swagger-ui";
import "swagger-ui/dist/swagger-ui.css";
import config from "./config.json";

declare global {
    interface Window {
        Alpine: typeof Alpine;
    }
}

type Api = {
    name: string;
    url: string;
    isLocal?: boolean;
    jsonContent?: string;
};

type Schema = {
    name: string;
    apis: Api[];
};

interface ApiPortalData {
    domains: Schema[];
    selectedDomain: string | null;
    selectedApi: string | null;
    swaggerUI: any | null;
    sidebarOpen: boolean;
    showAddForm: boolean;
    formData: {
        domainName: string;
        apiName: string;
        apiUrl: string;
        inputMode: "url" | "json";
        apiJson: string;
    };
    init(): Promise<void>;
    selectDomain(domainName: string): void;
    loadApi(url: string): void;
    openAddForm(domainName?: string): void;
    closeAddForm(): void;
    addSchema(): Promise<void>;
    removeCustomApi(domainName: string, apiName: string): Promise<void>;
    isCustomDomain(domainName: string): boolean;
}

window.Alpine = Alpine;

const STORAGE_KEY = "api-portal-custom-schemas";

const storage = {
    get: (): Schema[] => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        } catch {
            return [];
        }
    },
    save: (schemas: Schema[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(schemas));
        } catch (error) {
            console.error("Storage error:", error);
        }
    },
};

const getSchemas = async (): Promise<Schema[]> => [
    ...config.schemas,
    ...storage.get(),
];

document.addEventListener("DOMContentLoaded", () => {
    Alpine.data("config", () => ({
        ...config,
    }));

    Alpine.data(
        "apiPortal",
        (): ApiPortalData => ({
            domains: [],
            selectedDomain: null,
            selectedApi: null,
            swaggerUI: null,
            sidebarOpen: false,
            showAddForm: false,
            formData: {
                domainName: "",
                apiName: "",
                apiUrl: "",
                inputMode: "url",
                apiJson: "",
            },

            async init() {
                this.domains = await getSchemas();
                // Parse URL parameters to potentially load a specific API
                const urlParams = new URLSearchParams(window.location.search);
                const apiUrl = urlParams.get("url");
                const localApiName = urlParams.get("localApi");
                const domain = urlParams.get("domain");

                // Initialize with the first API from the first domain
                if (
                    !apiUrl &&
                    !localApiName &&
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
                    let foundLocalApi = false;
                    for (const domainObj of this.domains) {
                        for (const api of domainObj.apis) {
                            if (api.isLocal && api.name === localApiName) {
                                this.loadApi(api.url);
                                foundLocalApi = true;
                                break;
                            }
                        }
                        if (foundLocalApi) break;
                    }
                    if (!foundLocalApi) {
                        console.log("Local API not found:", localApiName);
                    }
                }

                if (domain) {
                    this.selectDomain(domain);
                }
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
                    urlParams.set("localApi", apiName ?? "");
                    urlParams.delete("url"); // Remove url param for local APIs
                } else {
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
                let options: SwaggerUIOptions = {
                    dom_id: "#swagger",
                    docExpansion: "list",
                    deepLinking: true,
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIBundle.presets.base,
                    ],
                    plugins: [],
                };

                if (isLocalApi && jsonContent) {
                    // For local JSON APIs, use spec instead of url
                    try {
                        const parsedJson = JSON.parse(jsonContent);
                        options.spec = parsedJson;
                    } catch (error) {
                        console.error("Error parsing local JSON:", error);
                        return;
                    }
                } else {
                    // For remote URLs, use url
                    options.url = url;
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
                            console.error(
                                "Error updating local JSON spec:",
                                error,
                            );
                        }
                    } else {
                        // For remote APIs, update URL
                        this.swaggerUI.specActions.updateUrl(url);
                        this.swaggerUI.specActions.download(url);
                    }
                }
            },

            openAddForm(domainName = "") {
                this.showAddForm = true;
                this.formData = {
                    domainName,
                    apiName: "",
                    apiUrl: "",
                    inputMode: "url",
                    apiJson: "",
                };
            },

            closeAddForm() {
                this.showAddForm = false;
                this.formData = {
                    domainName: "",
                    apiName: "",
                    apiUrl: "",
                    inputMode: "url",
                    apiJson: "",
                };
            },

            async addSchema() {
                const { apiName, apiUrl, inputMode, apiJson, domainName } =
                    this.formData;

                if (!apiName) return alert("Please fill in the API name");
                if (inputMode === "url" && !apiUrl)
                    return alert("Please provide a valid URL");
                if (inputMode === "json" && !apiJson.trim())
                    return alert("Please paste the JSON content");

                let finalUrl = apiUrl;
                if (inputMode === "json") {
                    try {
                        JSON.parse(apiJson);
                        finalUrl = `local-api-${btoa(apiName).replace(/[^a-zA-Z0-9]/g, "")}`;
                    } catch {
                        return alert(
                            "Invalid JSON format. Please check your JSON syntax.",
                        );
                    }
                }

                const customSchemas = storage.get();
                const targetDomain = domainName || "Custom APIs";
                let domain = customSchemas.find((d) => d.name === targetDomain);

                if (!domain) {
                    domain = { name: targetDomain, apis: [] };
                    customSchemas.push(domain);
                }

                if (domain.apis.some((api) => api.name === apiName)) {
                    return alert(
                        "An API with this name already exists in the domain",
                    );
                }

                domain.apis.push({
                    name: apiName,
                    url: finalUrl,
                    isLocal: inputMode === "json",
                    jsonContent: inputMode === "json" ? apiJson : "",
                });

                storage.save(customSchemas);
                this.domains = await getSchemas();
                this.closeAddForm();
            },

            async removeCustomApi(domainName: string, apiName: string) {
                if (!confirm("Are you sure you want to remove this API?"))
                    return;

                const customSchemas = storage.get();
                const domainIndex = customSchemas.findIndex(
                    (d) => d.name === domainName,
                );
                if (domainIndex === -1) return;

                const domain = customSchemas[domainIndex];
                domain.apis = domain.apis.filter((api) => api.name !== apiName);

                if (domain.apis.length === 0) {
                    customSchemas.splice(domainIndex, 1);
                }

                storage.save(customSchemas);
                this.domains = await getSchemas();

                if (
                    this.selectedApi &&
                    this.domains.every((d) =>
                        d.apis.every((api) => api.url !== this.selectedApi),
                    )
                ) {
                    this.selectedApi = null;
                }
            },

            isCustomDomain(domainName: string) {
                return storage.get().some((d) => d.name === domainName);
            },
        }),
    );
    // Start Alpine
    Alpine.start();
    document.documentElement.style.setProperty(
        "--color-primary",
        config.primaryColor,
    );
    document.documentElement.style.setProperty(
        "--color-secondary",
        config.secondaryColor,
    );
});
