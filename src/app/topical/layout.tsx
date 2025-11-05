import AppWrapper from "@/features/topical/components/AppWrapper";
import TopicalLayoutProvider from "../../features/topical/components/TopicalLayoutProvider";

export default function TopicalLayout({
  children,
  app,
}: {
  children: React.ReactNode;
  app: React.ReactNode;
}) {
  return (
    <TopicalLayoutProvider>
      <AppWrapper>{app}</AppWrapper>
      {children}
    </TopicalLayoutProvider>
  );
}
