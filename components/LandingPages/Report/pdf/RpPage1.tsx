import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import RpPageHeader from "./RpPageHeader";
import SpectrumPdf from "./SpectrumPdf";
import { normalizePoint } from "./utils";
import { C } from "./tokens";

const s = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 38,
    paddingVertical: 38,
    fontFamily: "Helvetica",
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: C.black,
    marginBottom: 18,
  },
  personBlock: {
    marginBottom: 18,
  },
  personLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    marginBottom: 3,
  },
  personName: {
    fontSize: 18,
    fontWeight: "bold",
    color: C.black,
  },
  card: {
    backgroundColor: C.cream,
    borderRadius: 22,
    padding: 20,
    borderWidth: 0.5,
    borderColor: "#E1DAD0",
    borderStyle: "solid",
    marginBottom: 22,
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    paddingVertical: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E1DAD0",
    borderBottomStyle: "solid",
  },
  fieldRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    paddingTop: 9,
  },
  fieldMeta: {
    width: 150,
  },
  fieldLabel: {
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: C.muted,
  },
  fieldValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: C.black,
    textAlign: "right",
  },
  fieldValueGold: {
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: C.gold,
    textAlign: "right",
  },
  spectrumBlock: {
    marginTop: 2,
  },
  spectrumTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#E7E1D8",
    borderTopStyle: "solid",
    paddingTop: 16,
  },
  spectrumTitle: {
    fontSize: 15,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: C.black,
  },
});

interface RpPage1Props {
  behaviorProfileData: any;
  userName?: string;
}

export default function RpPage1({ behaviorProfileData, userName = "User" }: RpPage1Props) {
  const p = behaviorProfileData;
  const effectiveModifier = p?.modifier?.trim() || p?.interaction_style || null;
  const modifierDisplay = effectiveModifier ? normalizePoint(effectiveModifier) : "Not Set";
  const fields = [
    { label: "Origin Belief", value: p?.osb || "Not Set" },
    { label: "Adaptive Belief", value: p?.asb || "Not Set", gold: true },
    { label: "Modifier", value: modifierDisplay },
    { label: "Self Trust", value: p?.self_trust || "Not Set" },
  ];

  return (
    <Page size="A4" style={s.page}>
      <RpPageHeader />

      <View style={s.personBlock}>
        <Text style={s.personLabel}>Prepared For</Text>
        <Text style={s.personName}>{userName}</Text>
      </View>

      <Text style={s.sectionTitle}>Source Belief Pattern</Text>

      <View style={s.card}>
        {fields.map((field, index) => (
          <View
            key={field.label}
            style={index === fields.length - 1 ? s.fieldRowLast : s.fieldRow}
          >
            <View style={s.fieldMeta}>
              <Text style={s.fieldLabel}>{field.label}</Text>
            </View>
            <Text style={field.gold ? s.fieldValueGold : s.fieldValue}>
              {field.value}
            </Text>
          </View>
        ))}
      </View>

      <View style={s.spectrumBlock}>
        <View style={s.spectrumTitleRow}>
          <Text style={s.spectrumTitle}>Source Belief Spectrum</Text>
        </View>
        <SpectrumPdf position={p?.chart_range || 0} />
      </View>
    </Page>
  );
}
