export default {
    plugins: {
        /** @type {import('tailwindcss').Config} */
        tailwindcss: {
            content: ["./*.html", "./*.js"],
            theme: {
                extend: {
                    colors: {
                        primary: "hsl(var(--color-primary))",
                        secondary: "hsl(var(--color-secondary))",
                    },
                },
            },
        },
        autoprefixer: {
            theme: {
                extend: {
                    fontFamily: {
                        serif: ["Playfair Display", "serif"],
                        sans: ["Source Sans Pro", "sans-serif"],
                    },
                },
            },
        },
    },
};
