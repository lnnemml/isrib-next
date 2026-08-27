// Next 16: route params are async and must be awaited.
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="mx-auto max-w-[--container-page] px-8 py-24">
      <h1 className="text-h1 font-bold">"Product: " {slug} " — placeholder"</h1>
    </main>
  );
}
