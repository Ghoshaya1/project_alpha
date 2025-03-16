import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0d47a1", // Deep Ocean Blue
    },
    secondary: {
      main: "#26a69a", // Teal
    },
    background: {
      default: "#0a192f", // Deep Navy
      paper: "#112240", // Lighter Navy
    },
    text: {
      primary: "#ffffff", // White
      secondary: "#b0bec5", // Soft Blue-Grey
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h1: { fontSize: "2rem", fontWeight: 600 },
    button: { textTransform: "none" },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />  {/* Reset default browser styles */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
