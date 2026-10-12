import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import RpPageHeader from "./RpPageHeader";
import { C, PAGE } from "./tokens";
import { getJourneyTimelineSections, normalizePoint } from "./utils";

const s = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: PAGE.paddingH,
    paddingVertical: PAGE.paddingV,
    fontFamily: "Helvetica",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: C.black,
    marginBottom: 8,
  },
  desc: {
    fontSize: 8,
    color: C.muted,
    lineHeight: 1.6,
    marginBottom: 16,
    maxWidth: 380,
  },
  timelineCard: {
    backgroundColor: C.cream,
    borderRadius: 16,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "#E7E1D8",
    borderStyle: "solid",
    marginBottom: 10,
  },
  timelineCardHeader: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 3,
    marginBottom: 10,
  },
  timelineLabel: {
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: C.muted,
  },
  timelineNumber: {
    fontSize: 26,
    fontWeight: "bold",
    color: C.black,
  },
  bullets: { gap: 4 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  bulletNum: {
    width: 18,
    fontSize: 9,
    fontFamily: "Times-Italic",
    fontWeight: "bold",
    color: C.gold,
  },
  bulletText: { fontSize: 8, color: "#4D4740", lineHeight: 1.45, flex: 1, fontWeight: "bold" },
});

interface RpPage5Props {
  modelResponseData: any;
  timelineProfileData: any;
  behaviorProfileData?: any;
}

export default function RpPage5({
  modelResponseData,
  timelineProfileData,
  behaviorProfileData,
}: RpPage5Props) {
  const sections = getJourneyTimelineSections(
    modelResponseData,
    timelineProfileData,
    behaviorProfileData
  );

  return (
    <Page size="A4" style={s.page}>
      <RpPageHeader />

      <Text style={s.sectionTitle}>Timeline Imbalance</Text>

      {sections.map((sec) => (
        <View key={`${sec.subtitle}-${sec.title}`} style={s.timelineCard} wrap={false}>
          <View style={s.timelineCardHeader}>
            <Text style={s.timelineNumber}>{sec.title}</Text>
            <Text style={s.timelineLabel}>{sec.subtitle}</Text>
          </View>
          {sec.points.length > 0 ? (
            <View style={s.bullets}>
              {sec.points.map((pt, i) => (
                <View key={i} style={s.bulletRow}>
                  <Text style={s.bulletNum}>{String(i + 1).padStart(2, "0")}</Text>
                  <Text style={s.bulletText}>{normalizePoint(pt)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={s.timelineLabel}>No data available.</Text>
          )}
        </View>
      ))}
    </Page>
  );
}
