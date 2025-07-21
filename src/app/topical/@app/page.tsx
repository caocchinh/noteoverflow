import TopicalClient from "./index";

type SearchParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function TopicalPage({ searchParams }: SearchParams) {
  return <TopicalClient searchParams={await searchParams} />;
}
