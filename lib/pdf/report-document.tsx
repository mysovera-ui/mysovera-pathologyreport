import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { StructuredReport, RiskLevel } from "@/lib/ai/rules";

const BLUE = "#4472C4";
const RISK_COLOR: Record<RiskLevel, string> = {
  high: "#DC2626",
  moderate: "#D97706",
  low: "#16A34A",
  none: "#9CA3AF",
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1F2937" },
  coverPage: { padding: 0, fontFamily: "Helvetica" },
  coverBlock: {
    position: "absolute",
    top: 40,
    right: 0,
    width: 90,
    height: 110,
    backgroundColor: BLUE,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
  },
  coverYear: { color: "white", fontSize: 12 },
  coverBrand: { position: "absolute", top: 40, left: 40, fontSize: 14, fontWeight: 700, color: "#111827" },
  coverTitle: { position: "absolute", left: 40, top: 470, fontSize: 28, fontWeight: 700, color: BLUE, width: 420 },
  coverTitleBM: { position: "absolute", left: 40, top: 545, fontSize: 13, color: "#374151", width: 420 },
  coverSubtitle: { position: "absolute", left: 40, top: 575, fontSize: 11, color: "#374151" },
  coverFooter: { position: "absolute", left: 40, bottom: 30, fontSize: 10, color: "#9CA3AF" },
  h1: { fontSize: 16, fontWeight: 700, marginBottom: 2, color: "#111827" },
  h1BM: { fontSize: 10, fontStyle: "italic", marginBottom: 8, color: "#6B7280" },
  h2: { fontSize: 12, fontWeight: 700, marginTop: 14, marginBottom: 1, color: "#111827" },
  h2BM: { fontSize: 9, fontStyle: "italic", marginBottom: 6, color: "#6B7280" },
  row: { flexDirection: "row" },
  label: { width: 110, color: "#6B7280" },
  value: { flex: 1, color: "#111827" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    paddingVertical: 4,
    paddingHorizontal: 4,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },
  colArea: { width: "34%" },
  colStatus: { width: "44%" },
  colRisk: { width: "22%" },
  colParam: { width: "24%" },
  colVal: { width: "14%" },
  colRange: { width: "20%" },
  colComment: { width: "42%" },
  bmText: { fontSize: 8.5, fontStyle: "italic", color: "#6B7280", marginTop: 1 },
  bullet: { marginBottom: 4 },
  bulletRow: { flexDirection: "row" },
  bulletDot: { width: 10 },
  bulletText: { flex: 1 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#9CA3AF" },
  disclaimer: {
    marginTop: 14,
    padding: 10,
    backgroundColor: "#FEF3C7",
    fontSize: 9,
    color: "#92400E",
    borderRadius: 4,
  },
});

function RiskDot({ risk }: { risk: RiskLevel }) {
  return <Text style={{ color: RISK_COLOR[risk], fontWeight: 700 }}>{risk === "none" ? "—" : risk.toUpperCase()}</Text>;
}

