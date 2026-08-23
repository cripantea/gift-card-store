import { isCassaSessionValid } from "@/lib/cassaAuth";
import { PinGate } from "@/components/cassa/PinGate";
import { CassaPortal } from "@/components/cassa/CassaPortal";

export const runtime = "nodejs";

export default async function CassaPage() {
  const isAuthenticated = await isCassaSessionValid();

  return isAuthenticated ? <CassaPortal /> : <PinGate />;
}
