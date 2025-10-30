import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // redirection depuis la page d'accueil
  index("routes/redirect-to-login.tsx"),

  // page de connexion
  route("login", "routes/login.tsx"),

  // tableau de bord
  route("dashboard", "routes/dashboard.tsx", [
    route("home", "routes/pages/home.tsx"),
    route("about", "routes/pages/about.tsx"),
    route("blog", "routes/pages/blog-new.tsx"),
    route("media", "routes/pages/mediaPage.tsx"),
  ]),
] satisfies RouteConfig;