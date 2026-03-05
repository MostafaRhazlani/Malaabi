/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#effdf5",
                    100: "#d8fbea",
                    200: "#b5f5d3",
                    300: "#81ebb7",
                    400: "#46d899",
                    500: "#20bc80",
                    600: "#139765",
                    700: "#117852",
                    800: "#125e42",
                    900: "#104d37",
                    950: "#082b1f",
                },
            },
        },
    },
    plugins: [],
};
