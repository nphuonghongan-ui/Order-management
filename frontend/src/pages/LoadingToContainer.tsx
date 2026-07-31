import { useParams, useSearchParams } from "react-router";
import CLPViewer from "./CLPViewer";

export default function LoadingToContainer() {
  const { plId } = useParams<{ plId: string }>();
  const [searchParams] = useSearchParams();
  const autoStart = searchParams.get("auto") === "1";

  if (!plId) return null;
  return <CLPViewer plId={plId} autoStart={autoStart} />;
}
