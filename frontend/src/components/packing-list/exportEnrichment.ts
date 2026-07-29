import { listPartNums, type PartNumOption } from "@/lib/apis/partNumApi";

export async function getPartNumDimensions(): Promise<
  Map<string, { length: number; width: number; height: number }>
> {
  const cached = sessionStorage.getItem("partNums");
  let items: PartNumOption[];
  if (cached) {
    try {
      items = JSON.parse(cached) as PartNumOption[];
    } catch {
      sessionStorage.removeItem("partNums");
      items = await listPartNums();
      sessionStorage.setItem("partNums", JSON.stringify(items));
    }
  } else {
    items = await listPartNums();
    sessionStorage.setItem("partNums", JSON.stringify(items));
  }
  return new Map(
    items.map((p) => [p.partNum, p.dimension])
  );
}
