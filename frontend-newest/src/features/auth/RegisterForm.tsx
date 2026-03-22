'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { ROUTES } from '@/lib/constants';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Eye, EyeOff, MapPin } from 'lucide-react';
import { useGoogleMaps } from '@/lib/GoogleMapsProvider';

interface RegisterFieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  fullAddress?: string;
  lat?: string;
  lng?: string;
  agreeTerms?: string;
}

const GEO_LOG_PREFIX = '[RegisterForm][Geo]';

type GeoLogPayload = Record<string, unknown>;

function geoLog(event: string, payload?: GeoLogPayload) {
  console.log(`${GEO_LOG_PREFIX} ${event}`, {
    at: new Date().toISOString(),
    ...(payload ?? {}),
  });
}

function geoWarn(event: string, payload?: GeoLogPayload) {
  console.warn(`${GEO_LOG_PREFIX} ${event}`, {
    at: new Date().toISOString(),
    ...(payload ?? {}),
  });
}

function getFirstFieldError(value?: string[]): string | undefined {
  return value && value.length > 0 ? value[0] : undefined;
}

function mapRegisterFieldErrors(error: ApiError): RegisterFieldErrors {
  const fieldErrors: RegisterFieldErrors = {
    name: getFirstFieldError(error.errors?.name) ?? getFirstFieldError(error.errors?.fullName),
    email: getFirstFieldError(error.errors?.email),
    password: getFirstFieldError(error.errors?.password),
    phone: getFirstFieldError(error.errors?.phone),
    fullAddress:
      getFirstFieldError(error.errors?.fullAddress) ?? getFirstFieldError(error.errors?.address),
    lat: getFirstFieldError(error.errors?.lat),
    lng: getFirstFieldError(error.errors?.lng),
  };

  const message = error.message.toLowerCase();

  if (!fieldErrors.email && message.includes('email')) {
    fieldErrors.email = error.message;
  }

  if (!fieldErrors.password && message.includes('password')) {
    fieldErrors.password = error.message;
  }

  if (!fieldErrors.name && (message.includes('name') || message.includes('full name'))) {
    fieldErrors.name = error.message;
  }

  if (!fieldErrors.fullAddress && message.includes('address')) {
    fieldErrors.fullAddress = error.message;
  }

  if ((!fieldErrors.lat || !fieldErrors.lng) && (message.includes('lat') || message.includes('lng'))) {
    fieldErrors.lat = fieldErrors.lat ?? error.message;
    fieldErrors.lng = fieldErrors.lng ?? error.message;
  }

  return fieldErrors;
}

