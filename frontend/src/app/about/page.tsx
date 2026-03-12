import { LandingHeader } from '@/components/layout/LandingHeader';
import { LandingFooter } from '@/components/layout/LandingFooter';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LandingHeader />
      <main className="container mx-auto px-4 lg:px-8 py-16">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
          <p className="text-lg text-gray-600">
            About page is ready for content integration (brand story, mission, and service
            commitments).
          </p>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}