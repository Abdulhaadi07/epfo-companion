import { ServiceHandoff } from "@/components/experience/service-handoff";
import { getServiceHandoffLabels } from "@/i18n/localize-views";
import { getTranslator } from "@/i18n/server";

export default async function ClaimStartPage() {
  const { t } = await getTranslator();

  return (
    <ServiceHandoff
      eyebrow={t("claim.start.eyebrow")}
      title={t("claim.start.title")}
      description={t("claim.start.description")}
      nextStepHeading={t("claim.start.nextStepHeading")}
      nextStep={t("claim.start.nextStep")}
      variant="info"
      labels={getServiceHandoffLabels(t)}
    />
  );
}
