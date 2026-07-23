export default function RefundCancellationPolicyPage() {
  const lastUpdated = "23 July 2026";

  return (
    <div className="min-h-screen bg-bg px-4 py-10 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-text mb-2">
          Refund and Cancellation Policy
        </h1>
        <p className="text-sm text-text-muted mb-8">Last updated: {lastUpdated}</p>

        <div className="flex flex-col gap-8 text-sm text-text-secondary leading-relaxed">
          <section>
            <p>
              This Refund and Cancellation Policy applies to seller
              subscription plans purchased on the Cloth Market platform
              ("Platform"), operated by Cloth Market. Cloth Market is
              currently in the process of formal business registration in
              India. Please read this policy carefully before subscribing.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              1. Scope of This Policy
            </h2>
            <p>
              Cloth Market currently does not process orders or payments for
              products between customers and sellers. This policy applies
              only to subscription fees paid by sellers to access seller
              tools and features on the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              2. No Refunds
            </h2>
            <p>
              Subscription fees are non-refundable once a billing cycle has
              started. This includes, without limitation:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 mt-2">
              <li>Partial months or unused portions of a billing cycle</li>
              <li>Subscriptions cancelled partway through a billing cycle</li>
              <li>Change of mind after a subscription has been purchased</li>
              <li>Non-usage of the Platform or its features during an active subscription</li>
            </ul>
            <p className="mt-2">
              By subscribing to a paid plan, you acknowledge and agree that
              no refund, in part or in full, will be issued once payment has
              been successfully processed.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              3. Cancellation
            </h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>You may cancel your subscription at any time from your seller dashboard</li>
              <li>Upon cancellation, you will continue to have access to seller features until the end of your current billing cycle</li>
              <li>Your subscription will not renew or be billed again after cancellation</li>
              <li>No partial refund will be issued for the remaining days of the current billing cycle after cancellation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              4. Failed or Duplicate Payments
            </h2>
            <p>
              If you believe you have been charged in error, such as a
              duplicate payment due to a technical issue, please contact us
              immediately at the email below with your payment reference. We
              will investigate and, where a genuine duplicate or erroneous
              charge is confirmed, process an appropriate correction.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              5. Platform Downtime
            </h2>
            <p>
              We work to keep the Platform available and reliable at all
              times. However, occasional downtime, maintenance, or technical
              issues do not, on their own, entitle a subscriber to a refund
              or credit.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              6. Changes to This Policy
            </h2>
            <p>
              We may update this Refund and Cancellation Policy from time to
              time, including as we introduce new features such as customer
              order payments in the future. Changes will be posted on this
              page with a revised "Last updated" date. Continued use of the
              Platform after changes are posted constitutes acceptance of the
              revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text mb-2">
              7. Contact Us
            </h2>
            <p>
              If you have questions about this policy or a payment issue,
              please contact us at{" "}
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