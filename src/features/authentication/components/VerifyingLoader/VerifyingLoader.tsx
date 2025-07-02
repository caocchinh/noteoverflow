'use client';
import styles from './VerifyingLoader.module.css';

const VerifyingLoader = () => {
  return (
    <div className="flex h-max w-[300px] items-center justify-center gap-5 bg-cover bg-transparent bg-no-repeat">
      <div
        className={styles.loader}
        style={{ backgroundImage: 'transparent' }}
      />
    </div>
  );
};

export default VerifyingLoader;
