import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk middleware initializes authentication state for all matched routes
// Route protection is handled in layouts and pages per Clerk best practices
export default clerkMiddleware((auth, req) => {
    const authObj = auth();
    console.log(
        ">> [Middleware]",
        req.nextUrl.pathname,
        "userId:",
        authObj?.userId,
    );
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
