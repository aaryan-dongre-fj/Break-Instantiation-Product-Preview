import { Image, StyleSheet, View } from "@react-pdf/renderer";
import { CONTENT_WIDTH } from "./tokens";

const IMAGE_WIDTH = CONTENT_WIDTH - 24;

const s = StyleSheet.create({
  container: {
    width: IMAGE_WIDTH,
    borderRadius: 26,
    overflow: "hidden",
    alignItems: "center",
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH * 0.5625,
    objectFit: "cover",
  },
});

interface SpectrumPdfProps {
  position: number; // 0–100
}

export default function SpectrumPdf({ position }: SpectrumPdfProps) {
  const chartRange = String(Math.round(Number(position) || 0));

  return (
    <View style={s.container}>
      <Image src={`/spectrum_images/${chartRange}.png`} style={s.image} />
    </View>
  );
}
