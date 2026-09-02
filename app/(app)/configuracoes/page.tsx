import { getConfigLists } from "@/lib/config-lists-data";
import { getUsageSummary } from "@/lib/usage";
import { ConfigView } from "@/components/config/ConfigView";

export default async function ConfiguracoesPage() {
  const [{ frentes, wlabels, statusTarefa, statusDemanda, pessoasFull }, usage] = await Promise.all([
    getConfigLists(),
    getUsageSummary(),
  ]);

  return (
    <ConfigView
      frentes={frentes}
      wlabels={wlabels}
      statusTarefa={statusTarefa}
      statusDemanda={statusDemanda}
      pessoas={pessoasFull}
      usage={usage}
    />
  );
}
