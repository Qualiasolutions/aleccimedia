"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { SubmitButton } from "@/components/submit-button";
import { toast } from "@/components/toast";
import { type RegisterActionState, register } from "../actions";

const registerHighlights = [
  {
    title: "AI Council Onboarding",
    description:
      "Spin up the executive duo with personalized brand, GTM, and revenue context in minutes.",
  },
  {
    title: "Collaboration Ready",
    description:
      "Share transcripts, artifacts, and playbooks with stakeholders immediately after each session.",
  },
  {
    title: "Secure From Day One",
    description:
      "Role-based controls, audit trails, and enterprise-grade safeguards are included automatically.",
  },
];

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: "idle",
    }
  );

  const { update: updateSession } = useSession();

  useEffect(() => {
    if (state.status === "user_exists") {
      toast({ type: "error", description: "Account already exists!" });
    } else if (state.status === "failed") {
      toast({ type: "error", description: "Failed to create account!" });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: "Failed validating your submission!",
      });
    } else if (state.status === "success") {
      toast({ type: "success", description: "Account created successfully!" });

      setIsSuccessful(true);
      updateSession();
      router.refresh();
    }
  }, [router, state.status, updateSession]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <AuthShell
      description="Create your Alecci Media workspace account and start shaping GTM strategy with Alexandria and Kim in real time."
      highlights={registerHighlights}
      title="Bring the Alecci executive duo into your workflows"
    >
      <div className="space-y-2 text-center">
        <h2 className="font-semibold text-2xl text-slate-900">
          Create your account
        </h2>
        <p className="text-slate-500 text-sm">
          Set your credentials to unlock the AI executive council.
        </p>
      </div>
      <AuthForm
        action={handleSubmit}
        className="px-0 sm:px-0"
        defaultEmail={email}
      >
        <SubmitButton isSuccessful={isSuccessful}>Sign up</SubmitButton>
        <p className="text-center text-slate-500 text-sm">
          {"Already have an account? "}
          <Link
            className="font-semibold text-rose-600 transition hover:text-rose-500 hover:underline"
            href="/login"
          >
            Sign in instead
          </Link>
          .
        </p>
      </AuthForm>
    </AuthShell>
  );
}
