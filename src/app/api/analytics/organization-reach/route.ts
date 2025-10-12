import {NextResponse} from "next/server";
import {getOrganizationReach} from "@/lib/actions/public/server/eventActions";

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
        return NextResponse.json({error: "organizationId is required"}, {status: 400});
    }

    const result = await getOrganizationReach(organizationId);

    if (!result.success) {
        return NextResponse.json({error: result.error ?? "Unable to fetch organization reach"}, {status: 500});
    }

    return NextResponse.json({reach: result.reach ?? 0});
}
