export default function PrivacyPolicyPage() {
  const lastUpdated = "23 July 2026";

  return (
    <div className="min-h-screen bg-bg px-4 py-10 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-text mb-2">Privacy Policy</h1>
        <p className="text-sm text-text-muted mb-8">
          Last updated: {lastUpdated}
        </p>

        <div className="flex flex-col gap-8 text-sm text-text-secondary leading-relaxed">
          <section>
            <p>
              Cloth Market ("we", "us", "our", "Cloth Market") operates the
              website and platform that connects local clothing sellers with
              customers, and provides subscription-based tools for sellers to
              manage and showcase their shops ("Platform"). Cloth Market is
              currently in the process of formal business registration in India.
              This Privacy Policy explains how we collect, use, store, and
              protect information when you use our Platform.
            </p>
            <p className="mt-3">
              By using the Platform, you agree to the collection and use of
              information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              1. Information We Collect
            </h2>

            <h3 className="text-sm font-semibold text-text mt-3 mb-1">
              a. Information you provide directly
            </h3>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Name, email address, and phone number</li>
              <li>
                Shop details for sellers (shop name, description, avatar,
                banner, location)
              </li>
              <li>
                Login credentials, or Google account information if you sign in
                with Google
              </li>
              <li>
                City/location you select to browse or list your shop under
              </li>
              <li>Reviews and ratings you submit for products or sellers</li>
              <li>Wishlist items you save</li>
            </ul>

            <h3 className="text-sm font-semibold text-text mt-3 mb-1">
              b. Information collected automatically
            </h3>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>
                Approximate location (if you allow location access, e.g. for
                "shops near me")
              </li>
              <li>Device and browser information, IP address</li>
              <li>
                Usage data such as pages visited and actions taken on the
                Platform
              </li>
            </ul>

            <h3 className="text-sm font-semibold text-text mt-3 mb-1">
              c. Information from third parties
            </h3>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>
                Basic profile information (name, email) if you sign in using
                Google OAuth
              </li>
              <li>
                Payment and subscription status from our payment processor,
                Razorpay (we do not store your card, UPI, or bank details
                ourselves)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>
                To create and manage your account (as a user, seller, or staff
                member)
              </li>
              <li>
                To operate seller subscriptions, including processing payments
                and renewals
              </li>
              <li>
                To show relevant shops and products based on your selected city
                or location
              </li>
              <li>
                To enable communication between customers and sellers (e.g. via
                WhatsApp links provided by sellers)
              </li>
              <li>
                To send you important account, billing, or service-related
                notifications
              </li>
              <li>To maintain the security and integrity of the Platform</li>
              <li>To improve and develop new features on the Platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              3. How We Share Your Information
            </h2>
            <p>
              We do not sell your personal information. We share information
              only in the following circumstances:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-2">
              <li>
                <span className="font-medium text-text">
                  Payment processing:
                </span>{" "}
                Subscription payments are processed by Razorpay. Your payment
                details are handled directly by Razorpay under their own privacy
                and security policies; we do not store your full payment
                information.
              </li>
              <li>
                <span className="font-medium text-text">Google Sign-In:</span>{" "}
                If you log in with Google, basic profile details are shared with
                us by Google as part of the authentication process.
              </li>
              <li>
                <span className="font-medium text-text">
                  Public shop/product listings:
                </span>{" "}
                Information sellers choose to display (shop name, products,
                contact links) is visible to visitors browsing the Platform.
              </li>
              <li>
                <span className="font-medium text-text">
                  Legal requirements:
                </span>{" "}
                We may disclose information if required by law, regulation, or
                valid legal process.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              4. Data Storage and Security
            </h2>
            <p>
              We take reasonable technical and organizational measures to
              protect your information, including encrypted connections (HTTPS)
              and secure authentication practices. However, no method of
              transmission or storage over the internet is completely secure,
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              5. Your Rights and Choices
            </h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>
                You may access, update, or correct your account information at
                any time
              </li>
              <li>
                You may request deletion of your account and associated personal
                data, subject to any legal or accounting retention requirements
              </li>
              <li>
                You may withdraw location permissions at any time through your
                browser or device settings
              </li>
              <li>
                Sellers may cancel their subscription at any time; see our
                Refund &amp; Cancellation Policy for details
              </li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, please contact us using the
              details in Section 8 below.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              6. Cookies
            </h2>
            <p>
              We use essential cookies and similar technologies (such as browser
              storage) to keep you logged in and remember your preferences, such
              as your selected city. We do not currently use third-party
              advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              7. Children's Privacy
            </h2>
            <p>
              The Platform is not intended for individuals under the age of 18.
              We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will
              be posted on this page with a revised "Last updated" date.
              Continued use of the Platform after changes are posted constitutes
              acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              9. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy or how your
              data is handled, please contact us actions {" "}
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
