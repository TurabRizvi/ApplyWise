"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AuthSplitLayout } from "@/components/auth-split-layout";
import { useAuth } from "@/lib/auth-context";
import { loginCandidate, loginHr } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginInput = z.infer<typeof loginSchema>;

function LoginForm({ accountType }: { accountType: "candidate" | "hr" }) {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const result = accountType === "candidate" ? await loginCandidate(values) : await loginHr(values);
      const authUser = result.data.user ?? result.data.hrUser ?? null;
      setAuth(result.data.accessToken, authUser ?? null);
      router.push(accountType === "candidate" ? "/candidate" : "/hr");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${accountType}-email`}>Email</Label>
        <Input id={`${accountType}-email`} type="email" placeholder="you@example.com" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${accountType}-password`}>Password</Label>
        <Input id={`${accountType}-password`} type="password" placeholder="••••••••" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Log in
      </Button>
    </form>
  );
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("type") === "hr" ? "hr" : "candidate";

  return (
    <AuthSplitLayout>
      <div className="mb-6 text-center lg:text-left">
        <CardTitle className="mb-1.5">Welcome back</CardTitle>
        <CardDescription>Log in to continue to ApplyWise</CardDescription>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="candidate">Candidate</TabsTrigger>
          <TabsTrigger value="hr">Recruiter</TabsTrigger>
        </TabsList>
        <TabsContent value="candidate">
          <LoginForm accountType="candidate" />
        </TabsContent>
        <TabsContent value="hr">
          <LoginForm accountType="hr" />
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

// useSearchParams() requires a Suspense boundary in the app router, or the
// page fails static generation at build time — this wrapper is what fixes that.
export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginPageContent />
    </React.Suspense>
  );
}
