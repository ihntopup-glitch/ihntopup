import { CreditCard, Facebook, Youtube, Instagram } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#348234]/90 backdrop-blur-sm pb-20 md:pb-0 text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <CreditCard className="h-8 w-8 text-white" />
                            <h1 className="text-2xl font-bold font-headline">
                                IHN TOPUP
                            </h1>
                        </Link>
                        <p className="text-white/80 text-sm">
                            Get your favorite game credits and digital vouchers instantly. Fast, secure, and reliable service.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="/topup" className="text-white/80 hover:text-white">Top-Up</Link></li>
                            <li><Link href="/orders" className="text-white/80 hover:text-white">My Orders</Link></li>
                            <li><Link href="/profile" className="text-white/80 hover:text-white">Profile</Link></li>
                            <li><Link href="/support" className="text-white/80 hover:text-white">Support</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4">Legal</h3>
                         <ul className="space-y-2">
                            <li><Link href="#" className="text-white/80 hover:text-white">Terms of Service</Link></li>
                            <li><Link href="#" className="text-white/80 hover:text-white">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-white/80 hover:text-white">Refund Policy</Link></li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-bold text-lg mb-4">Follow Us</h3>
                        <div className="flex items-center gap-4">
                            <Link href="#" aria-label="Facebook" className="text-white/80 hover:text-white"><Facebook /></Link>
                            <Link href="#" aria-label="YouTube" className="text-white/80 hover:text-white"><Youtube /></Link>
                            <Link href="#" aria-label="Instagram" className="text-white/80 hover:text-white"><Instagram /></Link>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm text-white/80">
                    <p>&copy; {new Date().getFullYear()} IHN TOPUP. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
