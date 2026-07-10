import { LegalPage } from "@/components/legal-page";

export default function RefundPage() {
  return (
    <LegalPage title="Refund Policy" lastUpdated="10 July 2026">
      <p>
        We want you to feel confident paying for a report. Here&rsquo;s exactly when a refund applies.
      </p>

      <h2>Full refund</h2>
      <ul>
        <li>You cancel before our team has started reviewing your submission.</li>
        <li>We are unable to produce a report at all (e.g. the uploaded file is unreadable and you don&rsquo;t wish to resubmit).</li>
        <li>You were charged in error, or charged more than once for the same submission.</li>
      </ul>

      <h2>No refund</h2>
      <ul>
        <li>
          Your completed, reviewed report has already been delivered to you. At that point our team&rsquo;s
          work is done, so we treat the service as fulfilled — this mirrors how the analysis and review time
          already went into your specific report.
        </li>
        <li>You simply disagree with the lifestyle suggestions given (these are general, educational suggestions, not a personalized medical treatment plan).</li>
      </ul>

      <h2>Something looks wrong in your report</h2>
      <p>
        If you believe a value was misread or the report doesn&rsquo;t match your original lab results,
        contact us before requesting a refund — we will correct and reissue it at no extra charge. This is
        the fastest way to get an accurate report and is always tried first, ahead of a refund.
      </p>

      <h2>How to request a refund</h2>
      <p>
        Email <a href="mailto:mysovera@gmail.com">mysovera@gmail.com</a> with your reference code and the
        reason for your request. We aim to respond within 3 business days, and approved refunds are returned
        to your original payment method within 7–14 business days depending on your bank/e-wallet provider.
      </p>

      <p className="text-xs text-neutral-400 mt-8">
        This policy is provided for transparency and is not a substitute for independent legal advice.
      </p>
    </LegalPage>
  );
}
