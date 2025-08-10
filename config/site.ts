export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Miche Claro",
  description:
    "La mejor alternativa para comprar y vender alcohol online en Venezuela.",
  navItems: [
    {
      label: "Inicio",
      href: "/home",
    },
    {
      label: "Registrate",
      href: "/register",
    },
    {
      label: "Nuestro Precios",
      href: "/pricing",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "Sobre Nosotros",
      href: "/about",
    },
    {
      label: "Contacto",
      href: "/contact",
    },
    {
      label: "Inicia Sesión",
      href: "/login",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
