export declare const SERVICES: {
    readonly AUTH: "AUTH_SERVICE";
    readonly TENANTS: "TENANTS_SERVICE";
    readonly USERS: "USERS_SERVICE";
    readonly VEHICLES: "VEHICLES_SERVICE";
    readonly LEADS: "LEADS_SERVICE";
    readonly ORDERS: "ORDERS_SERVICE";
    readonly NOTIFICATIONS: "NOTIFICATIONS_SERVICE";
    readonly MEDIA: "MEDIA_SERVICE";
    readonly ANALYTICS: "ANALYTICS_SERVICE";
    readonly PAYMENTS: "PAYMENTS_SERVICE";
};
export declare const AUTH_PATTERNS: {
    readonly REGISTER: "auth.register";
    readonly LOGIN: "auth.login";
    readonly REFRESH: "auth.refresh";
    readonly LOGOUT: "auth.logout";
};
export declare const TENANT_PATTERNS: {
    readonly CREATE: "tenants.create";
    readonly FIND_BY_ID: "tenants.findById";
    readonly FIND_BY_SLUG: "tenants.findBySlug";
    readonly UPDATE: "tenants.update";
    readonly GET_ALL: "tenants.getAll";
    readonly DEACTIVATE: "tenants.deactivate";
};
export declare const USER_PATTERNS: {
    readonly CREATE: "users.create";
    readonly FIND_BY_ID: "users.findById";
    readonly FIND_BY_EMAIL: "users.findByEmail";
    readonly FIND_ALL: "users.findAll";
    readonly UPDATE: "users.update";
    readonly DELETE: "users.delete";
};
export declare const VEHICLE_PATTERNS: {
    readonly CREATE: "vehicles.create";
    readonly FIND_BY_ID: "vehicles.findById";
    readonly FIND_ALL: "vehicles.findAll";
    readonly UPDATE: "vehicles.update";
    readonly DELETE: "vehicles.delete";
    readonly SEARCH: "vehicles.search";
};
export declare const LEAD_PATTERNS: {
    readonly CREATE: "leads.create";
    readonly FIND_BY_ID: "leads.findById";
    readonly FIND_ALL: "leads.findAll";
    readonly UPDATE: "leads.update";
    readonly DELETE: "leads.delete";
};
export declare const ORDER_PATTERNS: {
    readonly CREATE: "orders.create";
    readonly FIND_BY_ID: "orders.findById";
    readonly FIND_ALL: "orders.findAll";
    readonly UPDATE: "orders.update";
};
export declare const NOTIFICATION_PATTERNS: {
    readonly SEND_EMAIL: "notifications.sendEmail";
    readonly SEND_SMS: "notifications.sendSms";
    readonly SEND_WHATSAPP: "notifications.sendWhatsapp";
};
export declare const MEDIA_PATTERNS: {
    readonly UPLOAD: "media.upload";
    readonly DELETE: "media.delete";
};
export declare const PAYMENT_PATTERNS: {
    readonly CREATE_SUBSCRIPTION: "payments.createSubscription";
    readonly CANCEL_SUBSCRIPTION: "payments.cancelSubscription";
    readonly GET_SUBSCRIPTION: "payments.getSubscription";
    readonly HANDLE_STRIPE_WEBHOOK: "payments.handleStripeWebhook";
    readonly HANDLE_PAYSTACK_WEBHOOK: "payments.handlePaystackWebhook";
};
