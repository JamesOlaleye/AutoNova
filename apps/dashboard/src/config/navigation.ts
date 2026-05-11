import {
  LayoutDashboard,
  Car,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  UsersRound,
  CalendarCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
  /** If set, only these roles see this item */
  roles?: string[];
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Sales',
    items: [
      { href: '/inventory', label: 'Inventory', icon: Car },
      { href: '/leads', label: 'Enquiries', icon: Users },
      { href: '/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/test-drives', label: 'Test Drives', icon: CalendarCheck },
    ],
  },
  {
    label: 'Business',
    items: [
      {
        href: '/staff',
        label: 'Team',
        icon: UsersRound,
        roles: ['DEALER_ADMIN', 'PLATFORM_ADMIN'],
      },
      {
        href: '/analytics',
        label: 'Analytics',
        icon: BarChart3,
        disabled: true,
        badge: 'Soon',
        roles: ['DEALER_ADMIN', 'PLATFORM_ADMIN'],
      },
      {
        href: '/settings',
        label: 'Settings',
        icon: Settings,
        disabled: true,
        badge: 'Soon',
        roles: ['DEALER_ADMIN', 'PLATFORM_ADMIN'],
      },
    ],
  },
];
