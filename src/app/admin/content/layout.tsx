import Navigation from "@/features/admin/content/components/Navigation";

const ContentLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="flex items-start justify-start w-full pb-4 flex-col">
        <Navigation />
      </div>
      {children}
    </>
  );
};

export default ContentLayout;
