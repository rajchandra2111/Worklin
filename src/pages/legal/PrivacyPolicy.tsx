import { Link } from 'react-router-dom';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors mb-8 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="font-tenor text-4xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-text-secondary mb-10">Last Updated: June 2026</p>
        
        <div className="prose prose-slate max-w-none text-text-secondary space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create or modify your account, 
              update your profile, request on-demand services, contact customer support, or otherwise communicate with us. 
              This information may include: name, email, phone number, postal address, profile picture, payment method, 
              and other information you choose to provide.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">2. How We Use Your Information</h2>
            <p>
              We use the information we collect about you to provide, maintain, and improve our services. We also use 
              the information to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Process payments and send related information, including confirmations and invoices.</li>
              <li>Send you technical notices, updates, security alerts, and support messages.</li>
              <li>Respond to your comments, questions, and requests.</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">3. Sharing of Information</h2>
            <p>
              We may share information about you as follows:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>With other users (e.g., sharing your public profile with clients or freelancers).</li>
              <li>With vendors, consultants, and other service providers (e.g., Stripe for payments) who need access to such information.</li>
              <li>In response to a request for information if we believe disclosure is in accordance with applicable law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">4. Security</h2>
            <p>
              We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized 
              access, disclosure, alteration, and destruction.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
