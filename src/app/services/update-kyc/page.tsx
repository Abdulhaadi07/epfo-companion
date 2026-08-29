import { ServiceHandoff } from "@/components/experience/service-handoff";
import { getServiceHandoffLabels } from "@/i18n/localize-views";
import { getTranslator } from "@/i18n/server";

export default async function UpdateKycPage() {
  const { t } = await getTranslator();

  return (
    <ServiceHandoff
      eyebrow="Update my KYC"
      title="Keep your details ready for a claim"
      description="This future service will help you understand which personal and account details may need attention before you start a PF task."
      nextStep="The KYC update service is not implemented in this prototype yet. No identity documents or personal details are collected here."
      labels={getServiceHandoffLabels(t)}
    />
  );
}
