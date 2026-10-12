import { View, Text, StyleSheet, Image } from "@react-pdf/renderer";
import { instance } from "@/utils/instance";
import { C } from "./tokens";

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    marginBottom: 18,
    borderBottomWidth: 3,
    borderBottomColor: C.gold,
    borderBottomStyle: "solid",
  },
  brandWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 55,
    objectFit: "contain",
  },
  title: {
    fontSize: 10,
    fontWeight: "bold",
    color: C.black,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
});

function logoSrc(logo: string) {
  if (logo.startsWith("http://") || logo.startsWith("https://")) return logo;
  if (typeof window !== "undefined") return `${window.location.origin}${logo}`;
  return logo;
}

export default function RpPageHeader() {
  return (
    <View style={s.row}>
      <View style={s.brandWrap}>
        {instance.logo ? (
          <Image src={logoSrc(instance.logo)} style={s.logo} />
        ) : (
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>{instance.productName}</Text>
        )}
      </View>
      <Text style={s.title}>Your report</Text>
    </View>
  );
}
