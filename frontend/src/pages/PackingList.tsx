import { useState, useMemo } from "react";
import { toast } from "sonner";
import ActionToolbar from "@/components/ActionToolbar";
import DataTable, { type Column } from "@/components/DataTable";
import { PageShell } from "@/components/PageShell";
import StatusBadge from "@/components/StatusBadge";

interface PackingListItem {
  _id: string;
  plNumber: string;
  customer: string;
  itemsCount: number;
  status: "pending" | "shipped";
  createdAt: string;
}

const MOCK_PACKING_LISTS: PackingListItem[] = [
  { _id: "1", plNumber: "PL-2026-001", customer: "Acme Corp", itemsCount: 12, status: "shipped", createdAt: "2026-06-10" },
  { _id: "2", plNumber: "PL-2026-002", customer: "Globex Inc", itemsCount: 5, status: "pending", createdAt: "2026-06-22" },
  { _id: "3", plNumber: "PL-2026-003", customer: "Initech", itemsCount: 28, status: "shipped", createdAt: "2026-06-28" },
];

const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "shipped", label: "Shipped" },
];

const COLUMNS: Column<PackingListItem>[] = [
  { key: "plNumber", label: "PL Number", mono: true },
  { key: "customer", label: "Customer" },
  { key: "itemsCount", label: "Items", align: "right" },
  { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
  { key: "createdAt", label: "Created" },
];

export default function PackingList() {
  const [items, setItems] = useState<PackingListItem[]>(MOCK_PACKING_LISTS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.customer.toLowerCase().includes(search.toLowerCase()) ||
        item.plNumber.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" || item.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter]);

  const handleCreate = () => {
    const newId = String(Date.now());
    const num = items.length + 1;
    setItems([
      ...items,
      {
        _id: newId,
        plNumber: `PL-2026-${String(num).padStart(3, "0")}`,
        customer: "New Customer",
        itemsCount: 0,
        status: "pending",
        createdAt: new Date().toISOString().split("T")[0],
      },
    ]);
    toast.success("Packing list created successfully");
  };

  const handleEdit = (row: PackingListItem) => {
    toast.info(`Edit feature coming soon — ${row.plNumber}`);
  };

  const handleDelete = (row: PackingListItem) => {
    setItems(items.filter((item) => item._id !== row._id));
    toast.success("Packing list deleted successfully");
  };

  return (
    <PageShell>
      <ActionToolbar
        search={search}
        setSearch={setSearch}
        filters={FILTERS}
        activeFilter={filter}
        setActiveFilter={setFilter}
        ctaLabel="Create Packing List"
        onCTA={handleCreate}
      />
      <DataTable
        columns={COLUMNS}
        data={filteredItems}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No packing lists found"
      />
    </PageShell>
  );
}
