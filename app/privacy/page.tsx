import { LegalPage } from "@/components/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="10 July 2026">
      <p>
        Health Bridge Solution (&ldquo;mysovera&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) provides plain-language
        summaries of lab/pathology reports. This policy explains what personal data we collect, why, and
        your rights under Malaysia&rsquo;s Personal Data Protection Act 2010 and its 2024 amendment
        (&ldquo;PDPA&rdquo;). It applies to anyone who submits a report through our site or is contacted by
        our team about one.
      </p>

      <h2>1. What we collect</h2>
      <p>When you submit a report, we collect:</p>
      <ul>
        <li>Contact details: name, email, age, gender (optional).</li>
        <li>
          Health information you tell us: your health concern, symptoms/notes, and the lab report file(s)
          you upload (PDFs or photos) — this is <strong>sensitive personal data</strong> under the PDPA,
          since it concerns your physical or mental health.
        </li>
        <li>Values extracted from your report (e.g. cholesterol, HbA1c, blood counts) and the resulting analysis.</li>
        <li>Feedback you give us after delivery (rating, comments).</li>
        <li>Basic records of your submission&rsquo;s status and, once payment is enabled, your payment status (we do not store your card or bank details ourselves — that is handled directly by our payment processor).</li>
      </ul>

      <h2>2. Why we process it</h2>
      <p>
        We use your data to analyze your uploaded report, produce a plain-language summary and lifestyle
        recommendations, deliver that summary to you by email, respond to your questions, and improve our
        service. We do not use your health data for advertising, and we do not sell it.
      </p>

      <h2>3. How the analysis works — and who sees your data</h2>
      <p>
        To read scanned or photographed reports, we send your uploaded file(s) to Anthropic (the maker of
        Claude), a third-party AI provider, to extract lab values automatically. Every AI-assisted summary
        is reviewed by a member of our team before it is finalized or sent to you — it is never sent to a
        customer without human review. We also use the following processors to run the service:
      </p>
      <ul>
        <li><strong>Supabase</strong> — database and file storage.</li>
        <li><strong>Vercel</strong> — application hosting.</li>
        <li><strong>Anthropic</strong> — automated extraction of lab values from uploaded files.</li>
        <li><strong>Resend</strong> — delivery of emails (your report link, updates).</li>
      </ul>
      <p>
        We do not share your data with anyone else, except where required by law or to protect someone&rsquo;s
        safety.
      </p>

      <h2>4. Retention</h2>
      <p>
        We keep your submission and report data for as long as your account/records are active plus a
        reasonable period afterward for support and legal record-keeping, after which it is deleted or
        anonymized. You can ask us to delete your data earlier — see Section 6.
      </p>

      <h2>5. Security</h2>
      <p>
        Access to customer data is restricted to authorized staff members through individual login
        accounts; direct database access is locked down so it cannot be reached without going through our
        application. Files are stored with unguessable addresses. No system is completely risk-free, and we
        continually work to improve these protections.
      </p>
      <p>
        If a data breach occurs that is likely to cause significant harm, or affects a significant number of
        people, we will notify Malaysia&rsquo;s Personal Data Protection Commissioner and, where required,
        affected individuals, within the timeframes set by the PDPA and its guidelines.
      </p>

      <h2>6. Your rights</h2>
      <p>Under the PDPA, you may:</p>
      <ul>
        <li>Ask what personal data we hold about you and request a copy.</li>
        <li>Ask us to correct inaccurate data.</li>
        <li>Withdraw consent to further processing, or ask us to delete your data (this may limit our ability to deliver or support your report).</li>
        <li>Ask us to stop processing your data for a particular purpose.</li>
      </ul>
      <p>
        To exercise any of these, email us at{" "}
        <a href="mailto:mysovera@gmail.com">mysovera@gmail.com</a>. We will respond within 21 days as
        required by the PDPA.
      </p>

      <h2>7. Not a medical record</h2>
      <p>
        Our reports are educational summaries, not a medical diagnosis, and are not a substitute for your
        own doctor&rsquo;s records. Please keep a copy of your original lab report and share it with your
        healthcare provider directly.
      </p>

      <h2>8. Changes to this policy</h2>
      <p>
        We may update this policy as our service or the law changes. Material changes will be reflected
        here with an updated date above.
      </p>

      <h2>9. Contact</h2>
      <p>
        Health Bridge Solution — <a href="mailto:mysovera@gmail.com">mysovera@gmail.com</a>
      </p>

      <p className="text-xs text-neutral-400 mt-8">
        This policy is provided for transparency and is not a substitute for independent legal advice.
      </p>
    </LegalPage>
  );
}
