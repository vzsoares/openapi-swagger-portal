# Minimalistic API Portal

![API Portal Preview](/static/preview.png)

A lightweight, minimalistic OpenAPI/Swagger documentation portal built with **Alpine.js**, **TailwindCSS**, and **Vite**.
Provides a clean interface for exploring and testing multiple API schemas (OpenAPI/Swagger) from different domains.

## Features

- 🚀 **Vite-Powered** – Fast development server & optimized build
- 📱 **Fully Responsive** – Works seamlessly on desktop, tablet, and mobile devices
- 🌐 **Multi-API Support** – Organize and display multiple APIs by domain category
- 🔎 **Interactive Documentation** – Powered by Swagger UI for testing API endpoints
- 🔄 **Deep Linking** – Share direct links to specific APIs and endpoints
- ⚡ **Lightweight** – Minimal dependencies and fast loading

## Usage

### Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

Serve the `dist/` folder with any static server.

## Configuration

All configuration is now in **`src/config.json`**:

```json
{
    "siteName": "API Portal",
    "supportUrl": "https://example.com",
    "primaryColor": "#1e2939",
    "secondaryColor": "#193cb8",
    "schemas": [
        {
            "name": "Domain Name",
            "apis": [
                {
                    "name": "API Name",
                    "url": "https://path-to-your-swagger-definition.json"
                }
            ]
        }
    ]
}
```

Edit this file to set your portal name, colors, support link, and API definitions.

## Contributing

Contributions are welcome! Submit a Pull Request to improve features, styling, or documentation.

## License

MIT – See [LICENSE](LICENSE).

## Acknowledgments

- [Swagger UI](https://swagger.io/tools/swagger-ui/) – API documentation renderer
- [Alpine.js](https://alpinejs.dev/) – Lightweight reactivity system
- [TailwindCSS](https://tailwindcss.com/) – Utility-first CSS framework
- [Vite](https://vitejs.dev/) – Lightning-fast build tool

---

Made with ❤️ for API consumers and developers
