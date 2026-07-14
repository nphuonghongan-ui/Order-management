import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { PackingListRecord } from "./types";

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

  itemsTitle: {
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

  colPart: { width: "22%" },
  colMode: { width: "10%" },
  colShip: { width: "14%" },
  colQty: { width: "14%", textAlign: "right" },
  colPrice: { width: "18%", textAlign: "right" },
  colAmount: { width: "22%", textAlign: "right" },

  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.bgTinted,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.primary,
  },
});

const fmtCurrency = (n: number) =>
  `$ ${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtNumber = (n: number) => n.toLocaleString("en-US");

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

export function PackingListDocument({ record }: { record: PackingListRecord }) {
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
            <Text style={styles.plDate}>{formatDate(record.createdAt)}</Text>
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

        {/* Items */}
        <Text style={styles.itemsTitle}>Items</Text>
        {grouped.map((group) => (
          <View key={group.poNum} style={styles.poBlock} wrap={false}>
            <View style={styles.poHeader}>
              <Text style={styles.poHeaderText}>{group.poNum}</Text>
              <Text style={styles.poSubTotal}>
                {fmtCurrency(group.subTotal)}
              </Text>
            </View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colPart]}>
                Part Num
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colMode]}>
                Mode
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colShip]}>
                Ship To
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>
                Unit Price
              </Text>
              <Text style={[styles.tableHeaderCell, styles.colAmount]}>
                Amount
              </Text>
            </View>
            {group.items.map((it) => (
              <View key={it.lineId} style={styles.tableRow}>
                <Text style={[styles.cellMono, styles.cellBold, styles.colPart]}>
                  {it.partNum}
                </Text>
                <Text style={[styles.cell, styles.colMode]}>{it.mode}</Text>
                <Text style={[styles.cellMono, styles.colShip]}>
                  {it.shipToNum}
                </Text>
                <Text style={[styles.cellMono, styles.cellRight, styles.colQty]}>
                  {fmtNumber(it.qty)}
                </Text>
                <Text
                  style={[styles.cellMono, styles.cellRight, styles.colPrice]}
                >
                  {fmtCurrency(it.unitPrice)}
                </Text>
                <Text
                  style={[
                    styles.cellMono,
                    styles.cellBold,
                    styles.cellRight,
                    styles.colAmount,
                  ]}
                >
                  {fmtCurrency(it.qty * it.unitPrice)}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {/* Grand total */}
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Grand Total</Text>
          <Text style={styles.grandTotalValue}>
            {fmtCurrency(record.total)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
