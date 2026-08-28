import { PageContainer } from "@/components/layout/page-container";

export default function Home() {
  return (
    <PageContainer className="flex min-h-[60vh] items-center py-16 sm:py-24">
      <section className="space-y-5">
        <p className="eyebrow">
          EPFO COMPANION
        </p>
        <h1 className="text-display max-w-3xl">
          Application foundation ready.
        </h1>
        <p className="text-body-lg max-w-2xl">
          This independent prototype will help citizens understand EPFO-related
          journeys in clear, guided steps.
        </p>
        <p className="text-body-sm max-w-xl">
          Prototype only. It uses synthetic data and is not an official EPFO
          product.
        </p>
      </section>
    </PageContainer>
  );
}
