
export enum UserType {
    ADMIN = "admin",
    USER = "user",
};

export enum OTPType {
    RESET = "passwordReset",
    VERIFICATION = "emailVerification"
};

export enum AdminPermission {
    MANAGE_ALL = "manage_all",
    MANAGE_ADMINS = "manage_admins",
    MANAGE_USERS = "manage_users",
    MANAGE_VENDORS = "manage_vendors",
    MANAGE_USERS_PARTIAL = "manage_users_partial",
    MANAGE_VENDORS_PARTIAL = "manage_vendors_partial",
    VIEW_REPORTS = "view_reports",
    MANAGE_CONTENT = "manage_content",
    MANAGE_FINANCE = "manage_finance",
    MANAGE_SUPPORT = "manage_support",
    MANAGE_HR = "manage_hr",
    MANAGE_IT = "manage_it",
    ENSURE_COMPLIANCE = "ensure_compliance",
    VENDOR_PORTAL_ACCESS = "vendor_portal_access",
    ANY = "any"
};

export enum ResourceType {
    IMAGE = "image",
    VIDEO = "video",
    AUDIO = "video",
    PDF = "raw",
    AUTO = "auto"
};

const basePath = "kc-cdn";

export enum CdnFolders {
    PROFILEPICTURE = "kc-cdn/profile-pictures",
    LISTINGPHOTOS = "kc-cdn/listing-photos"
};

export enum Namespaces {
    NOTIFICATION = "/notification",
    CHAT = "/chat"
};

export enum SocketEvents {
    ERROR = "appError"
}

export enum StreamGroups {
    USER = "user",
    STORE = "store"
};

export enum StreamEvents {
    USER_CREATE = 'create',
    UPLOAD_PROFILE_PIC = 'upload:profile-pic',
    STORE_CREATE = "create",
    DELETE = "delete",
    UPLOAD = "upload",
    FOLLOW = "follow"
};

export type ImageUploadType = "banner" | "image" | "storeImages";

export enum Queues {
    MY_QUEUE = 'my-queue',
    UPLOAD = "upload",
    CREATE_STORE = "create-store",
    UPLOAD_PRODUCT = "upload-product",
    NOTIFY_CUSTOMERS = "notify-customers",
    NEW_FOLLOWER = "new-follower"
};

const sseStoreEvent = "store";
const sseProductEvent = "product";
export enum SSEEvents {
    CREATE_STORE = `${sseStoreEvent}:create`,
    UPLOAD_PRODUCT = `${sseProductEvent}:upload`,
    NOTIFY_CUSTOMERS = `${sseProductEvent}:notify`,
    NEW_FOLLOWER = "notification:newFollower"
}