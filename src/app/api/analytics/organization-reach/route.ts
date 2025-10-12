import {NextResponse} from "next/server";
import {getOrganizationAudienceInsights} from "@/lib/actions/public/server/eventActions";

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
        return NextResponse.json({error: "organizationId is required"}, {status: 400});
    }

    const result = await getOrganizationAudienceInsights(organizationId);

    if (!result.success || !result.data) {
        return NextResponse.json({error: result.error ?? "Unable to fetch organization insights"}, {status: 500});
    }

    return NextResponse.json(result.data);
}
