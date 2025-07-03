'use client';

import { Bookmark, FileClock, LayoutDashboard } from 'lucide-react';
import Dock from './Dock';

const DockWrapper = () => {
  return (
    <Dock
      baseItemSize={30}
      items={[
        {
          icon: <LayoutDashboard className="!text-white" size={18} />,
          label: 'App',
          onClick: () => {
            return;
          },
        },
        {
          icon: <FileClock className="!text-white" size={18} />,
          label: 'Recently viewed',
          onClick: () => {
            return;
          },
        },
        {
          icon: <Bookmark className="!text-white" size={18} />,
          label: 'Bookmark',
          onClick: () => {
            return;
          },
        },
      ]}
      magnification={50}
      panelHeight={30}
    />
  );
};

export default DockWrapper;
