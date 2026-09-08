import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Toaster from './components/Toaster'
import ConfirmDialogHost from './components/ConfirmDialogHost'
import { useAuthStore } from './stores/authStore'

// Route-level code splitting: Dashboard alone pulls in reactflow plus every
// node/edge/modal component for the canvas editor -- a large chunk of the
// ~600KB bundle that a visitor hitting the homepage, login, or register
// page has no reason to download before they've even signed up. Splitting
// per-route means the marketing/auth pages ship a much smaller bundle,
// and the canvas editor's code loads only once someone actually opens a
// workflow.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const WorkflowList = lazy(() => import('./pages/WorkflowList'))
const Datasets = lazy(() => import('./pages/Datasets'))

// Bare, theme-matched placeholder for the brief gap while a route chunk
// downloads -- avoids a flash of the default white background between
// navigations now that every page is dark.
function RouteLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-400" />
    </div>
  )
}

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<RouteLoading />}>{element}</Suspense>
}

function App() {
  const { isAuthenticated } = useAuthStore()

  const router = createBrowserRouter([
    {
      path: "/",
      element: isAuthenticated ? <Navigate to="/workflows" replace /> : withSuspense(<Home />)
    },
    {
      path: "/login",
      element: isAuthenticated ? <Navigate to="/workflows" replace /> : withSuspense(<Login />)
    },
    {
      path: "/register",
      element: isAuthenticated ? <Navigate to="/workflows" replace /> : withSuspense(<Register />)
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <Layout />,
          children: [
            {
              path: "/workflows",
              element: withSuspense(<WorkflowList />)
            },
            {
              path: "/workflows/:id",
              element: withSuspense(<Dashboard />)
            },
            {
              path: "/datasets",
              element: withSuspense(<Datasets />)
            }
          ]
        }
      ]
    },
    {
      path: "*",
      element: <Navigate to={isAuthenticated ? "/workflows" : "/"} replace />
    }
  ])

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
      <ConfirmDialogHost />
    </>
  )
}

export default App
