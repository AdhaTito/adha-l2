/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "index.html",
    "monitoring.html",
    "reporting.html",
    "tools.html",
    "json-beautify.html",
    "base64.html",
    "multiple-query.html",
    "./src/**/*.{html,js}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    container: {
      center: true,
      padding: "16px",
    },
    extend: {
      boxShadow: {
        custom: "10px 10px 0 rgba(0, 0, 0, 0.2)", // Posisi khusus
        "custom-inset": "inset 5px 5px 0 rgba(0, 0, 0, 0.3)", // Shadow inset
      },
      backgroundPosition: {
        "custome-center": "50% 50%",
      },
      colors: {
        mainColor: "#FF7A00",
        secondaryColor: "#3F4F6F",
        ascentColor: "#F09C4E",
      },
      fontFamily: {
        poppins: ["poppins"],
      },
      screens: {
        "2xl": "1320px",
      },
    },
  },
  plugins: [require("flowbite/plugin"), "prettier-plugin-tailwindcss"],
};
