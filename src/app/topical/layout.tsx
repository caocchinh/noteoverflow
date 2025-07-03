import TopicalLayoutProvider from '../../features/topical/components/TopicalLayoutProvider';

export default function TopicalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TopicalLayoutProvider>{children}</TopicalLayoutProvider>;
}
