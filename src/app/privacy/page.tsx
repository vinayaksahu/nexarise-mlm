import { PublicNav } from '@/components/layout/public-nav';
import { PublicFooter } from '@/components/layout/public-footer';

export const metadata = {
  title: 'Privacy Policy | NexaRise',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />

      <main className="flex-grow py-16">
        <div className="container mx-auto px-4 max-w-4xl prose prose-slate dark:prose-invert">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last Updated: August 2026</p>

          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
              <p className="text-muted-foreground">
                We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include your name, email address, password, and wallet addresses.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">2. How We Use Information</h2>
              <p className="text-muted-foreground">
                We use the information we collect to provide, maintain, and improve our services, to process transactions, to send you related information, and to monitor and analyze trends and usage.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">3. Information Sharing</h2>
              <p className="text-muted-foreground">
                Your public profile details and certain network activity may be visible to your sponsor and downline. We do not sell your personal information to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">4. Security</h2>
              <p className="text-muted-foreground">
                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. Passwords are cryptographically hashed using bcrypt.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-3">5. Cookies</h2>
              <p className="text-muted-foreground">
                We use secure, HTTP-only cookies to maintain your session state. You can control cookies through your browser settings, though disabling them may affect platform functionality.
              </p>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
