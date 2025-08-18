// ✅ NEW: Enum to match the backend SessionType
export enum SessionType {
    PHYSICAL = 'PHYSICAL',
    ONLINE = 'ONLINE',
}

export enum SalesStartRuleType {
    IMMEDIATE = 'IMMEDIATE',
    ROLLING = 'ROLLING',
    FIXED = 'FIXED',
}

export enum SessionStatus {
    PENDING = 'PENDING',
    SCHEDULED = 'SCHEDULED',
    ON_SALE = 'ON_SALE',
    SOLD_OUT = 'SOLD_OUT',
    CANCELED = 'CANCELED',
}