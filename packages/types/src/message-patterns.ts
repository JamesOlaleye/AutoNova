export const SERVICES = {
  AUTH: 'AUTH_SERVICE',
  TENANTS: 'TENANTS_SERVICE',
  USERS: 'USERS_SERVICE',
  VEHICLES: 'VEHICLES_SERVICE',
  LEADS: 'LEADS_SERVICE',
  ORDERS: 'ORDERS_SERVICE',
  NOTIFICATIONS: 'NOTIFICATIONS_SERVICE',
  MEDIA: 'MEDIA_SERVICE',
  ANALYTICS: 'ANALYTICS_SERVICE',
  PAYMENTS: 'PAYMENTS_SERVICE',
} as const;

export const AUTH_PATTERNS = {
  REGISTER: 'auth.register',
  LOGIN: 'auth.login',
  REFRESH: 'auth.refresh',
  LOGOUT: 'auth.logout',
} as const;

export const TENANT_PATTERNS = {
  CREATE: 'tenants.create',
  FIND_BY_ID: 'tenants.findById',
  FIND_BY_SLUG: 'tenants.findBySlug',
  FIND_PUBLIC: 'tenants.findPublic',
  UPDATE: 'tenants.update',
  GET_ALL: 'tenants.getAll',
  DEACTIVATE: 'tenants.deactivate',
  GET_PLAN: 'tenants.getPlan',
} as const;

export const USER_PATTERNS = {
  CREATE: 'users.create',
  FIND_BY_ID: 'users.findById',
  FIND_BY_EMAIL: 'users.findByEmail',
  FIND_ALL: 'users.findAll',
  UPDATE: 'users.update',
  DELETE: 'users.delete',
  CHANGE_PASSWORD: 'users.changePassword',
} as const;

export const VEHICLE_PATTERNS = {
  CREATE: 'vehicles.create',
  FIND_BY_ID: 'vehicles.findById',
  FIND_ALL: 'vehicles.findAll',
  UPDATE: 'vehicles.update',
  DELETE: 'vehicles.delete',
  SEARCH: 'vehicles.search',
  ADD_IMAGE: 'vehicles.addImage',
  REMOVE_IMAGE: 'vehicles.removeImage',
} as const;

export const LEAD_PATTERNS = {
  CREATE: 'leads.create',
  FIND_BY_ID: 'leads.findById',
  FIND_ALL: 'leads.findAll',
  UPDATE: 'leads.update',
  DELETE: 'leads.delete',
} as const;

export const ORDER_PATTERNS = {
  CREATE: 'orders.create',
  FIND_BY_ID: 'orders.findById',
  FIND_ALL: 'orders.findAll',
  UPDATE: 'orders.update',
  ADD_DOCUMENT: 'orders.addDocument',
  REMOVE_DOCUMENT: 'orders.removeDocument',
} as const;

export const NOTIFICATION_PATTERNS = {
  SEND_EMAIL: 'notifications.sendEmail',
  SEND_SMS: 'notifications.sendSms',
  SEND_WHATSAPP: 'notifications.sendWhatsapp',
  NOTIFY_NEW_LEAD: 'notifications.notifyNewLead',
  NOTIFY_LEAD_ASSIGNED: 'notifications.notifyLeadAssigned',
} as const;

export const MEDIA_PATTERNS = {
  UPLOAD: 'media.upload',
  DELETE: 'media.delete',
} as const;

export const PAYMENT_PATTERNS = {
  CREATE_SUBSCRIPTION: 'payments.createSubscription',
  CANCEL_SUBSCRIPTION: 'payments.cancelSubscription',
  GET_SUBSCRIPTION: 'payments.getSubscription',
  CREATE_PORTAL_SESSION: 'payments.createPortalSession',
  HANDLE_STRIPE_WEBHOOK: 'payments.handleStripeWebhook',
  HANDLE_PAYSTACK_WEBHOOK: 'payments.handlePaystackWebhook',
  TENANT_CREATED: 'payments.tenantCreated',
} as const;
