import SearchClient from "./index";

type SearchParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SearchPage({ searchParams }: SearchParams) {
  return <SearchClient searchParams={await searchParams} />;
}
