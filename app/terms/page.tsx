import { LegalPage } from "@/components/legal-page";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="10 July 2026">
      <p>
        These terms govern your use of the Health Bridge Solution (&ldquo;mysovera&rdquo;) report service.
        By submitting a report through our site, you agree to them.
      </p>

      <h2>1. What we provide</h2>
      <p>
        You upload a lab/pathology report (or photos of one). Our team, assisted by automated tools, reads
        the values in it and prepares a plain-language summary with general lifestyle suggestions (nutrition,
        exercise, mindfulness, sleep). Every summary is reviewed by a person on our team before it is sent
        to you.
      </p>

      <h2>2. This is not medical advice</h2>
      <p>
        <strong>
          Our reports are an educational summary only. They are not a medical diagnosis, are not a
          substitute for professional medical advice, and must not be used to start, stop, or change any
          treatment.
        </strong>{" "}
        Always discuss your results with a qualified doctor, especially before acting on anything in the
        report. If you have symptoms that feel serious or an emergency (chest pain, difficulty breathing,
        sudden weakness, fainting), seek emergency care immediately rather than waiting for our report.
      </p>

      <h2>3. Your responsibilities</h2>
      <ul>
        <li>Provide accurate contact details and an accurate description of your concern.</li>
        <li>Only upload your own report, or a report you have the right/consent to share with us.</li>
        <li>Use the report for your personal reference — it is not intended for resale or redistribution.</li>
      </ul>

      <h2>4. Turnaround and accuracy</h2>
      <p>
        We aim to review and deliver reports within 24–48 hours, but this is not a guaranteed deadline.
        Automated extraction from scanned or photographed reports can occasionally misread a value,
        especially on low-quality images; our human review step is designed to catch this, but you should
        always cross-check the report against your original lab results and flag anything that looks wrong
        to us.
      </p>

      <h2>5. Payment and fees</h2>
      <p>
        Where a fee applies, it will be shown to you before you pay, and is due before we deliver your
        completed report unless we agree otherwise in writing. See our{" "}
        <a href="/refund">Refund Policy</a> for cancellations and refunds.
      </p>

      <h2>6. Intellectual property</h2>
      <p>
        The report we prepare for you is for your personal use. Our branding, templates, and the underlying
        analysis methodology remain the property of Health Bridge Solution.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by Malaysian law, Health Bridge Solution is not liable for any
        decision made, or harm suffered, based on the report, since it is an educational summary and not
        medical advice. Nothing in these terms limits any liability that cannot lawfully be limited.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update these terms from time to time; continued use of the service after an update means you
        accept the revised terms.
      </p>

      <h2>9. Governing law</h2>
      <p>These terms are governed by the laws of Malaysia.</p>

      <h2>10. Contact</h2>
      <p>
        Health Bridge Solution — <a href="mailto:mysovera@gmail.com">mysovera@gmail.com</a>
      </p>

      <p className="text-xs text-neutral-400 mt-8">
        These terms are provided for transparency and are not a substitute for independent legal advice.
      </p>
    </LegalPage>
  );
}
