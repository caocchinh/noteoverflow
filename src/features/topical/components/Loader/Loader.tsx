"use client";
import styles from "./Loader.module.css";

const Loader = () => {
  return (
    <div className="flex h-max w-full items-center justify-center gap-5 bg-transparent ">
      <div
        className={styles.loader}
        style={{ backgroundImage: "transparent" }}
      />
    </div>
  );
};

export default Loader;
