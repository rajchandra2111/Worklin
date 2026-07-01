import { Settings } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function CookiePolicy() {
  const handleManageCookies = () => {
    try {
      // Try calling the CookieScript global instance if it's available
      // @ts-ignore
      if (window.CookieScript && window.CookieScript.instance) {
        // @ts-ignore
        window.CookieScript.instance.show();
      } else {
        // Fallback for adblockers or if script hasn't loaded
        alert("Your cookie preferences are currently locked by your browser or an ad blocker. Please disable it to manage preferences.");
      }
    } catch (e) {
      console.error("Could not open CookieScript modal:", e);
    }
  };

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Header */}
      <section className="pt-24 pb-12 px-6 border-b border-border bg-surface text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold tracking-widest uppercase text-text-muted mb-4">Legal</p>
          <h1 className="font-tenor text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Cookie Policy
          </h1>
          <p className="text-text-secondary">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto prose prose-lg prose-headings:font-tenor prose-headings:text-text-primary prose-p:text-text-secondary prose-li:text-text-secondary">
          
          <div className="bg-white p-6 rounded-2xl border border-border mb-12 shadow-sm text-center flex flex-col items-center justify-center">
            <Settings className="w-10 h-10 text-accent mb-4" />
            <h3 className="text-xl font-bold text-text-primary mb-2 mt-0">Manage Your Preferences</h3>
            <p className="text-sm text-text-secondary mb-6 mt-0">
              You have full control over your privacy. You can update your cookie consent preferences at any time.
            </p>
            <Button variant="primary" onClick={handleManageCookies}>
              Manage Cookie Consent
            </Button>
          </div>

          <h2>1. What are cookies?</h2>
          <p>
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
            They are widely used by website owners in order to make their websites work, or to work more efficiently, 
            as well as to provide reporting information.
          </p>
          <p>
            Cookies set by the website owner (in this case, Worklin_) are called "first-party cookies". 
            Cookies set by parties other than the website owner are called "third-party cookies". 
            Third-party cookies enable third-party features or functionality to be provided on or through the website 
            (e.g., interactive content and analytics).
          </p>

          <h2>2. Why do we use cookies?</h2>
          <p>
            We use first-party and third-party cookies for several reasons. Some cookies are required for technical 
            reasons in order for our platform to operate (like keeping you logged in), and we refer to these as 
            "essential" or "strictly necessary" cookies. 
          </p>
          <p>
            Other cookies also enable us to track and target the interests of our users to enhance the experience 
            on our platform. Third parties serve cookies through our website for analytics and other purposes.
          </p>

          <h2>3. Types of Cookies We Use</h2>
          
          <h3>Essential Cookies</h3>
          <p>
            These cookies are strictly necessary to provide you with services available through our platform and to 
            use some of its features, such as access to secure areas. Because these cookies are strictly necessary 
            to deliver the platform to you, you cannot refuse them.
          </p>
          <ul>
            <li><strong>Authentication:</strong> Keeping you securely logged into your account.</li>
            <li><strong>Security:</strong> Protecting against CSRF attacks and validating session integrity.</li>
          </ul>

          <h3>Performance and Analytics Cookies</h3>
          <p>
            These cookies collect information that is used either in aggregate form to help us understand how our 
            platform is being used or how effective our marketing campaigns are, or to help us customize our 
            platform for you.
          </p>

          <h2>4. How can I control cookies?</h2>
          <p>
            You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights 
            by setting your preferences using the "Manage Cookie Consent" button at the top of this page.
          </p>
          <p>
            You can also set or amend your web browser controls to accept or refuse cookies. If you choose to 
            reject cookies, you may still use our website though your access to some functionality and areas of 
            our website may be restricted.
          </p>

          <h2>5. Updates to this policy</h2>
          <p>
            We may update this Cookie Policy from time to time in order to reflect, for example, changes to the 
            cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this 
            Cookie Policy regularly to stay informed about our use of cookies and related technologies.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you have any questions about our use of cookies or other technologies, please contact our support team.
          </p>

        </div>
      </section>
    </div>
  );
}
