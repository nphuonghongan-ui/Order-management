import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { PackingListRecord } from "./types";
import { calcContainersNeeded } from "@/components/po/utils";

Font.register({
  family: "Noto Sans",
  fonts: [
    { src: "/fonts/NotoSans-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/NotoSans-Bold.ttf", fontWeight: "bold" },
    { src: "/fonts/NotoSans-Italic.ttf", fontWeight: "normal", fontStyle: "italic" },
  ],
});

Font.register({
  family: "Noto Sans Mono",
  fonts: [
    { src: "/fonts/NotoSansMono-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/NotoSansMono-Bold.ttf", fontWeight: "bold" },
  ],
});

const COLORS = {
  border: "#d4d4d8",
  muted: "#71717a",
  text: "#18181b",
  primary: "#0E7490",
  bgMuted: "#f4f4f5",
  bgTinted: "#e6f7fa",
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Noto Sans",
    color: COLORS.text,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
    marginBottom: 16,
  },
  brand: { fontSize: 20, fontWeight: 700, letterSpacing: 2 },
  brandSub: { fontSize: 9, color: COLORS.muted, marginTop: 2 },
  plBlock: { alignItems: "flex-end" },
  plLabel: { fontSize: 8, color: COLORS.muted, textTransform: "uppercase" },
  plNumber: { fontSize: 14, fontWeight: 700, color: COLORS.primary, marginTop: 2 },
  plDate: { fontSize: 9, color: COLORS.muted, marginTop: 4 },

  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
  },
  tintedCard: {
    backgroundColor: COLORS.bgTinted,
  },
  fieldsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  fieldCol: {
    width: "50%",
    marginBottom: 6,
    paddingRight: 8,
  },
  fieldColFull: {
    width: "100%",
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  fieldValue: { fontSize: 10 },

  packingListDetailTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
  },
  poBlock: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  poHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.bgMuted,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  poHeaderText: { fontSize: 11, fontWeight: 700 },
  poSubTotal: { fontSize: 11, fontWeight: 700, color: COLORS.primary },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.bgMuted,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 700,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cell: { fontSize: 9 },
  cellMono: { fontSize: 9, fontFamily: "Noto Sans Mono" },
  cellRight: { textAlign: "right" },
  cellBold: { fontWeight: 700 },

  colNo: { width: "6%" },
  colCtn: { width: "10%", textAlign: "right" },
  colQpc: { width: "20%", textAlign: "right" },
  colPart: { width: "20%", textAlign: "right"},
  colQty: { width: "20%", textAlign: "right" },
  colDim: { width: "20%", textAlign: "right" },
  colCbm: { width: "20%", textAlign: "right" },

  summaryBlock: {
    marginTop: 12,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    paddingTop: 10,
    gap: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  summaryLabel: {
    fontSize: 9,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "Noto Sans Mono",
  },
});

