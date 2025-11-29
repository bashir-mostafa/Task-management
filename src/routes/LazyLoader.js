import { lazy } from "react";

export const Lazy = {
  AdminRouter: lazy(() => import("../pages/admin/router/AdminRouter")),
  HomeRouter: lazy(() => import("../pages/home/router/HomeRouter")),
  LoginPage: lazy(() => import("../pages/login/pages/LoginPage")),
  Unauthorized: lazy(() => import("../pages/unauthorized/pages/Unauthorized")),
  ProjectsRouter: lazy(() => import('../pages/admin/projects/router/ProjectsRouter')),

};
