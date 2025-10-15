import {Linkedin, Ticket } from "lucide-react";
import Link from "next/link";
import {SiFacebook, SiInstagram, SiX} from "@icons-pack/react-simple-icons";

export function Footer() {
    return (
        <footer className="bg-muted/40 border-t">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    <div className="col-span-full md:col-span-1 lg:col-span-2 mb-4 md:mb-0">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Ticket className="h-8 w-8 text-primary" />
                            <span className="text-xl font-bold">Ticketly</span>
                        </Link>
                        <p className="text-muted-foreground text-sm max-w-xs">
                            The premier platform for seamless event ticketing and management.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Product</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="#"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Integrations
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://api.dpiyumal.me/api/event-seating/swagger-ui/index.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    API
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Press
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="#"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Status
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
                            &copy; {new Date().getFullYear()} TicketingPlatform. All rights
                            reserved.
                        </p>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                <SiFacebook className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                <SiX className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                <SiInstagram className="h-5 w-5" />
                            </Link>
                            <Link
                                href="#"
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Linkedin className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
