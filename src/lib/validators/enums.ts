// ✅ NEW: Enum to match the backend SessionType
export enum SessionType {
    PHYSICAL = 'PHYSICAL',
    ONLINE = 'ONLINE',
}

export enum Enums {
    IMMEDIATE = 'IMMEDIATE',
    ROLLING = 'ROLLING',
    FIXED = 'FIXED',
}

export enum SessionStatus {
    PENDING = 'PENDING',
    SCHEDULED = 'SCHEDULED',
    ON_SALE = 'ON_SALE',
    SOLD_OUT = 'SOLD_OUT',
    CLOSED = 'CLOSED',
    CANCELED = 'CANCELED',
}

export enum ReadModelSeatStatus {
    AVAILABLE = 'AVAILABLE',
    RESERVED = 'RESERVED',
    BOOKED = 'BOOKED',
    LOCKED = 'LOCKED',
}