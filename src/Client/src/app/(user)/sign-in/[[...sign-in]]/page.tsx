import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignInPage({
    searchParams,
}: {
    searchParams?: { redirect_url?: string };
}) {
    const { userId } = await auth();

    let redirectUrl = "/";

    if (searchParams?.redirect_url) {
        const raw = searchParams.redirect_url;
        try {
            if (raw.startsWith("http://") || raw.startsWith("https://")) {
                const parsed = new URL(raw);
                redirectUrl = parsed.pathname + parsed.search;
            } else if (raw.startsWith("/")) {
                redirectUrl = raw;
            }
        } catch {
            redirectUrl = "/";
        }
    }

    // If already authenticated on server, redirect immediately to target URL
    if (userId) {
        redirect(redirectUrl);
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4">
            <SignIn
                routing="path"
                path="/sign-in"
                fallbackRedirectUrl={redirectUrl}
                forceRedirectUrl={redirectUrl}
            />
        </div>
    );
}
