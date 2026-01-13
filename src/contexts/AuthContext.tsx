'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  whatsapp?: string
  role: 'USER' | 'SELLER' | 'SHOP_OWNER' | 'ADMIN'
  permissions: {
    canManageProducts: boolean
    canManageUsers: boolean
    canViewReports: boolean
    canManageOrders: boolean
    canManageShop: boolean
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  token: string | null
  hasPermission: (permission: keyof User['permissions']) => boolean
  hasRole: (role: User['role'] | User['role'][]) => boolean
  canAccessAdminPanel: () => boolean
  login: (userData: User, authToken?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // محاكاة جلب بيانات المستخدم من localStorage أو API
    const userData = localStorage.getItem('user')
    const authToken = localStorage.getItem('authToken')
    
    if (userData) {
      try {
        setUser(JSON.parse(userData))
        if (authToken) {
          setToken(authToken)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('authToken')
      }
    }
    setLoading(false)
  }, [])

  const hasPermission = (permission: keyof User['permissions']): boolean => {
    if (!user) return false
    // Admin has all permissions
    if (user.role === 'ADMIN') return true
    return user.permissions[permission]
  }

  const hasRole = (roles: User['role'] | User['role'][]): boolean => {
    if (!user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }

  const canAccessAdminPanel = (): boolean => {
    if (!user) return false
    return user.role === 'ADMIN' || 
           user.role === 'SHOP_OWNER' || 
           user.permissions.canManageUsers ||
           user.permissions.canViewReports
  }

  const login = (userData: User, authToken?: string) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    
    if (authToken) {
      setToken(authToken)
      localStorage.setItem('authToken', authToken)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      token,
      hasPermission,
      hasRole,
      canAccessAdminPanel,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// مكون للتحقق من الصلاحيات
interface PermissionGuardProps {
  permission?: keyof User['permissions']
  role?: User['role'] | User['role'][]
  adminOnly?: boolean
  fallback?: ReactNode
  children: ReactNode
}

export const PermissionGuard = ({ 
  permission, 
  role, 
  adminOnly, 
  fallback = null, 
  children 
}: PermissionGuardProps) => {
  const { user, hasPermission, hasRole } = useAuth()

  if (!user) {
    return <>{fallback}</>
  }

  // Admin only check
  if (adminOnly && user.role !== 'ADMIN') {
    return <>{fallback}</>
  }

  // Permission check
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>
  }

  // Role check
  if (role && !hasRole(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// مكون لعرض معلومات المستخدم الحالي
export const CurrentUser = () => {
  const { user } = useAuth()

  if (!user) return null

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      'USER': 'مستخدم',
      'SELLER': 'بائع',
      'SHOP_OWNER': 'صاحب محل',
      'ADMIN': 'إدمن'
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  const getRoleColor = (role: string) => {
    const roleColors = {
      'ADMIN': 'bg-red-100 text-red-800',
      'SHOP_OWNER': 'bg-purple-100 text-purple-800',
      'SELLER': 'bg-blue-100 text-blue-800',
      'USER': 'bg-gray-100 text-gray-800'
    }
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm">
        <div className="font-medium text-gray-900">{user.name}</div>
        <div className="text-gray-500">{user.email}</div>
      </div>
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
        {getRoleDisplayName(user.role)}
      </div>
    </div>
  )
}

// Hook لتسجيل الدخول مع الصلاحيات
export const useLogin = () => {
  const { login } = useAuth()

  const loginWithPermissions = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok && data.user) {
        // تحديد الصلاحيات بناءً على الدور
        const permissions = {
          canManageProducts: false,
          canManageUsers: false,
          canViewReports: false,
          canManageOrders: false,
          canManageShop: false,
          ...data.user.permissions
        }

        const userData: User = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          permissions
        }

        login(userData)
        return { success: true, user: userData }
      } else {
        return { success: false, error: data.error || 'فشل تسجيل الدخول' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' }
    }
  }

  return { loginWithPermissions }
}