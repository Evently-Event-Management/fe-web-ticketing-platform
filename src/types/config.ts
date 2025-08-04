// types/config.ts

// Corresponds to AppLimitsConfig.TierLimitDetails
export interface TierLimitDetails {
    maxOrganizationsPerUser: number;
    maxSeatingLayoutsPerOrg: number;
    maxActiveEvents: number;
    maxSessionsPerEvent: number;
}

// Corresponds to AppLimitsConfig.OrganizationConfig
export interface OrganizationLimits {
    maxLogoSize: number;
}

// Corresponds to AppLimitsConfig.EventConfig
export interface EventLimits {
    maxCoverPhotos: number;
    maxCoverPhotoSize: number;
}

// Corresponds to AppLimitsConfig.SeatingLayoutConfig
export interface SeatingLayoutConfig {
    defaultPageSize: number;
    defaultGap: number;
}

export type TierName = 'FREE' | 'PRO' | 'ENTERPRISE';

// Corresponds to the main AppConfigDTO
export interface AppConfig {
    tierLimits: Record<TierName, TierLimitDetails>;
    organizationLimits: OrganizationLimits;
    eventLimits: EventLimits;
    seatingLayoutConfig: SeatingLayoutConfig;
}

// Corresponds to the MyLimitsResponseDTO
export interface MyLimitsResponse {
    currentTier: TierName;
    tierLimits: TierLimitDetails;
    organizationLimits: OrganizationLimits;
    eventLimits: EventLimits;
    seatingLayoutConfig: SeatingLayoutConfig;
}
