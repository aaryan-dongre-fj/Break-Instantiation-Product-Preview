import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import RpPageHeader from "./RpPageHeader";
import { C, PAGE } from "./tokens";
import { normalizePoint, splitCommaList } from "./utils";

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
    marginBottom: 14,
    maxWidth: 400,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: C.black,
    marginBottom: 8,
    marginTop: 14,
  },
  sectionCard: {
    backgroundColor: C.cream,
    borderRadius: 16,
    padding: 12,
    borderWidth: 0.5,
    borderColor: "#E7E1D8",
    borderStyle: "solid",
    marginBottom: 8,
  },
  bullets: { gap: 5 },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },
  bulletNum: {
    width: 20,
    fontSize: 9,
    fontFamily: "Times-Italic",
    fontWeight: "bold",
    color: C.gold,
  },
  bulletText: { fontSize: 8.5, color: C.black, lineHeight: 1.55, flex: 1, fontWeight: "bold" },
  empty: { fontSize: 8, color: C.muted, fontStyle: "italic" },
  costBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },
  costNum: {
    width: 20,
    fontSize: 9,
    fontFamily: "Times-Italic",
    fontWeight: "bold",
    color: "#8E877E",
  },
  costText: { fontSize: 8, color: "#4D4740", lineHeight: 1.55, flex: 1, fontWeight: "bold" },
  zoneNum: {
    width: 20,
    fontSize: 9,
    fontFamily: "Times-Italic",
    fontWeight: "bold",
    color: C.gold,
  },
  zoneText: {
    fontSize: 8,
    color: "#4D4740",
    lineHeight: 1.55,
    flex: 1,
    fontWeight: "bold",
  },
});

interface RpPage6Props {
  behaviorProfileData: any;
}

export default function RpPage6({ behaviorProfileData }: RpPage6Props) {
  const p = behaviorProfileData;
  const strengths = splitCommaList(p?.current_strengths);
  const longtermEffects = splitCommaList(p?.longterm_effects);
  const rebellionZones = splitCommaList(p?.rebellion_zones);

  return (
    <Page size="A4" style={s.page}>
      <RpPageHeader />

      <Text style={s.sectionTitle}>Current Strengths</Text>

      {strengths.length === 0 ? (
        <Text style={s.empty}>No data available.</Text>
      ) : (
        <View style={s.sectionCard} wrap={false}>
          <View style={s.bullets}>
            {strengths.map((item, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={s.bulletNum}>{String(i + 1).padStart(2, "0")}</Text>
                <Text style={s.bulletText}>{normalizePoint(item)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Text style={s.subsectionTitle}>Cost Of Not Rewiring</Text>

      {longtermEffects.length === 0 ? (
        <Text style={s.empty}>No data available.</Text>
      ) : (
        <View style={s.sectionCard} wrap={false}>
          <View style={s.bullets}>
            {longtermEffects.map((item: string, i: number) => (
              <View key={i} style={s.costBulletRow}>
                <Text style={s.costNum}>{String(i + 1).padStart(2, "0")}</Text>
                <Text style={s.costText}>{normalizePoint(item)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Text style={s.subsectionTitle}>Rebellion Zones</Text>

      {rebellionZones.length === 0 ? (
        <Text style={s.empty}>No data available.</Text>
      ) : (
        <View style={s.sectionCard} wrap={false}>
          <View style={s.bullets}>
            {rebellionZones.map((zone: string, i: number) => (
              <View key={i} style={s.bulletRow}>
                <Text style={s.zoneNum}>{String(i + 1).padStart(2, "0")}</Text>
                <Text style={s.zoneText}>{normalizePoint(zone)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Page>
  );
}
