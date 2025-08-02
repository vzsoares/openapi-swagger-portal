# Minimalistic API Portal

![API Portal Preview](/preview.png)

A lightweight, minimalistic OpenAPI/Swagger documentation portal built with Alpine.js and TailwindCSS. This project provides a clean interface for exploring and testing multiple APIs swagger openapi schemas from different domains without any backend dependencies. Easily display multiple swagger UI's 🤩

## Features

- 🚀 **Zero Build Process** - Pure HTML, CSS, and JavaScript without complex build tools
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- 🌐 **Multi-API Support** - Organize and display multiple APIs by domain category
- 🔎 **Interactive Documentation** - Powered by Swagger UI for testing API endpoints
- 🔄 **Deep Linking** - Share direct links to specific APIs and endpoints
- ⚡ **Lightweight** - Fast loading with minimal dependencies

## Usage

Just copy the `index.html` file and `app.js` and serve it. 😸

## Configuration

Edit the `app.js` file to add your own APIs. The structure follows this format:

```javascript
const config = {
    siteName: "API Portal",
    supportUrl: "https://github.com",
    primaryColor: "#1e2939",
    secondaryColor: "#193cb8",
};
async function getSchemas() {
    // Maybe fetch from remote??
    return [
        {
            name: "Domain Name",
            apis: [
                {
                    name: "API Name",
                    url: "https://path-to-your-swagger-definition.json",
                },
                // More APIs...
            ],
        },
        // More domains...
    ];
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Swagger UI](https://swagger.io/tools/swagger-ui/) for the excellent API documentation renderer
- [Alpine.js](https://alpinejs.dev/) for the lightweight reactivity system
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS framework

---

Made with ❤️ for API consumers and developers