export function RegisterForm() {
  const router = useRouter();
  const { register, user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    fullAddress: '',
    agreeTerms: false,
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});

  const mapsContext = useGoogleMaps();
  const isPlacesLoaded = mapsContext?.isLoaded ?? false;

  const getRoleRedirectPath = (role: string): string => {
    const roleRoutes: Record<string, string> = {
      CUSTOMER: ROUTES.CUSTOMER,
      STAFF: ROUTES.STAFF,
      DRIVER: ROUTES.DRIVER,
      ADMIN: ROUTES.ADMIN,
    };
    return roleRoutes[role] || ROUTES.CUSTOMER;
  };

  useEffect(() => {
    if (user && !loading) {
      const redirectPath = getRoleRedirectPath(user.role);
      router.push(redirectPath);
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!isPlacesLoaded || !inputRef.current || !window.google?.maps?.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: ['vn'] },
      fields: ['geometry', 'formatted_address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;
      const fullAddress = place.formatted_address ?? '';

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
      setError('');

      if (location) {
        const selectedCoords = {
          lat: location.lat(),
          lng: location.lng(),
        };
        setCoords(selectedCoords);
        geoLog('address_selected', {
          fullAddress,
          ...selectedCoords,
        });
      } else {
        setCoords(null);
        geoWarn('address_selected_without_geometry', { fullAddress });
      }
    });

    autocompleteRef.current = autocomplete;

    return () => {
      window.google?.maps?.event?.clearInstanceListeners(autocomplete);
      autocompleteRef.current = null;
    };
  }, [isPlacesLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    if (name === 'fullAddress') {
      setCoords(null);
      setFieldErrors((prev) => ({
        ...prev,
        lat: undefined,
        lng: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    setFieldErrors({});

    if (formData.name.trim().length < 3) {
      setFieldErrors({ name: 'Name must be at least 3 characters long' });
      setError('Name must be at least 3 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFieldErrors({ email: 'Please enter a valid email address' });
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 8) {
      setFieldErrors({ password: 'Password must be at least 8 characters long' });
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      setError('Passwords do not match');
      return false;
    }

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      setFieldErrors({ phone: 'Phone number must be 10-11 digits' });
      setError('Phone number must be 10-11 digits');
      return false;
    }

    if (formData.fullAddress.trim().length < 5) {
      setFieldErrors({ fullAddress: 'Please provide your full address' });
      setError('Please provide your full address');
      return false;
    }

    if (!coords) {
      setFieldErrors({
        lat: 'Please pick an address suggestion from the list',
        lng: 'Please pick an address suggestion from the list',
      });
      setError('Please pick an address suggestion from the list');
      return false;
    }

    if (!formData.agreeTerms) {
      setFieldErrors({ agreeTerms: 'You must agree to the Terms and Conditions' });
      setError('You must agree to the Terms and Conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    if (!coords) {
      setError('Missing coordinates. Please select address again.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
        fullAddress: formData.fullAddress.trim(),
        lat: coords.lat,
        lng: coords.lng,
      });
    } catch (err) {
      let message = 'Registration failed. Please try again.';
      if (err instanceof ApiError) {
        message = err.message;
        setFieldErrors(mapRegisterFieldErrors(err));
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
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Nguyen Van A"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          className={`h-11 ${fieldErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {fieldErrors.name && <p className="text-xs text-red-600">{fieldErrors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          placeholder="name@example.com"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className={`h-11 ${fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          placeholder="0912345678"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          className={`h-11 ${fieldErrors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {fieldErrors.phone && <p className="text-xs text-red-600">{fieldErrors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullAddress">Full Address</Label>
        <div className="relative w-full">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            ref={inputRef}
            id="fullAddress"
            name="fullAddress"
            type="text"
            placeholder="Enter full address and select suggestion"
            value={formData.fullAddress}
            onChange={handleChange}
            required
            className={`h-11 pl-10 ${fieldErrors.fullAddress || fieldErrors.lat || fieldErrors.lng ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
        </div>

        {!isPlacesLoaded && mapsContext?.hasApiKey && (
          <p className="text-xs text-amber-600">Loading address suggestions...</p>
        )}
        {mapsContext?.loadError && (
          <p className="text-xs text-amber-600">
            Google Maps failed to load. You can still type your address.
          </p>
        )}
        {!mapsContext?.hasApiKey && (
          <p className="text-xs text-amber-600">
            Missing `NEXT_PUBLIC_MAP_API_KEY` in `.env.local`, address suggestions are disabled.
          </p>
        )}

        {coords && (
          <p className="text-xs text-emerald-700">
            Lat: {coords.lat.toFixed(6)} | Lng: {coords.lng.toFixed(6)}
          </p>
        )}

        {fieldErrors.fullAddress && <p className="text-xs text-red-600">{fieldErrors.fullAddress}</p>}
        {!fieldErrors.fullAddress && (fieldErrors.lat || fieldErrors.lng) && (
          <p className="text-xs text-red-600">{fieldErrors.lat || fieldErrors.lng}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            placeholder="At least 8 characters"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required
            className={`h-11 pr-10 ${fieldErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {fieldErrors.password && <p className="text-xs text-red-600">{fieldErrors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Re-enter your password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className={`h-11 pr-10 ${fieldErrors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="text-xs text-red-600">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          id="agreeTerms"
          name="agreeTerms"
          checked={formData.agreeTerms}
          onChange={handleChange}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600"
        />
        <label htmlFor="agreeTerms" className="text-sm text-gray-600">
          I agree to the{' '}
          <a href="/terms" className="text-red-600 hover:underline">
            Terms and Conditions
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-red-600 hover:underline">
            Privacy Policy
          </a>
        </label>
      </div>
      {fieldErrors.agreeTerms && <p className="text-xs text-red-600">{fieldErrors.agreeTerms}</p>}

      {error &&
        !fieldErrors.name &&
        !fieldErrors.email &&
        !fieldErrors.password &&
        !fieldErrors.confirmPassword &&
        !fieldErrors.phone &&
        !fieldErrors.fullAddress &&
        !fieldErrors.lat &&
        !fieldErrors.lng &&
        !fieldErrors.agreeTerms && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>
        )}

      <Button
        type="submit"
        className="w-full h-11 bg-red-600 hover:bg-red-700 text-base font-semibold"
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
}
