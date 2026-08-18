import LpMaluBase from "@/components/LpMaluBase";
import { useBackRedirect } from "@/hooks/useBackRedirect";
import { LP_VARIANTS } from "@/lib/lpVariants";

// LP Malu principal · design V2.
const LpMalu = () => {
  useBackRedirect("https://malu.afiliadosbrasil.top/back-redirect-27");

  return <LpMaluBase variant={LP_VARIANTS.malu} />;
};

export default LpMalu;
