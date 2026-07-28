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
import { registerCandidate, registerHr } from "@/lib/api";

// Mirrors the backend's password policy (Day 1, authValidators.ts) exactly —
// if these ever drift apart, a user could pass the frontend check and still
// get rejected by the backend with a confusing error, so keep them in sync.
const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .max(72, "Under 72 characters")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[0-9]/, "Include a number");

const candidateSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: passwordSchema,
});
type CandidateInput = z.infer<typeof candidateSchema>;

const hrSchema = z.object({
  organizationName: z.string().trim().min(2, "Enter your organization name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: passwordSchema,
});
type HrInput = z.infer<typeof hrSchema>;

function PasswordHint() {
  return (
    <p className="text-xs text-muted-foreground">
      At least 8 characters, with an uppercase letter, lowercase letter, and a number.
    </p>
  );
}

function CandidateForm() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateInput>({ resolver: zodResolver(candidateSchema) });

  const onSubmit = async (values: CandidateInput) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const result = await registerCandidate(values);
      setAuth(result.data.accessToken, result.data.user ?? null);
      router.push("/candidate");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="c-fullName">Full name</Label>
        <Input id="c-fullName" placeholder="Jane Doe" {...register("fullName")} />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-email">Email</Label>
        <Input id="c-email" type="email" placeholder="you@example.com" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-password">Password</Label>
        <Input id="c-password" type="password" placeholder="••••••••" {...register("password")} />
        {errors.password ? (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        ) : (
          <PasswordHint />
        )}
      </div>

      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Create account
      </Button>
    </form>
  );
}

function HrForm() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HrInput>({ resolver: zodResolver(hrSchema) });

  const onSubmit = async (values: HrInput) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const result = await registerHr(values);
      setAuth(result.data.accessToken, result.data.hrUser ?? null);
      router.push("/hr");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hr-orgName">Organization name</Label>
        <Input id="hr-orgName" placeholder="TechNova Solutions" {...register("organizationName")} />
        {errors.organizationName && (
          <p className="text-xs text-destructive">{errors.organizationName.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="hr-email">Work email</Label>
        <Input id="hr-email" type="email" placeholder="you@company.com" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="hr-password">Password</Label>
        <Input id="hr-password" type="password" placeholder="••••••••" {...register("password")} />
        {errors.password ? (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        ) : (
          <PasswordHint />
        )}
      </div>

      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Create organization account
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        You&apos;ll be the admin for your organization&apos;s account.
      </p>
    </form>
  );
}

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("type") === "hr" ? "hr" : "candidate";

  return (
    <AuthSplitLayout>
      <div className="mb-6 text-center lg:text-left">
        <CardTitle className="mb-1.5">Create your account</CardTitle>
        <CardDescription>Start building smarter resumes, or start screening candidates</CardDescription>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="candidate">Candidate</TabsTrigger>
          <TabsTrigger value="hr">Recruiter</TabsTrigger>
        </TabsList>
        <TabsContent value="candidate">
          <CandidateForm />
        </TabsContent>
        <TabsContent value="hr">
          <HrForm />
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={null}>
      <RegisterPageContent />
    </React.Suspense>
  );
}
