import { useTopicalApp } from "../context/TopicalLayoutProvider";
import { ReactNode } from "react";

const Masonry = ({ children }: { children: ReactNode }) => {
  const { uiPreferences } = useTopicalApp();
  return (
    <div
      style={{
        columnGap: "10px",
        columnWidth: "260px",
        columnCount: uiPreferences.numberOfColumns,
        width: "100%",
      }}
    >
      {children}
    </div>
  );
};

export default Masonry;
