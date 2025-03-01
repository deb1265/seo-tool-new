import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { createContext, useContext, useEffect } from "react";
import { getTheme, setTheme } from "./utils/theme.server";

import "./styles/app.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
];

// Define theme context with default values
export const ThemeContext = createContext<{
  theme: string;
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Get the theme from cookie
  const theme = await getTheme(request);
  return json({ theme });
};

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const theme = data?.theme || "light";
  
  return (
    <html lang="en" className={theme === "dark" ? "dark" : ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  const theme = data?.theme || "light";
  
  useEffect(() => {
    // Update document class on theme change
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  
  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    await setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    window.location.reload(); // Force reload to update the context with new theme
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Outlet />
    </ThemeContext.Provider>
  );
}
