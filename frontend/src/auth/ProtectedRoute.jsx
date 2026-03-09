import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { isAuthed, verifySession } from './auth'

export function ProtectedRoute() {
  const location = useLocation()
  const [checking, setChecking] = useState(true)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!isAuthed()) {
        if (mounted) {
          setOk(false)
          setChecking(false)
        }
        return
      }
      const res = await verifySession()
      if (mounted) {
        setOk(res.ok)
        setChecking(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Verifying session…
      </div>
    )
  }

  if (!ok) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

