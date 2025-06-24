import Navigation from "@/features/admin/components/Navigation";
import { UPLOAD_NAVIGATION_ITEMS } from "@/features/admin/constants/constants";

const ContentLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="flex items-start justify-start w-full pb-4 flex-col">
        <Navigation items={UPLOAD_NAVIGATION_ITEMS} />
      </div>
      {children}
    </>
  );
};

export default ContentLayout;
