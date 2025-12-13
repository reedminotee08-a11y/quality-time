import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  permissions: string[];
  last_login?: string;
  created_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  hasPermission: (permission: string) => boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isManager: false,
  isStaff: false,
  hasPermission: () => false,
  refreshProfile: async () => {},
  signOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

// Permission definitions
export const PERMISSIONS = {
  // Dashboard permissions
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ANALYTICS: 'view_analytics',
  
  // Product permissions
  VIEW_PRODUCTS: 'view_products',
  ADD_PRODUCTS: 'add_products',
  EDIT_PRODUCTS: 'edit_products',
  DELETE_PRODUCTS: 'delete_products',
  MANAGE_INVENTORY: 'manage_inventory',
  
  // Order permissions
  VIEW_ORDERS: 'view_orders',
  PROCESS_ORDERS: 'process_orders',
  UPDATE_ORDER_STATUS: 'update_order_status',
  CANCEL_ORDERS: 'cancel_orders',
  VIEW_ORDER_DETAILS: 'view_order_details',
  
  // Customer permissions
  VIEW_CUSTOMERS: 'view_customers',
  MANAGE_CUSTOMERS: 'manage_customers',
  EXPORT_CUSTOMER_DATA: 'export_customer_data',
  
  // System permissions
  MANAGE_USERS: 'manage_users',
  VIEW_SYSTEM_LOGS: 'view_system_logs',
  MANAGE_SETTINGS: 'manage_settings',
  EXPORT_DATA: 'export_data',
  
  // Content permissions
  MANAGE_CONTENT: 'manage_content',
  VIEW_REPORTS: 'view_reports'
} as const;

// Role permissions mapping
const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS),
  manager: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.ADD_PRODUCTS,
    PERMISSIONS.EDIT_PRODUCTS,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.PROCESS_ORDERS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.VIEW_ORDER_DETAILS,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.EXPORT_CUSTOMER_DATA,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_REPORTS
  ],
  staff: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.EDIT_PRODUCTS,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.PROCESS_ORDERS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.VIEW_ORDER_DETAILS,
    PERMISSIONS.VIEW_CUSTOMERS
  ]
};

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      // First, try to get existing profile
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        // Set loading to false even on error to prevent infinite loading
        setLoading(false);
        return;
      }

      // If profile doesn't exist, create one
      if (!existingProfile && session?.user?.email) {
        const newProfile: Partial<UserProfile> = {
          id: userId,
          email: session.user.email,
          role: 'admin', // Default role for first user
          permissions: ROLE_PERMISSIONS.admin,
          created_at: new Date().toISOString()
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          // Set loading to false even on error to prevent infinite loading
          setLoading(false);
          return;
        }

        setProfile(createdProfile);
      } else if (existingProfile) {
        setProfile(existingProfile);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      // Set loading to false even on exception to prevent infinite loading
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    return profile.permissions.includes(permission);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        // Set loading to false if no user exists
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Error getting session:', error);
      // Ensure loading is set to false even if session fails
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Calculate role flags
  const isAdmin = profile?.role === 'admin';
  const isManager = profile?.role === 'manager';
  const isStaff = profile?.role === 'staff';

  const value: AuthContextType = {
    session,
    user,
    profile,
    loading,
    isAdmin,
    isManager,
    isStaff,
    hasPermission,
    refreshProfile,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component for route protection
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions?: string[]
) => {
  return function ProtectedComponent(props: P) {
    const { hasPermission, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center text-gold-500 bg-dark-800">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
        </div>
      );
    }

    if (requiredPermissions && !requiredPermissions.every(permission => hasPermission(permission))) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-800">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">غير مصرح بالوصول</h1>
            <p className="text-gray-400">ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

// Permission check hook
export const usePermissions = () => {
  const { hasPermission, isAdmin, isManager, isStaff } = useAuth();

  return {
    hasPermission,
    isAdmin,
    isManager,
    isStaff,
    canViewDashboard: hasPermission(PERMISSIONS.VIEW_DASHBOARD),
    canViewAnalytics: hasPermission(PERMISSIONS.VIEW_ANALYTICS),
    canManageProducts: hasPermission(PERMISSIONS.MANAGE_INVENTORY),
    canAddProducts: hasPermission(PERMISSIONS.ADD_PRODUCTS),
    canEditProducts: hasPermission(PERMISSIONS.EDIT_PRODUCTS),
    canDeleteProducts: hasPermission(PERMISSIONS.DELETE_PRODUCTS),
    canViewOrders: hasPermission(PERMISSIONS.VIEW_ORDERS),
    canProcessOrders: hasPermission(PERMISSIONS.PROCESS_ORDERS),
    canUpdateOrderStatus: hasPermission(PERMISSIONS.UPDATE_ORDER_STATUS),
    canCancelOrders: hasPermission(PERMISSIONS.CANCEL_ORDERS),
    canViewCustomers: hasPermission(PERMISSIONS.VIEW_CUSTOMERS),
    canManageCustomers: hasPermission(PERMISSIONS.MANAGE_CUSTOMERS),
    canExportData: hasPermission(PERMISSIONS.EXPORT_DATA),
    canManageUsers: hasPermission(PERMISSIONS.MANAGE_USERS),
    canViewReports: hasPermission(PERMISSIONS.VIEW_REPORTS)
  };
};
