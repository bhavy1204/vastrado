export default function TermsAndConditionsPage() {
  const lastUpdated = "23 July 2026";

  return (
    <div className="min-h-screen bg-bg px-4 py-10 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-text mb-2">Terms and Conditions</h1>
        <p className="text-sm text-text-muted mb-8">Last updated: {lastUpdated}</p>

        <div className="flex flex-col gap-8 text-sm text-text-secondary leading-relaxed">
          <section>
            <p>
              These Terms and Conditions ("Terms") govern your access to and
              use of the Cloth Market website and platform ("Platform"),
              operated by Cloth Market ("we", "us", "our"). Cloth Market is
              currently in the process of formal business registration in
              India. By accessing or using the Platform, you agree to be
              bound by these Terms. If you do not agree, please do not use
              the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              1. What Cloth Market Does
            </h2>
            <p>
              Cloth Market is a platform that helps customers discover local
              clothing shops and enquire directly with sellers (including via
              WhatsApp). We also provide subscription-based tools that allow
              sellers to create, manage, and showcase their shop and products
              on the Platform.
            </p>
            <p className="mt-2">
              Cloth Market does not currently process orders or payments
              between customers and sellers. Any transaction, negotiation, or
              agreement for the purchase of products happens directly between
              the customer and the seller, outside the Platform. We are not a
              party to, and hold no responsibility for, such transactions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              2. Accounts
            </h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>You must provide accurate and complete information when creating an account, whether as a user, seller, or staff member</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms or provide false information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              3. Seller Subscriptions
            </h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Sellers may subscribe to a paid plan to list and manage their shop on the Platform</li>
              <li>Subscription fees are billed in advance on a recurring basis as per the plan selected at the time of purchase</li>
              <li>Payments are processed securely through Razorpay; Cloth Market does not store your payment card, UPI, or bank details</li>
              <li>Subscriptions are non-refundable once a billing cycle has started, as further described in our Refund and Cancellation Policy</li>
              <li>Sellers may cancel their subscription at any time; access continues until the end of the current billing cycle</li>
              <li>We reserve the right to change subscription pricing with reasonable prior notice to active sellers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              4. Seller Responsibilities
            </h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Sellers are solely responsible for the accuracy of their shop information, product listings, pricing, and images</li>
              <li>Sellers must comply with all applicable laws relating to the sale of goods, including consumer protection and taxation laws</li>
              <li>Sellers must not list counterfeit, prohibited, or illegal products</li>
              <li>Cloth Market reserves the right to remove any listing or shop that violates these Terms, without prior notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              5. Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-2">
              <li>Use the Platform for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Platform, other accounts, or systems</li>
              <li>Interfere with or disrupt the operation of the Platform</li>
              <li>Post false, misleading, defamatory, or abusive content, including in reviews</li>
              <li>Scrape, copy, or reuse Platform content or data without our prior written permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              6. Reviews and User Content
            </h2>
            <p>
              Users may submit reviews and ratings for sellers and products.
              You agree that any content you submit is honest, based on
              genuine experience, and does not violate any third party's
              rights. We reserve the right to remove any content that
              violates these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              7. Intellectual Property
            </h2>
            <p>
              The Platform, including its design, logo, and underlying
              software, is owned by Cloth Market and protected by applicable
              intellectual property laws. Sellers retain ownership of the
              content (images, descriptions) they upload, but grant Cloth
              Market a license to display that content on the Platform for
              the purpose of operating the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              8. Third-Party Services
            </h2>
            <p>
              The Platform uses third-party services, including Razorpay for
              payment processing and Google for sign-in authentication. Your
              use of these services is also subject to their respective terms
              and privacy policies. We are not responsible for the
              performance or availability of third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              9. Limitation of Liability
            </h2>
            <p>
              The Platform is provided on an "as is" and "as available"
              basis. Cloth Market does not guarantee that the Platform will
              be uninterrupted, error-free, or secure. To the fullest extent
              permitted by law, Cloth Market shall not be liable for any
              indirect, incidental, or consequential damages arising from
              your use of the Platform, including any dealings or
              transactions between customers and sellers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              10. Termination
            </h2>
            <p>
              We may suspend or terminate your access to the Platform at any
              time, with or without notice, if we believe you have violated
              these Terms. You may stop using the Platform, or request
              account deletion, at any time.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              11. Changes to These Terms
            </h2>
            <p>
              We may update these Terms from time to time. Changes will be
              posted on this page with a revised "Last updated" date.
              Continued use of the Platform after changes are posted
              constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              12. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of India. Any disputes
              arising from these Terms or use of the Platform shall be
              subject to the exclusive jurisdiction of the courts of
              Rajasthan, India.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              13. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms, please contact us
              at{" "}
              <a
                href="mailto:support@clothmarkets.in"
                className="text-primary hover:underline"
              >
                support@clothmarkets.in
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