export function ReportDocument({
  report,
  customerName,
  age,
  gender,
  referenceCode,
  submittedAt,
  reviewStatus,
}: {
  report: StructuredReport;
  customerName: string;
  age?: number | null;
  gender?: string | null;
  referenceCode: string;
  submittedAt: string;
  reviewStatus: string;
}) {
  const printedDate = new Date().toLocaleDateString("en-GB");
  const sampleDate = new Date(submittedAt).toLocaleDateString("en-GB");
  const rec = report.recommendations;

  return (
    <Document>
      {/* Cover page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverBrand}>mysovera</Text>
        <View style={styles.coverBlock}>
          <Text style={styles.coverYear}>{new Date().getFullYear()}</Text>
        </View>
        <Text style={styles.coverTitle}>MY PERSONAL HEALTH PROFILE</Text>
        <Text style={styles.coverTitleBM}>PROFIL KESIHATAN PERIBADI SAYA</Text>
        <Text style={styles.coverSubtitle}>{customerName.toUpperCase()}</Text>
        <Text style={styles.coverFooter}>mysovera</Text>
      </Page>

      {/* Summary page */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.h1}>Clinical Health Report Summary</Text>
        <Text style={styles.h1BM}>Ringkasan Laporan Kesihatan Klinikal</Text>

        <Text style={styles.h2}>1) Patient Details</Text>
        <Text style={styles.h2BM}>Butiran Pengguna</Text>
        <View style={styles.row}><Text style={styles.label}>Name / Nama</Text><Text style={styles.value}>{customerName}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Age / Umur</Text><Text style={styles.value}>{age ?? "—"}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Gender / Jantina</Text><Text style={styles.value}>{gender ?? "—"}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Reference</Text><Text style={styles.value}>{referenceCode}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Sample Date / Tarikh Sampel</Text><Text style={styles.value}>{sampleDate}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Report Printed / Tarikh Dicetak</Text><Text style={styles.value}>{printedDate}</Text></View>

        <Text style={styles.h2}>2) Overview by Area</Text>
        <Text style={styles.h2BM}>Gambaran Keseluruhan Status Kesihatan</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.colArea}>Area</Text>
          <Text style={styles.colStatus}>Status</Text>
          <Text style={styles.colRisk}>Risk / Tahap Risiko</Text>
        </View>
        {report.panels.map((p) => (
          <View style={styles.tableRow} key={p.key}>
            <Text style={styles.colArea}>{p.label}</Text>
            <View style={styles.colStatus}>
              <Text>{p.status}</Text>
              <Text style={styles.bmText}>{p.statusBM}</Text>
            </View>
            <View style={styles.colRisk}><RiskDot risk={p.riskLevel} /></View>
          </View>
        ))}

        <View style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: 700 }}>
            Overall Status / Status Keseluruhan:{" "}
            <Text style={{ color: RISK_COLOR[report.overallRisk] }}>{report.overallRisk.toUpperCase()}</Text>
          </Text>
          <Text style={{ marginTop: 4 }}>{report.overallRiskReason}</Text>
          <Text style={styles.bmText}>{report.overallRiskReasonBM}</Text>
        </View>

        <Text style={styles.footer}>mysovera · Educational summary, not a diagnosis · Ringkasan pendidikan, bukan diagnosis</Text>
      </Page>

      {/* Detailed findings, one section per panel */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.h1}>3) Report Analysis (by panel)</Text>
        <Text style={styles.h1BM}>Analisis Laporan (mengikut panel)</Text>
        {report.panels.map((p) => (
          <View key={p.key} wrap={false} style={{ marginBottom: 10 }}>
            <Text style={styles.h2}>{p.label}</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.colParam}>Parameter</Text>
              <Text style={styles.colVal}>Result</Text>
              <Text style={styles.colRange}>Reference</Text>
              <Text style={styles.colComment}>Comment / Komen</Text>
            </View>
            {p.findings.map((f, i) => (
              <View style={styles.tableRow} key={i}>
                <Text style={styles.colParam}>{f.parameter}</Text>
                <Text style={[styles.colVal, f.status === "flagged" ? { color: "#DC2626", fontWeight: 700 } : {}]}>
                  {f.rawValue}
                </Text>
                <Text style={styles.colRange}>{f.refRange ?? "—"}</Text>
                <View style={styles.colComment}>
                  <Text>{f.sentence}</Text>
                  <Text style={styles.bmText}>{f.sentenceBM}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>

      {/* Key problems + recommendations */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.h1}>4) Summary of Key Problems</Text>
        <Text style={styles.h1BM}>Ringkasan Masalah Utama</Text>
        {report.keyProblems.length === 0 ? (
          <Text>No significant issues flagged from the markers entered. / Tiada isu ketara ditanda daripada penanda yang dimasukkan.</Text>
        ) : (
          report.keyProblems.map((kp, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <Text style={{ fontWeight: 700 }}>
                {i + 1}. {kp.title} <RiskDot risk={kp.riskLevel} />
              </Text>
              <Text>{kp.justification}</Text>
              <Text style={styles.bmText}>{kp.justificationBM}</Text>
              <Text style={{ color: "#6B7280", marginTop: 2 }}>
                Metrics to monitor / Metrik dipantau: {kp.metricsToMonitor}
              </Text>
            </View>
          ))
        )}

        <Text style={styles.h1}>5) Recommendations</Text>
        <Text style={styles.h1BM}>Cadangan</Text>
        <Text style={{ fontSize: 8, color: "#92400E", marginBottom: 6 }}>
          AI-suggested — review status: {reviewStatus}. Not a substitute for individualized medical advice.{"\n"}
          Cadangan AI — status semakan: {reviewStatus}. Bukan pengganti nasihat perubatan individu.
        </Text>

        {rec.medical.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.h2}>5.1 Medical / Perubatan</Text>
            {rec.medical.map((m, i) => (
              <View style={styles.bullet} key={i}>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{m.en}</Text>
                </View>
                <Text style={styles.bmText}>{m.bm}</Text>
              </View>
            ))}
          </View>
        )}

        {rec.nutrition.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.h2}>5.2 Nutrition Plan / Pelan Pemakanan (3-month focus)</Text>
            {rec.nutrition.map((n, i) => (
              <View style={styles.bullet} key={i}>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    {n.focus}: {n.action} (target: {n.target})
                  </Text>
                </View>
                <Text style={styles.bmText}>
                  {n.focusBM}: {n.actionBM} (sasaran: {n.targetBM})
                </Text>
              </View>
            ))}
          </View>
        )}

        {rec.supplements.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.h2}>5.3 Supplements / Suplemen (discuss with doctor first)</Text>
            {rec.supplements.map((s, i) => (
              <View style={styles.bullet} key={i}>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    {s.name}: {s.benefit}
                  </Text>
                </View>
                <Text style={styles.bmText}>{s.benefitBM}</Text>
              </View>
            ))}
          </View>
        )}

        {rec.workout.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.h2}>5.4 Workout / Senaman</Text>
            {rec.workout.map((w, i) => (
              <View style={styles.bullet} key={i}>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{w.en}</Text>
                </View>
                <Text style={styles.bmText}>{w.bm}</Text>
              </View>
            ))}
          </View>
        )}

        {rec.sleep.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.h2}>5.5 Sleep and Stress / Tidur dan Tekanan</Text>
            {rec.sleep.map((s, i) => (
              <View style={styles.bullet} key={i}>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{s.en}</Text>
                </View>
                <Text style={styles.bmText}>{s.bm}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.disclaimer}>
          Medical Disclaimer: This report is an educational summary based on the lab results provided and is
          NOT a final diagnosis. Results should be interpreted together with your medical history, clinical
          examination, symptoms, and a doctor's assessment. If you have serious symptoms (chest pain, shortness
          of breath, fainting, weakness on one side of the body), seek emergency care immediately.
          {"\n\n"}
          Penafian Perubatan: Laporan ini adalah ringkasan pendidikan berdasarkan keputusan makmal yang
          diberikan dan bukan diagnosis muktamad. Keputusan perlu ditafsir bersama sejarah perubatan,
          pemeriksaan klinikal, simptom, dan penilaian doktor. Jika anda ada simptom serius (sakit dada, sesak
          nafas, pengsan, lemah sebelah badan), dapatkan rawatan kecemasan segera.
        </Text>

        <Text style={{ marginTop: 10, fontSize: 9, color: "#6B7280" }}>
          Report prepared by / Laporan disediakan oleh: Health Bridge Solution team{"\n"}
          Draft generated by rule-based-v1 · reviewed: {reviewStatus}
        </Text>
      </Page>
    </Document>
  );
}
