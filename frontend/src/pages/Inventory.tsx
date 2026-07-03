import { useState, useMemo } from "react";
import { toast } from "sonner";
import ActionToolbar from "@/components/ActionToolbar";
import DataTable, { type Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";

interface InventoryItem {
  _id: string;
  sku: string;
  name: string;
  quantity: number;
  status: "confirmed" | "submitted";
  createdAt: string;
}

const MOCK_INVENTORY: InventoryItem[] = [
  { _id: "1", sku: "INV-001", name: "Steel Sheet A36", quantity: 120, status: "confirmed", createdAt: "2026-06-01" },
  { _id: "2", sku: "INV-002", name: "Aluminum Bar 6061", quantity: 45, status: "submitted", createdAt: "2026-06-15" },
  { _id: "3", sku: "INV-003", name: "Copper Wire 12AWG", quantity: 300, status: "confirmed", createdAt: "2026-06-20" },
  { _id: "4", sku: "INV-004", name: "Stainless Pipe 304", quantity: 0, status: "submitted", createdAt: "2026-07-01" },
];

const FILTERS = [
  { value: "all", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "confirmed", label: "Confirmed" },
];

const COLUMNS: Column<InventoryItem>[] = [
  { key: "sku", label: "SKU / ID", mono: true },
  { key: "name", label: "Name" },
  { key: "quantity", label: "Quantity", align: "right" },
  { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
  { key: "createdAt", label: "Created" },
];

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase());
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
        sku: `INV-${String(num).padStart(3, "0")}`,
        name: "New Item",
        quantity: 0,
        status: "submitted",
        createdAt: new Date().toISOString().split("T")[0],
      },
    ]);
    toast.success("Item created successfully");
  };

  const handleEdit = (row: InventoryItem) => {
    toast.info(`Edit feature coming soon — ${row.sku}`);
  };

  const handleDelete = (row: InventoryItem) => {
    setItems(items.filter((item) => item._id !== row._id));
    toast.success("Item deleted successfully");
  };

  return (
    <div>
      <ActionToolbar
        search={search}
        setSearch={setSearch}
        filters={FILTERS}
        activeFilter={filter}
        setActiveFilter={setFilter}
        ctaLabel="Create Order"
        onCTA={handleCreate}
      />
      <DataTable
        columns={COLUMNS}
        data={filteredItems}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No inventory items found"
      />
    </div>
  );
}
