# Minimalistic API Portal

![API Portal Preview](https://user-images.githubusercontent.com/assets/api-portal-preview.png)

A lightweight, minimalistic OpenAPI/Swagger documentation portal built with Alpine.js and TailwindCSS. This project provides a clean interface for exploring and testing multiple APIs from different domains without any backend dependencies.

## Features

- 🚀 **Zero Build Process** - Pure HTML, CSS, and JavaScript without complex build tools
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- 🌐 **Multi-API Support** - Organize and display multiple APIs by domain category
- 🔎 **Interactive Documentation** - Powered by Swagger UI for testing API endpoints
- 🎨 **Modern UI** - Clean, minimalistic interface with TailwindCSS
- 🔄 **Deep Linking** - Share direct links to specific APIs and endpoints
- ⚡ **Lightweight** - Fast loading with minimal dependencies

## Getting Started

### Prerequisites

- Any static web server or hosting service
- Modern web browser

### Installation

1. Clone this repository:

```bash
git clone https://github.com/yourusername/api-portal.git
cd api-portal
```

2. Serve the files with any static web server:

```bash
# Using Python
python -m http.server 8080

# OR using Node.js (with http-server)
npx http-server
```

3. Open your browser and navigate to `http://localhost:8080`

## Configuration

Edit the `app.js` file to add your own APIs. The structure follows this format:

```javascript
async function getDomains() {
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

## Project Structure

```
api-portal/
├── index.html        # Main application page
├── support.html      # Support & FAQ page
├── header.html       # Shared header component
├── app.js            # Application logic and API configuration
├── components.js     # Component loading functionality
├── styles.css        # Custom styles
└── README.md         # This documentation
```

## Customization

### Adding Your Own APIs

1. Modify the `getDomains()` function in `app.js` to include your API endpoints
2. Each API must have a valid URL pointing to a Swagger/OpenAPI definition (JSON or YAML)

### Styling

The project uses TailwindCSS for styling. You can customize the appearance by:

1. Editing class names directly in the HTML files
2. Adding custom styles to `styles.css`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- [Alpine.js](https://alpinejs.dev/) - Lightweight JavaScript framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - API documentation renderer

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