const fmtCurrency = (n: number) =>
  `$ ${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtNumber = (n: number) => n.toLocaleString("en-US");

const fmtDimension = (l: number, w: number, h: number) => {
  return `${l} × ${w} × ${h}`;
};

const fmtCbm = (cbm: number) => {
  if (cbm <= 0) return "—";
  return cbm.toFixed(1);
};

const formatDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

function Field({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <View style={full ? styles.fieldColFull : styles.fieldCol}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || "—"}</Text>
    </View>
  );
}

export function PackingListDocument({
  record,
  partNumToDim,
}: {
  record: PackingListRecord;
  partNumToDim: Map<string, { length: number; width: number; height: number }>;
}) {
  const grouped = (() => {
    const map = new Map<string, typeof record.items>();
    for (const it of record.items) {
      const arr = map.get(it.poNum) ?? [];
      arr.push(it);
      map.set(it.poNum, arr);
    }
    return [...map.entries()].map(([poNum, items]) => ({
      poNum,
      items,
      subTotal: items.reduce((s, it) => s + it.qty * it.unitPrice, 0),
    }));
  })();

  const totalCtn = record.items.reduce((s, it) => {
    const qpc = it.quantityPerCont ?? 0;
    return s + (qpc > 0 ? calcContainersNeeded(it.qty, qpc) : 0);
  }, 0);
  const totalQty = record.items.reduce((s, it) => s + it.qty, 0);
  const totalCbm = record.items.reduce((s, it) => {
    const dim = partNumToDim.get(it.partNum);
    if (!dim) return s;
    return s + dim.length * dim.width * dim.height * it.qty;
  }, 0);

  return (
    <Document
      title={`Packing List ${record.plNumber}`}
      author="Order Management"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>PACKING LIST</Text>
            <Text style={styles.brandSub}>
              Generated {formatDate(record.createdAt)}
            </Text>
          </View>
          <View style={styles.plBlock}>
            <Text style={styles.plLabel}>PL Number</Text>
            <Text style={styles.plNumber}>{record.plNumber}</Text>
          </View>
        </View>

        {/* Customer */}
        <View style={[styles.card, styles.tintedCard]}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.fieldsGrid}>
            <Field label="Name" value={record.customer.name} />
            <Field label="Contact" value={record.customer.contact} />
            <Field label="Email" value={record.customer.email} />
            <Field
              label="Address"
              value={record.customer.address}
              full
            />
          </View>
        </View>

        {/* Delivery */}
        <View style={[styles.card, styles.tintedCard]}>
          <Text style={styles.sectionTitle}>Delivery</Text>
          <View style={styles.fieldsGrid}>
            <Field label="Recipient" value={record.delivery.name} />
            <Field
              label="Expected Date"
              value={formatDate(record.delivery.shipDate)}
            />
            <Field
              label="Address"
              value={record.delivery.address}
              full
            />
            {record.delivery.notes && (
              <Field label="Notes" value={record.delivery.notes} full />
            )}
          </View>
        </View>

        {/* Packing List Detail */}
        <Text style={styles.packingListDetailTitle}>PACKING LIST DETAIL</Text>
        {grouped.map((group) => (
          <View key={group.poNum} style={styles.poBlock} wrap={false}>
            <View style={styles.poHeader}>
              <Text style={styles.poHeaderText}>{group.poNum}</Text>
            </View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colNo]}>NO</Text>
              <Text style={[styles.tableHeaderCell, styles.colCtn]}>NO. CTN</Text>
              <Text style={[styles.tableHeaderCell, styles.colQpc]}>QTY PER CTN</Text>
              <Text style={[styles.tableHeaderCell, styles.colPart]}>PARTNUM</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>QTY</Text>
              <Text style={[styles.tableHeaderCell, styles.colDim]}>L × W × H</Text>
              <Text style={[styles.tableHeaderCell, styles.colCbm]}>CBM</Text>
            </View>
            {(() => {
              let no = 0;
              return group.items.map((it) => {
                no += 1;
                const dim = partNumToDim.get(it.partNum);
                const l = dim?.length ?? 0;
                const w = dim?.width ?? 0;
                const h = dim?.height ?? 0;
                const hasDim = l > 0 || w > 0 || h > 0;
                const cbm = hasDim ? l * w * h * it.qty : 0;
                const qpc = it.quantityPerCont ?? 0;
                const ctn = calcContainersNeeded(it.qty, qpc);
                return (
                  <View key={it.lineId} style={styles.tableRow}>
                    <Text style={[styles.cellMono, styles.colNo]}>
                      {no}
                    </Text>
                    <Text
                      style={[styles.cellMono, styles.cellRight, styles.colCtn]}
                    >
                      {qpc > 0 ? ctn : "—"}
                    </Text>
                    <Text
                      style={[styles.cellMono, styles.cellRight, styles.colQpc]}
                    >
                      {qpc > 0 ? fmtNumber(qpc) : "—"}
                    </Text>
                    <Text style={[styles.cellMono, styles.cellBold, styles.colPart]}>
                      {it.partNum}
                    </Text>
                    <Text
                      style={[styles.cellMono, styles.cellRight, styles.colQty]}
                    >
                      {fmtNumber(it.qty)}
                    </Text>
                    <Text style={[styles.cell, styles.colDim]}>
                      {hasDim ? fmtDimension(l, w, h) : "—"}
                    </Text>
                    <Text
                      style={[
                        styles.cellMono,
                        styles.cellRight,
                        styles.colCbm,
                      ]}
                    >
                      {hasDim ? cbm : "—"}
                    </Text>
                  </View>
                );
              });
            })()}
          </View>
        ))}

        {/* Summary */}
        <View style={styles.summaryBlock}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total NO OF CTN</Text>
            <Text style={styles.summaryValue}>{fmtNumber(totalCtn)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total QTY (PCS)</Text>
            <Text style={styles.summaryValue}>{fmtNumber(totalQty)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total CBM</Text>
            <Text style={styles.summaryValue}>
              {totalCbm > 0 ? fmtCbm(totalCbm) : "—"}
            </Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 4, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 6 }]}>
            <Text style={[styles.summaryLabel, { color: COLORS.primary, fontWeight: 700 }]}>Grand Total</Text>
            <Text style={[styles.summaryValue, { color: COLORS.primary }]}>
              {fmtCurrency(record.total)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
