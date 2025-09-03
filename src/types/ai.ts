export interface GenerateOverviewRequest {
    prompt: string;
    title: string;
    organization: string;
    description: string;
    category: string;
}

export interface GenerateOverviewResponse {
    markdownContent: string;
}