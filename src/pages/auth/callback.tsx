import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const supabase = createClient();
    const codeParam = router.query.code;
    const nextParam = router.query.next;
    const code = Array.isArray(codeParam) ? codeParam[0] : codeParam;
    const nextPath = Array.isArray(nextParam) ? nextParam[0] : nextParam;

    const resolveCallback = async () => {
      if (!code) {
        setError("The sign-in link is invalid or has expired.");
        return;
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        setError("We couldn't complete sign-in. Please try again.");
        return;
      }

      const { data: userResponse } = await supabase.auth.getUser();
      const user = userResponse.user;

      if (!user) {
        router.replace(nextPath ?? "/dashboard");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const redirectTo =
        nextPath ??
        (profile?.role === "admin"
          ? "/admin"
          : profile?.role === "trainer"
            ? "/trainer/dashboard"
            : "/dashboard");

      router.replace(redirectTo);
    };

    resolveCallback();
  }, [router, router.isReady, router.query.code, router.query.next]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-5">
      <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-8 text-center">
        {error ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <h1 className="text-xl font-black text-white mb-2">Sign-in failed</h1>
            <p className="text-zinc-400 text-sm leading-relaxed mb-5">{error}</p>
            <Link href="/login" className="text-sm text-orange-400 hover:text-orange-300 font-semibold">
              Return to sign in
            </Link>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-5">
              <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
            </div>
            <h1 className="text-xl font-black text-white mb-2">Completing sign-in</h1>
            <p className="text-zinc-400 text-sm leading-relaxed">We&apos;re finishing your authentication and sending you to the right dashboard.</p>
          </>
        )}
      </div>
    </div>
  );
}
