import { ServiceHandoff } from "@/components/experience/service-handoff";
import { getServiceHandoffLabels } from "@/i18n/localize-views";
import { getTranslator } from "@/i18n/server";

export default async function EmploymentHistoryPage() {
  const { t } = await getTranslator();

  return (
    <ServiceHandoff
      eyebrow="Check employment history"
      title="See the jobs linked to your PF"
      description="This future service will help you review employment history in a way that supports the PF task you are trying to complete."
      nextStep="Employment history is not implemented in this prototype yet. No live employment records are accessed or displayed."
      labels={getServiceHandoffLabels(t)}
    />
  );
}
