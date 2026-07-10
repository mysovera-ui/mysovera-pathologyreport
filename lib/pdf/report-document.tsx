import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { StructuredReport, RiskLevel } from "@/lib/ai/rules";

const INK = "#22252A";
const GOLD = "#A9812F";
const CREAM = "#FBF8F2";
const RISK_COLOR: Record<RiskLevel, string> = {
  high: "#9B2C2C",
  moderate: "#B7791F",
  low: "#276749",
  none: "#9CA3AF",
};

const s = StyleSheet.create({
  page: { padding: 46, fontSize: 9.5, fontFamily: "Times-Roman", color: INK },
  coverPage: { padding: 0, fontFamily: "Times-Roman", backgroundColor: CREAM },
  coverFrame: {
    margin: 26, flex: 1, borderWidth: 1, borderColor: GOLD,
    alignItems: "center", justifyContent: "center", padding: 40,
  },
  coverKicker: { fontSize: 10, letterSpacing: 4, color: GOLD, marginBottom: 18 },
  coverTitle: { fontFamily: "Times-Bold", fontSize: 27, color: INK, textAlign: "center", lineHeight: 1.3 },
  coverRule: { width: 90, height: 1, backgroundColor: GOLD, marginVertical: 18 },
  coverTitleBM: { fontFamily: "Times-Italic", fontSize: 12, color: "#6B6355", textAlign: "center", marginBottom: 30 },
  coverName: { fontFamily: "Times-Bold", fontSize: 18, color: INK, textAlign: "center" },
  coverSub: { fontSize: 9.5, color: "#6B6355", textAlign: "center", marginTop: 6, letterSpacing: 1 },
  coverFooter: { position: "absolute", bottom: 34, alignSelf: "center", fontSize: 8.5, color: "#9C9284", letterSpacing: 2 },

  masthead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderBottomWidth: 1, borderBottomColor: GOLD, paddingBottom: 6, marginBottom: 16 },
  mastheadBrand: { fontFamily: "Times-Bold", fontSize: 11, letterSpacing: 2, color: INK },
  mastheadRef: { fontSize: 8.5, color: "#8A7F6C" },

  h1: { fontFamily: "Times-Bold", fontSize: 15, color: INK, marginBottom: 2 },
  h1BM: { fontFamily: "Times-Italic", fontSize: 9.5, color: "#8A7F6C", marginBottom: 10 },
  h2: { fontFamily: "Times-Bold", fontSize: 11, color: INK, marginTop: 12, marginBottom: 1 },
  h2BM: { fontFamily: "Times-Italic", fontSize: 8.5, color: "#8A7F6C", marginBottom: 6 },
  goldRule: { height: 0.75, backgroundColor: GOLD, marginVertical: 8, opacity: 0.5 },

  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 130, color: "#8A7F6C", fontFamily: "Times-Italic" },
  value: { flex: 1, color: INK, fontFamily: "Times-Bold" },

  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: INK, paddingVertical: 4 },
  tableHeaderText: { fontFamily: "Times-Bold", fontSize: 8.5, letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#E3DDCF" },
  tableRowShaded: { backgroundColor: CREAM },
  colArea: { width: "34%" },
  colStatus: { width: "44%" },
  colRisk: { width: "22%" },
  colParam: { width: "24%" },
  colVal: { width: "14%" },
  colRange: { width: "20%" },
  colComment: { width: "42%" },
  bmText: { fontFamily: "Times-Italic", fontSize: 8.5, color: "#8A7F6C", marginTop: 1 },

  riskLabel: { fontFamily: "Times-Bold", fontSize: 8.5 },

  bulletRow: { flexDirection: "row", marginBottom: 5 },
  bulletDot: { width: 12, color: GOLD, fontFamily: "Times-Bold" },
  bulletText: { flex: 1 },

  footer: { position: "absolute", bottom: 26, left: 46, right: 46, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.5, borderTopColor: "#E3DDCF", paddingTop: 6 },
  footerText: { fontSize: 7.5, color: "#9C9284", letterSpacing: 0.5 },

  disclaimerBox: { marginTop: 16, padding: 12, borderWidth: 1, borderColor: GOLD, fontSize: 8.5, color: "#5A5040" },
  disclaimerTitle: { fontFamily: "Times-Bold", fontSize: 9, color: INK, marginBottom: 4 },
});

