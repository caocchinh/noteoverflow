// Force dynamic rendering to prevent caching issues with parallel routes
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Default() {
  return null;
}
