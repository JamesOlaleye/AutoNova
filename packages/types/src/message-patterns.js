"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENT_PATTERNS = exports.MEDIA_PATTERNS = exports.NOTIFICATION_PATTERNS = exports.ORDER_PATTERNS = exports.LEAD_PATTERNS = exports.VEHICLE_PATTERNS = exports.USER_PATTERNS = exports.TENANT_PATTERNS = exports.AUTH_PATTERNS = exports.SERVICES = void 0;
exports.SERVICES = {
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
};
exports.AUTH_PATTERNS = {
    REGISTER: 'auth.register',
    LOGIN: 'auth.login',
    REFRESH: 'auth.refresh',
    LOGOUT: 'auth.logout',
};
exports.TENANT_PATTERNS = {
    CREATE: 'tenants.create',
    FIND_BY_ID: 'tenants.findById',
    FIND_BY_SLUG: 'tenants.findBySlug',
    UPDATE: 'tenants.update',
    GET_ALL: 'tenants.getAll',
    DEACTIVATE: 'tenants.deactivate',
};
exports.USER_PATTERNS = {
    CREATE: 'users.create',
    FIND_BY_ID: 'users.findById',
    FIND_BY_EMAIL: 'users.findByEmail',
    FIND_ALL: 'users.findAll',
    UPDATE: 'users.update',
    DELETE: 'users.delete',
};
exports.VEHICLE_PATTERNS = {
    CREATE: 'vehicles.create',
    FIND_BY_ID: 'vehicles.findById',
    FIND_ALL: 'vehicles.findAll',
    UPDATE: 'vehicles.update',
    DELETE: 'vehicles.delete',
    SEARCH: 'vehicles.search',
};
exports.LEAD_PATTERNS = {
    CREATE: 'leads.create',
    FIND_BY_ID: 'leads.findById',
    FIND_ALL: 'leads.findAll',
    UPDATE: 'leads.update',
    DELETE: 'leads.delete',
};
exports.ORDER_PATTERNS = {
    CREATE: 'orders.create',
    FIND_BY_ID: 'orders.findById',
    FIND_ALL: 'orders.findAll',
    UPDATE: 'orders.update',
};
exports.NOTIFICATION_PATTERNS = {
    SEND_EMAIL: 'notifications.sendEmail',
    SEND_SMS: 'notifications.sendSms',
    SEND_WHATSAPP: 'notifications.sendWhatsapp',
};
exports.MEDIA_PATTERNS = {
    UPLOAD: 'media.upload',
    DELETE: 'media.delete',
};
exports.PAYMENT_PATTERNS = {
    CREATE_SUBSCRIPTION: 'payments.createSubscription',
    CANCEL_SUBSCRIPTION: 'payments.cancelSubscription',
    GET_SUBSCRIPTION: 'payments.getSubscription',
    HANDLE_STRIPE_WEBHOOK: 'payments.handleStripeWebhook',
    HANDLE_PAYSTACK_WEBHOOK: 'payments.handlePaystackWebhook',
};
//# sourceMappingURL=message-patterns.js.map