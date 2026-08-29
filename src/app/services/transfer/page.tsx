import { ServiceHandoff } from "@/components/experience/service-handoff";
import { getServiceHandoffLabels } from "@/i18n/localize-views";
import { getTranslator } from "@/i18n/server";

export default async function TransferPage() {
  const { t } = await getTranslator();

  return (
    <ServiceHandoff
      eyebrow="Transfer my PF"
      title="Move your PF when you change jobs"
      description="This future service will explain the transfer process in terms of your work history and what you want to do next."
      nextStep="The transfer service is not implemented in this prototype yet. It does not connect to an official service or move any real PF balance."
      labels={getServiceHandoffLabels(t)}
    />
  );
}
