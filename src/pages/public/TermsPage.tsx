export function TermsPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground">
            Last updated: December 2024
          </p>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto prose prose-gray dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing and using UniPilot's services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground mb-4">
              UniPilot provides a platform designed to assist international students with their visa application process. Our services include but are not limited to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Personalized document checklists based on visa type and destination</li>
              <li>Application progress tracking</li>
              <li>Deadline reminders and notifications</li>
              <li>General guidance and resources for visa applications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
            <p className="text-muted-foreground mb-4">
              As a user of UniPilot, you agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate and complete information when creating your account</li>
              <li>Keep your account credentials secure and confidential</li>
              <li>Use the service only for lawful purposes</li>
              <li>Not attempt to circumvent any security features of the platform</li>
              <li>Verify all information independently before submitting official visa applications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground mb-4">
              UniPilot provides information and guidance to assist with visa applications, but we do not guarantee visa approval. The service is provided "as is" without any warranties, express or implied. Users acknowledge that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Visa requirements may change without notice</li>
              <li>Final visa decisions are made solely by immigration authorities</li>
              <li>UniPilot is not a legal or immigration consulting service</li>
              <li>Users should consult with qualified professionals for legal advice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              To the fullest extent permitted by law, UniPilot shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses resulting from:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Your use or inability to use the service</li>
              <li>Any visa application denial or delay</li>
              <li>Errors or inaccuracies in the content provided</li>
              <li>Unauthorized access to your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Subscription and Payments</h2>
            <p className="text-muted-foreground mb-4">
              Certain features of UniPilot require a paid subscription. By subscribing to a premium plan, you agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Pay all applicable fees as described at the time of purchase</li>
              <li>Provide valid payment information</li>
              <li>Accept automatic renewal unless cancelled before the renewal date</li>
              <li>Understand that refunds are subject to our refund policy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              All content, features, and functionality of UniPilot, including but not limited to text, graphics, logos, and software, are the exclusive property of UniPilot and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
            <p className="text-muted-foreground mb-4">
              UniPilot reserves the right to modify these terms at any time. We will notify users of significant changes via email or through the platform. Continued use of the service after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about these Terms & Conditions, please contact us at:
            </p>
            <p className="text-muted-foreground">
              Email: legal@unipilot.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