function Masthead({ refCode }: { refCode: string }) {
  return (
    <View style={s.masthead} fixed>
      <Text style={s.mastheadBrand}>MYSOVERA</Text>
      <Text style={s.mastheadRef}>PERSONAL HEALTH PROFILE  ·  {refCode}</Text>
    </View>
  );
}
function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>EDUCATIONAL SUMMARY, NOT A DIAGNOSIS</Text>
      <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} OF ${totalPages}`} />
    </View>
  );
}

export function ReportDocument({
  report, customerName, age, gender, referenceCode, submittedAt, reviewStatus,
}: {
  report: StructuredReport; customerName: string; age?: number | null; gender?: string | null;
  referenceCode: string; submittedAt: string; reviewStatus: string;
}) {
  const printedDate = new Date().toLocaleDateString("en-GB");
  const sampleDate = new Date(submittedAt).toLocaleDateString("en-GB");
  const rec = report.recommendations;

  return (
    <Document>
      <Page size="A4" style={s.coverPage}>
        <View style={s.coverFrame}>
          <Text style={s.coverKicker}>MYSOVERA  ·  {new Date().getFullYear()}</Text>
          <Text style={s.coverTitle}>My Personal{"\n"}Health Profile</Text>
          <View style={s.coverRule} />
          <Text style={s.coverTitleBM}>Profil Kesihatan Peribadi Saya</Text>
          <Text style={s.coverName}>{customerName}</Text>
          <Text style={s.coverSub}>REFERENCE {referenceCode}</Text>
        </View>
        <Text style={s.coverFooter}>HEALTH BRIDGE SOLUTION</Text>
      </Page>

      <Page size="A4" style={s.page} wrap>
        <Masthead refCode={referenceCode} />
        <Text style={s.h1}>I. Patient Details</Text>
        <Text style={s.h1BM}>Butiran Pengguna</Text>
        <View style={s.row}><Text style={s.label}>Name / Nama</Text><Text style={s.value}>{customerName}</Text></View>
        <View style={s.row}><Text style={s.label}>Age / Umur</Text><Text style={s.value}>{age ?? "—"}</Text></View>
        <View style={s.row}><Text style={s.label}>Gender / Jantina</Text><Text style={s.value}>{gender ?? "—"}</Text></View>
        <View style={s.row}><Text style={s.label}>Sample Date</Text><Text style={s.value}>{sampleDate}</Text></View>
        <View style={s.row}><Text style={s.label}>Report Printed</Text><Text style={s.value}>{printedDate}</Text></View>

        <View style={s.goldRule} />

        <Text style={s.h1}>II. Overview by Area</Text>
        <Text style={s.h1BM}>Gambaran Keseluruhan Status Kesihatan</Text>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderText, s.colArea]}>AREA</Text>
          <Text style={[s.tableHeaderText, s.colStatus]}>STATUS</Text>
          <Text style={[s.tableHeaderText, s.colRisk]}>RISK LEVEL</Text>
        </View>
        {report.panels.map((p, i) => (
          <View style={[s.tableRow, i % 2 === 1 ? s.tableRowShaded : {}]} key={p.key}>
            <Text style={s.colArea}>{p.label}</Text>
            <View style={s.colStatus}><Text>{p.status}</Text><Text style={s.bmText}>{p.statusBM}</Text></View>
            <View style={s.colRisk}>
              <Text style={[s.riskLabel, { color: RISK_COLOR[p.riskLevel] }]}>
                {p.riskLevel === "none" ? "— NONE —" : p.riskLevel.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}

        <View style={{ marginTop: 14 }}>
          <Text style={{ fontFamily: "Times-Bold" }}>
            Overall Status / Status Keseluruhan:{" "}
            <Text style={{ color: RISK_COLOR[report.overallRisk] }}>{report.overallRisk.toUpperCase()}</Text>
          </Text>
          <Text style={{ marginTop: 4 }}>{report.overallRiskReason}</Text>
          <Text style={s.bmText}>{report.overallRiskReasonBM}</Text>
        </View>
        <Footer />
      </Page>

      <Page size="A4" style={s.page} wrap>
        <Masthead refCode={referenceCode} />
        <Text style={s.h1}>III. Report Analysis (by panel)</Text>
        <Text style={s.h1BM}>Analisis Laporan (mengikut panel)</Text>
        {report.panels.map((p) => (
          <View key={p.key} wrap={false} style={{ marginBottom: 10 }}>
            <Text style={s.h2}>{p.label}</Text>
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderText, s.colParam]}>PARAMETER</Text>
              <Text style={[s.tableHeaderText, s.colVal]}>RESULT</Text>
              <Text style={[s.tableHeaderText, s.colRange]}>REFERENCE</Text>
              <Text style={[s.tableHeaderText, s.colComment]}>COMMENT / KOMEN</Text>
            </View>
            {p.findings.map((f, i) => (
              <View style={[s.tableRow, i % 2 === 1 ? s.tableRowShaded : {}]} key={i}>
                <Text style={s.colParam}>{f.parameter}</Text>
                <Text style={[s.colVal, f.status === "flagged" ? { color: RISK_COLOR.high, fontFamily: "Times-Bold" } : {}]}>{f.rawValue}</Text>
                <Text style={s.colRange}>{f.refRange ?? "—"}</Text>
                <View style={s.colComment}>
                  <Text>{f.sentence}</Text>
                  <Text style={s.bmText}>{f.sentenceBM}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
        <Footer />
      </Page>

      <Page size="A4" style={s.page} wrap>
        <Masthead refCode={referenceCode} />
        <Text style={s.h1}>IV. Summary of Key Problems</Text>
        <Text style={s.h1BM}>Ringkasan Masalah Utama</Text>
        {report.keyProblems.length === 0 ? (
          <Text>No significant issues flagged from the markers entered.</Text>
        ) : (
          report.keyProblems.map((kp, i) => (
            <View key={i} style={{ marginBottom: 9 }}>
              <Text style={{ fontFamily: "Times-Bold" }}>
                {i + 1}. {kp.title}{"  "}
                <Text style={{ color: RISK_COLOR[kp.riskLevel] }}>[{kp.riskLevel.toUpperCase()}]</Text>
              </Text>
              <Text style={{ marginTop: 2 }}>{kp.justification}</Text>
              <Text style={s.bmText}>{kp.justificationBM}</Text>
              <Text style={{ color: "#8A7F6C", marginTop: 2, fontFamily: "Times-Italic", fontSize: 8.5 }}>
                Metrics to monitor: {kp.metricsToMonitor}
              </Text>
            </View>
          ))
        )}

        <View style={s.goldRule} />

        <Text style={s.h1}>V. Recommendations</Text>
        <Text style={s.h1BM}>Cadangan</Text>
        <Text style={{ fontSize: 8, color: "#8A7F6C", fontFamily: "Times-Italic", marginBottom: 6 }}>
          AI-suggested — review status: {reviewStatus}. Not a substitute for individualized medical advice.
        </Text>

        {rec.medical.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text style={s.h2}>5.1 Medical / Perubatan</Text>
            {rec.medical.map((m, i) => (
              <View style={s.bulletRow} key={i} wrap={false}>
                <Text style={s.bulletDot}>—</Text>
                <View style={s.bulletText}><Text>{m.en}</Text><Text style={s.bmText}>{m.bm}</Text></View>
              </View>
            ))}
          </View>
        )}
        {rec.nutrition.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text style={s.h2}>5.2 Nutrition Plan / Pelan Pemakanan</Text>
            {rec.nutrition.map((n, i) => (
              <View style={s.bulletRow} key={i} wrap={false}>
                <Text style={s.bulletDot}>—</Text>
                <View style={s.bulletText}>
                  <Text>{n.focus}: {n.action} (target: {n.target})</Text>
                  <Text style={s.bmText}>{n.focusBM}: {n.actionBM} (sasaran: {n.targetBM})</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        {rec.supplements.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text style={s.h2}>5.3 Supplements / Suplemen</Text>
            {rec.supplements.map((sp, i) => (
              <View style={s.bulletRow} key={i} wrap={false}>
                <Text style={s.bulletDot}>—</Text>
                <View style={s.bulletText}><Text>{sp.name}: {sp.benefit}</Text><Text style={s.bmText}>{sp.benefitBM}</Text></View>
              </View>
            ))}
          </View>
        )}
        {rec.workout.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text style={s.h2}>5.4 Workout / Senaman</Text>
            {rec.workout.map((w, i) => (
              <View style={s.bulletRow} key={i} wrap={false}>
                <Text style={s.bulletDot}>—</Text>
                <View style={s.bulletText}><Text>{w.en}</Text><Text style={s.bmText}>{w.bm}</Text></View>
              </View>
            ))}
          </View>
        )}
        {rec.mindfulness.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text style={s.h2}>5.5 Mindfulness / Kesedaran Minda</Text>
            {rec.mindfulness.map((m, i) => (
              <View style={s.bulletRow} key={i} wrap={false}>
                <Text style={s.bulletDot}>—</Text>
                <View style={s.bulletText}><Text>{m.en}</Text><Text style={s.bmText}>{m.bm}</Text></View>
              </View>
            ))}
          </View>
        )}
        {rec.sleep.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text style={s.h2}>5.6 Sleep and Stress / Tidur dan Tekanan</Text>
            {rec.sleep.map((sl, i) => (
              <View style={s.bulletRow} key={i} wrap={false}>
                <Text style={s.bulletDot}>—</Text>
                <View style={s.bulletText}><Text>{sl.en}</Text><Text style={s.bmText}>{sl.bm}</Text></View>
              </View>
            ))}
          </View>
        )}

        <View style={s.disclaimerBox}>
          <Text style={s.disclaimerTitle}>Medical Disclaimer</Text>
          <Text>
            This report is an educational summary based on the lab results provided and is NOT a final
            diagnosis. Results should be interpreted together with your medical history, clinical examination,
            symptoms, and a doctor's assessment.
          </Text>
        </View>
        <Footer />
      </Page>
    </Document>
  );
}
