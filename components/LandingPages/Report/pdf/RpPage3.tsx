import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import RpPageHeader from "./RpPageHeader";
import { C, PAGE } from "./tokens";
import { getJourneyProfileSections, normalizePoint } from "./utils";

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
    marginBottom: 18,
    maxWidth: 420,
  },
  card: {
    backgroundColor: C.cream,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "#E7E1D8",
    borderStyle: "solid",
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: C.black,
    marginBottom: 2,
  },
  subsectionSubtitle: {
    fontSize: 7,
    color: C.muted,
    fontStyle: "italic",
    marginBottom: 8,
  },
  bullets: { gap: 4, marginTop: 8 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 7 },
  bulletNum: {
    width: 18,
    fontSize: 9,
    fontFamily: "Times-Italic",
    fontWeight: "bold",
    color: C.gold,
  },
  bulletText: { fontSize: 8.5, color: "#47413B", lineHeight: 1.45, flex: 1, fontWeight: "bold" },
  empty: { fontSize: 8, color: C.muted, fontStyle: "italic" },
});

function NumberedList({ items }: { items: string[] }) {
  if (!items || items.length === 0) {
    return <Text style={s.empty}>No data available.</Text>;
  }

  return (
    <View style={s.bullets}>
      {items.map((item, i) => (
        <View key={i} style={s.bulletRow}>
          <Text style={s.bulletNum}>{String(i + 1).padStart(2, "0")}</Text>
          <Text style={s.bulletText}>{normalizePoint(item)}</Text>
        </View>
      ))}
    </View>
  );
}

interface RpPage3Props {
  behaviorProfileData: any;
}

export default function RpPage3({ behaviorProfileData }: RpPage3Props) {
  const sections = getJourneyProfileSections(behaviorProfileData);

  return (
    <Page size="A4" style={s.page}>
      <RpPageHeader />

      <Text style={s.sectionTitle}>Your profile</Text>

      {sections.map((section) => (
        <View key={section.title} style={s.card} wrap={false}>
          <Text style={s.subsectionTitle}>{section.title}</Text>
          {section.subtitle && (
            <Text style={s.subsectionSubtitle}>{section.subtitle}</Text>
          )}
          <NumberedList items={section.points} />
        </View>
      ))}
    </Page>
  );
}
