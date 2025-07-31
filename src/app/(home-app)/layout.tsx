import Topbar from "@/app/(home-app)/_components/Topbar";
import {Footer} from "@/app/(home-app)/_components/Footer";


export default function Layout({
                                   children,
                               }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="relative flex min-h-screen flex-col">
            <Topbar/>
            <div className="flex-1 mb-6">{children}</div>
            <Footer/>
        </div>
    );
}
