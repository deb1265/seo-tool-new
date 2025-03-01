import { createCookie } from "@remix-run/node";

const themeCookie = createCookie("theme", {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 31536000, // one year
});

export async function getTheme(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const theme = await themeCookie.parse(cookieHeader);
  return theme || "light";
}

export async function setTheme(theme: string) {
  return themeCookie.serialize(theme);
}
