import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import RpPageHeader from "./RpPageHeader";
import { C, PAGE } from "./tokens";
import { getJourneyEmotionalSections, normalizePoint } from "./utils";

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
  emotionCard: {
    backgroundColor: C.cream,
    borderRadius: 16,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "#E7E1D8",
    borderStyle: "solid",
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 3,
    marginBottom: 8,
  },
  emotionLabel: {
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: C.muted,
  },
  emotionValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: C.black,
    textAlign: "left",
  },
  points: { gap: 4, marginTop: 4 },
  pointRow: { flexDirection: "row", gap: 7, alignItems: "flex-start" },
  pointNum: {
    width: 18,
    fontSize: 9,
    fontFamily: "Times-Italic",
    fontWeight: "bold",
    color: C.gold,
  },
  pointText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 1.45,
    color: "#47413B",
    fontWeight: "bold",
  },
  empty: { fontSize: 8, color: C.muted, fontStyle: "italic" },
});

function NumberedList({ items }: { items: string[] }) {
  if (!items.length) return <Text style={s.empty}>No data available.</Text>;

  return (
    <View style={s.points}>
      {items.map((point, i) => (
        <View key={`${point}-${i}`} style={s.pointRow}>
          <Text style={s.pointNum}>{String(i + 1).padStart(2, "0")}</Text>
          <Text style={s.pointText}>{normalizePoint(point)}</Text>
        </View>
      ))}
    </View>
  );
}

interface RpPage4Props {
  behaviorProfileData: any;
  timelineProfileData: any;
}

export default function RpPage4({
  behaviorProfileData,
  timelineProfileData,
}: RpPage4Props) {
  const sections = getJourneyEmotionalSections(behaviorProfileData, timelineProfileData);

  return (
    <Page size="A4" style={s.page}>
      <RpPageHeader />

      <Text style={s.sectionTitle}>Emotional Addiction Cycle</Text>

      {sections.map((section, i) => (
        <View key={`${section.title}-${section.subtitle || i}`} style={s.emotionCard} wrap={false}>
          <View style={s.cardHeader}>
            {section.subtitle && (
              <Text style={s.emotionLabel}>{section.subtitle}</Text>
            )}
            <Text style={s.emotionValue}>{section.title}</Text>
          </View>
          <NumberedList items={section.points} />
        </View>
      ))}
    </Page>
  );
}
