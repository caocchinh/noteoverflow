import TopicalClient from "./index";

type SearchParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

//❌ Parallel routes (like @app/page.tsx) should NOT export metadata

export default async function TopicalPage({ searchParams }: SearchParams) {
  return (
    <TopicalClient
      searchParams={await searchParams}
      BETTER_AUTH_URL={process.env.BETTER_AUTH_URL}
    />
  );
}
