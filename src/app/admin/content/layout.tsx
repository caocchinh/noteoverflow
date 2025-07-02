import Navigation from '@/features/admin/components/Navigation';
import { UPLOAD_NAVIGATION_ITEMS } from '@/features/admin/constants/constants';

const ContentLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="flex w-full flex-col items-start justify-start pb-4">
        <Navigation items={UPLOAD_NAVIGATION_ITEMS} />
      </div>
      {children}
    </>
  );
};

export default ContentLayout;
