export var UserType;
(function (UserType) {
    UserType["ADMIN"] = "admin";
    UserType["PAYER"] = "payer";
    UserType["RATER"] = "rater";
    UserType["CEO"] = "ceo";
    UserType["CC"] = "customer-support";
})(UserType || (UserType = {}));
export var ActivityType;
(function (ActivityType) {
    // Rate Related
    ActivityType["RATE_UPDATE"] = "rate_update";
    // User Authentication
    ActivityType["USER_LOGIN"] = "user_login";
    ActivityType["USER_LOGOUT"] = "user_logout";
    ActivityType["LOGIN_FAILED"] = "login_failed";
    ActivityType["TWO_FA_GENERATED"] = "two_fa_generated";
    ActivityType["TWO_FA_VERIFIED"] = "two_fa_verified";
    ActivityType["TWO_FA_FAILED"] = "two_fa_failed";
    ActivityType["USER_CREATE"] = "user_create";
    ActivityType["USER_UPDATE"] = "user_update";
    ActivityType["USER_DELETE"] = "user_delete";
    ActivityType["USER_PROFILE_UPDATE"] = "user_profile_update";
    ActivityType["USER_STATUS_CHANGE"] = "user_status_change";
    ActivityType["EMAIL_VERIFICATION"] = "email_verification";
    ActivityType["EMAIL_VERIFICATION_REQUEST"] = "email_verification_request";
    ActivityType["EMAIL_VERIFICATION_FAILED"] = "email_verification_failed";
    ActivityType["EMAIL_VERIFICATION_EXPIRED"] = "email_verification_expired";
    ActivityType["PASSWORD_RESET_REQUEST"] = "password_reset_request";
    ActivityType["PASSWORD_RESET"] = "password_reset";
    ActivityType["PASSWORD_RESET_FAILED"] = "password_reset_failed";
    ActivityType["PASSWORD_CHANGE"] = "password_change";
    ActivityType["PASSWORD_CHANGE_FAILED"] = "password_change_failed";
    ActivityType["SHIFT_CREATE"] = "shift_create";
    ActivityType["SHIFT_UPDATE"] = "shift_update";
    ActivityType["SHIFT_DELETE"] = "shift_delete";
    ActivityType["PHONE_VERIFICATION_REQUEST"] = "phone_verification_request";
    ActivityType["PHONE_VERIFICATION"] = "phone_verification";
    ActivityType["PHONE_VERIFICATION_FAILED"] = "phone_verification_failed";
    ActivityType["TWO_FA_ENABLED"] = "two_fa_enabled";
    ActivityType["TWO_FA_DISABLED"] = "two_fa_disabled";
    ActivityType["TWO_FA_STATUS_CHANGE"] = "two_fa_status_change";
    ActivityType["SYSTEM"] = "system";
    ActivityType["SYSTEM_ERROR"] = "system_error";
    ActivityType["SYSTEM_WARNING"] = "system_warning";
    ActivityType["SYSTEM_MAINTENANCE"] = "system_maintenance";
    ActivityType["SESSION_EXPIRED"] = "session_expired";
    ActivityType["SESSION_TERMINATED"] = "session_terminated";
    ActivityType["ROLE_ASSIGNED"] = "role_assigned";
    ActivityType["ROLE_REMOVED"] = "role_removed";
    ActivityType["ROLE_UPDATED"] = "role_updated";
    ActivityType["API_ACCESS_GRANTED"] = "api_access_granted";
    ActivityType["API_ACCESS_REVOKED"] = "api_access_revoked";
    ActivityType["API_KEY_GENERATED"] = "api_key_generated";
    ActivityType["DATA_EXPORT"] = "data_export";
    ActivityType["DATA_IMPORT"] = "data_import";
    ActivityType["ACCOUNT_LOCKED"] = "account_locked";
    ActivityType["ACCOUNT_UNLOCKED"] = "account_unlocked";
    ActivityType["ACCOUNT_SUSPENDED"] = "account_suspended";
    ActivityType["ACCOUNT_REACTIVATED"] = "account_reactivated";
})(ActivityType || (ActivityType = {}));
export var TradePlatform;
(function (TradePlatform) {
    TradePlatform["PAXFUL"] = "paxful";
    TradePlatform["NOONES"] = "noones";
    TradePlatform["BINANCE"] = "binance";
})(TradePlatform || (TradePlatform = {}));
export var TradeStatus;
(function (TradeStatus) {
    TradeStatus["PENDING"] = "pending";
    TradeStatus["ASSIGNED"] = "assigned";
    TradeStatus["COMPLETED"] = "completed";
    TradeStatus["CANCELLED"] = "cancelled";
    TradeStatus["DISPUTED"] = "disputed";
})(TradeStatus || (TradeStatus = {}));
// Enum for notification type
export var NotificationType;
(function (NotificationType) {
    NotificationType["SYSTEM"] = "system";
    NotificationType["INDIVIDUAL"] = "individual";
})(NotificationType || (NotificationType = {}));
// Enum for priority level
export var PriorityLevel;
(function (PriorityLevel) {
    PriorityLevel["HIGH"] = "high";
    PriorityLevel["MEDIUM"] = "medium";
    PriorityLevel["LOW"] = "low";
})(PriorityLevel || (PriorityLevel = {}));
export var ShiftStatus;
(function (ShiftStatus) {
    ShiftStatus["ACTIVE"] = "active";
    ShiftStatus["ON_BREAK"] = "on_break";
    ShiftStatus["PENDING_APPROVAL"] = "pending_approval";
    ShiftStatus["APPROVED"] = "approved";
    ShiftStatus["REJECTED"] = "rejected";
    ShiftStatus["ENDED"] = "ended";
    ShiftStatus["FORCE_CLOSED"] = "force_closed";
})(ShiftStatus || (ShiftStatus = {}));
