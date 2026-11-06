import Link from "next/link";

export const Logo = () => (
  <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl text-primary tracking-tight">
    <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shadow-sm">
      ES
    </div>
    <span className="font-bold">
      EShop<span className="text-foreground">App</span>
    </span>
  </Link>
);
