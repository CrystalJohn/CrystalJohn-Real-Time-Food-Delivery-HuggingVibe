"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useGoogleMaps } from "@/lib/GoogleMapsProvider";
import { useAuth } from "./useAuth";

interface ProfileFieldErrors {
  fullName?: string;
  phone?: string;
  fullAddress?: string;
  lat?: string;
  lng?: string;
}

function getFirstFieldError(value?: string[]): string | undefined {
  return value && value.length > 0 ? value[0] : undefined;
}

function mapProfileFieldErrors(error: ApiError): ProfileFieldErrors {
  return {
    fullName: getFirstFieldError(error.errors?.fullName),
    phone: getFirstFieldError(error.errors?.phone),
    fullAddress: getFirstFieldError(error.errors?.fullAddress),
    lat: getFirstFieldError(error.errors?.lat),
    lng: getFirstFieldError(error.errors?.lng),
  };
}

export function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const mapsContext = useGoogleMaps();
  const isPlacesLoaded = mapsContext?.isLoaded ?? false;

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    fullAddress: "",
  });

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});

  useEffect(() => {
    if (!user) return;

    setFormData({
      fullName: user.name ?? "",
      phone: user.phone ?? "",
      fullAddress: user.defaultAddress?.fullAddress ?? "",
    });

    if (
      user.defaultAddress?.lat !== undefined &&
      user.defaultAddress?.lng !== undefined
    ) {
      setCoords({
        lat: user.defaultAddress.lat,
        lng: user.defaultAddress.lng,
      });
    } else {
      setCoords(null);
    }
  }, [user]);

  useEffect(() => {
    if (!isPlacesLoaded || !inputRef.current || !window.google?.maps?.places) {
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["address"],
        componentRestrictions: { country: ["vn"] },
        fields: ["geometry", "formatted_address"],
      },
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;
      const fullAddress = place.formatted_address ?? "";

      setFormData((prev) => ({
        ...prev,
        fullAddress,
      }));

      setFieldErrors((prev) => ({
        ...prev,
        fullAddress: undefined,
        lat: undefined,
        lng: undefined,
      }));

      setError("");

      if (location) {
        setCoords({
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        setCoords(null);
      }
    });

    return () => {
      window.google?.maps?.event?.clearInstanceListeners(autocomplete);
    };
  }, [isPlacesLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    if (name === "fullAddress") {
      setCoords(null);
      setFieldErrors((prev) => ({
        ...prev,
        lat: undefined,
        lng: undefined,
      }));
    }
  };

  const validateForm = () => {
    const errors: ProfileFieldErrors = {};

    if (formData.fullName.trim().length < 3) {
      errors.fullName = "Full name must be at least 3 characters long";
    }

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.trim())) {
      errors.phone = "Phone number must be 10-11 digits";
    }

    if (formData.fullAddress.trim().length < 5) {
      errors.fullAddress = "Please provide your full address";
    }

    if (!coords) {
      errors.lat = "Please pick an address suggestion from the list";
      errors.lng = "Please pick an address suggestion from the list";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError(
        errors.fullName ||
          errors.phone ||
          errors.fullAddress ||
          errors.lat ||
          "Validation failed",
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validateForm() || !coords) return;

    setLoading(true);

    try {
      await updateProfile({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim() || undefined,
        fullAddress: formData.fullAddress.trim(),
        lat: coords.lat,
        lng: coords.lng,
      });
    } catch (err) {
      let message = "Failed to update profile.";

      if (err instanceof ApiError) {
        message = err.message;
        setFieldErrors(mapProfileFieldErrors(err));
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={
            fieldErrors.fullName
              ? "border-red-500 focus-visible:ring-red-500"
              : ""
          }
        />
        {fieldErrors.fullName && (
          <p className="text-xs text-red-600">{fieldErrors.fullName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={
            fieldErrors.phone ? "border-red-500 focus-visible:ring-red-500" : ""
          }
        />
        {fieldErrors.phone && (
          <p className="text-xs text-red-600">{fieldErrors.phone}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullAddress">Default Address</Label>
        <div className="relative w-full">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            ref={inputRef}
            id="fullAddress"
            name="fullAddress"
            value={formData.fullAddress}
            onChange={handleChange}
            placeholder="Enter full address and select suggestion"
            className={`pl-10 ${
              fieldErrors.fullAddress || fieldErrors.lat || fieldErrors.lng
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
          />
        </div>

        {!isPlacesLoaded && mapsContext?.hasApiKey && (
          <p className="text-xs text-amber-600">
            Loading address suggestions...
          </p>
        )}

        {mapsContext?.loadError && (
          <p className="text-xs text-amber-600">
            Google Maps failed to load. You can still type your address.
          </p>
        )}

        {!mapsContext?.hasApiKey && (
          <p className="text-xs text-amber-600">
            Missing `NEXT_PUBLIC_MAP_API_KEY` in `.env.local`, address
            suggestions are disabled.
          </p>
        )}

        {/* {coords && (
          <p className="text-xs text-emerald-700">
            Lat: {coords.lat.toFixed(6)} | Lng: {coords.lng.toFixed(6)}
          </p>
        )} */}

        {fieldErrors.fullAddress && (
          <p className="text-xs text-red-600">{fieldErrors.fullAddress}</p>
        )}

        {!fieldErrors.fullAddress && (fieldErrors.lat || fieldErrors.lng) && (
          <p className="text-xs text-red-600">
            {fieldErrors.lat || fieldErrors.lng}
          </p>
        )}
      </div>

      {error &&
        !fieldErrors.fullName &&
        !fieldErrors.phone &&
        !fieldErrors.fullAddress &&
        !fieldErrors.lat &&
        !fieldErrors.lng && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
            {error}
          </div>
        )}

      <Button
        type="submit"
        className="h-11 bg-red-600 hover:bg-red-700"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
