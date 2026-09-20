import { useSiteState } from "@/hooks/useSiteState";
import SiteLayout from "@/components/site/SiteLayout";
import PublicPages from "@/components/site/PublicPages";
import CabinetPage from "@/components/site/CabinetPage";

// ════════════════════════════════════════════════════════════
export default function Index() {
  const s = useSiteState();

  return (
    <SiteLayout s={s}>
      <PublicPages {...s} />
      <CabinetPage {...s} />
    </SiteLayout>
  );
}
