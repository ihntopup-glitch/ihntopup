import { CreditCard, Facebook, Youtube, Instagram } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-muted/40 pb-20 md:pb-0">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <CreditCard className="h-8 w-8 text-primary" />
                            <h1 className="text-2xl font-bold font-headline text-foreground">
                                IHN TOPUP
                            </h1>
                        </Link>
                        <p className="text-muted-foreground text-sm">
                            Get your favorite game credits and digital vouchers instantly. Fast, secure, and reliable service.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="/topup" className="text-muted-foreground hover:text-primary">Top-Up</Link></li>
                            <li><Link href="/orders" className="text-muted-foreground hover:text-primary">My Orders</Link></li>
                            <li><Link href="/profile" className="text-muted-foreground hover:text-primary">Profile</Link></li>
                            <li><Link href="/support" className="text-muted-foreground hover:text-primary">Support</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4">Legal</h3>
                         <ul className="space-y-2">
                            <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-muted-foreground hover:t-primary">Refund Policy</Link></li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-bold text-lg mb-4">Follow Us</h3>
                        <div className="flex items-center gap-4">
                            <Link href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary"><Facebook /></Link>
                            <Link href="#" aria-label="YouTube" className="text-muted-foreground hover:text-primary"><Youtube /></Link>
                            <Link href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary"><Instagram /></Link>
                        </div>
                    </div>
                </div>
                <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} IHN TOPUP. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
