import { SignUp } from "@clerk/nextjs";

export default function SignUpPage({
  searchParams,
}: {
  searchParams?: { redirect_url?: string };
}) {
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

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4">
      <SignUp
        routing="path"
        path="/sign-up"
        fallbackRedirectUrl={redirectUrl}
      />
    </div>
  );
}

