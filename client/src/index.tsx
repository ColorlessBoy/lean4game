import * as React from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'
import { store } from './state/store'
import { Provider } from 'react-redux'
import type { RouteObject } from "react-router"
import { createHashRouter, RouterProvider, Route, redirect } from "react-router-dom"
import ErrorPage from './components/error_page'
import Welcome from './components/welcome'
import LandingPage from './components/landing_page'
import Level from './components/level'
import './i18n';



// If `VITE_LEAN4GAME_SINGLE` is set to true, then `/` should be redirected to
// `/g/local/game`. This is used for the devcontainer setup
let single_game = (import.meta.env.VITE_LEAN4GAME_SINGLE == "true")
let root_object: RouteObject = single_game ? {
  path: "/",
  loader: () => redirect("/g/colorlessboy/lean4quickstart")
} : {
  path: "/",
  errorElement: <ErrorPage />,
  children: [
    {
      path: "/",
      element: <LandingPage />,
    }
  ]
}

const router = createHashRouter([
  root_object,
  {
    path: "/g/:owner/:repo",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/g/:owner/:repo",
        element: <Welcome />,
      },
      {
        path: "/g/:owner/:repo/world/:worldId/level/:levelId",
        element: <Level />,
      },
    ],
  },
]);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
