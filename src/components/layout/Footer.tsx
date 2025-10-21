import { CreditCard, Telegram } from "lucide-react";
import Link from "next/link";
import { FacebookIcon, YoutubeIcon, InstagramIcon, TelegramIcon } from "@/components/icons";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-[#1C2534] text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Image src="https://i.imgur.com/bJH9BH5.png" alt="IHN TOPUP Logo" width={32} height={32} />
                        </Link>
                        <p className="text-white/80 text-sm">
                            Get your favorite game credits and digital vouchers instantly. Fast, secure, and reliable service.
                        </p>
                         <div className="mt-4">
                            <h3 className="font-bold text-lg mb-4">Follow Us</h3>
                            <div className="flex items-center gap-4">
                                <Link href="#" aria-label="Facebook" className="text-white/80 hover:text-white"><FacebookIcon className="h-6 w-6" /></Link>
                                <Link href="#" aria-label="YouTube" className="text-white/80 hover:text-white"><YoutubeIcon className="h-6 w-6" /></Link>
                                <Link href="#" aria-label="Instagram" className="text-white/80 hover:text-white"><InstagramIcon className="h-6 w-6" /></Link>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-lg mb-4">Customer Support</h3>
                        <div className="space-y-3">
                            <Link href="https://t.me/ihntopup" target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <TelegramIcon className="h-7 w-7 text-white" />
                                    <div>
                                        <p className="text-xs">9AM - 11PM Daily</p>
                                        <p className="font-semibold">Telegram Support</p>
                                    </div>
                                </div>
                            </Link>
                            <Link href="#" target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                                <div className="flex items-center gap-3">
                                     <TelegramIcon className="h-7 w-7 text-white" />
                                    <div>
                                        <p className="text-xs">Telegram Group</p>
                                        <p className="font-semibold">Join Now</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-4">Information</h3>
                         <ul className="space-y-2">
                            <li><Link href="#" className="text-white/80 hover:text-white">Terms & Conditions</Link></li>
                            <li><Link href="#" className="text-white/80 hover:text-white">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-white/80 hover:text-white">Refund Policy</Link></li>
                        </ul>
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
                </div>
                <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm text-white/80">
                    <p>&copy; {new Date().getFullYear()} IHN TOPUP. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
