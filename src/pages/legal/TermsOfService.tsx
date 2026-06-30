import { Link } from 'react-router-dom';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="font-tenor text-4xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-text-secondary mb-10">Last Updated: June 2026</p>
        
        <div className="prose prose-slate max-w-none text-text-secondary space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Worklin ("the Platform"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services. We reserve the right to update 
              or modify these terms at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">2. User Accounts</h2>
            <p>
              You must provide accurate and complete information when creating an account. You are responsible for 
              maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              Worklin operates dual account types: Client and Freelancer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">3. Payments and Subscriptions</h2>
            <p>
              Worklin uses third-party payment processors (Stripe) to handle transactions. By initiating a payment 
              or subscription, you agree to the pricing, payment terms, and billing cycles presented at the time of purchase. 
              Platform fees vary based on your subscription tier.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">4. Taxes and Legal Compliance</h2>
            <p>
              Users are solely responsible for calculating, collecting, reporting, and remitting applicable taxes (such as VAT or Sales Tax) 
              arising from transactions on the Platform. Worklin provides fields in your Settings to record your Tax ID and Billing Address 
              for invoicing purposes, but does not offer tax advice.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">5. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at our sole discretion, without notice, 
              for conduct that we believe violates these Terms of Service or is harmful to other users of the Platform.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
