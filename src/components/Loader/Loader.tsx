"use client";
import styles from "./Loader.module.css";

const Loader = () => {
  return (
    <div className="w-full h-screen  flex items-center gap-5 justify-center bg-transparent ">
      <div
        className={styles.loader}
        style={{ backgroundImage: `transparent` }}
      />
    </div>
  );
};

export default Loader;
