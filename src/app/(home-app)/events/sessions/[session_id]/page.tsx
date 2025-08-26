import {getSessionSummery} from "@/lib/actions/public/server/eventActions";
import {SessionItem} from "@/app/(home-app)/events/sessions/_components/SessionPage";

const Page = async ({params}: { params: Promise<{ session_id: string }> }) => {
    const {session_id} = await params;
    const sessionSummary = await getSessionSummery(session_id);

    return <SessionItem session={sessionSummary}/>
}

export default Page;