"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleMapsProvider } from "@/lib/GoogleMapsProvider";
import { ProfileForm } from "@/features/auth/ProfileForm";
import { useAuth } from "@/features/auth";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-gray-600">
            Update your personal information and default delivery address.
          </p>
        </div>

        <GoogleMapsProvider>
          <ProfileForm />
        </GoogleMapsProvider>
      </div>
    </div>
  );
}
