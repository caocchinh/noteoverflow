"use client";
import styles from "./VerifyingLoader.module.css";

const VerifyingLoader = () => {
  return (
    <div className="w-[300px] h-max  flex items-center gap-5 justify-center bg-transparent bg-no-repeat bg-cover">
      <div
        className={styles.loader}
        style={{ backgroundImage: `transparent` }}
      />
    </div>
  );
};

export default VerifyingLoader;
