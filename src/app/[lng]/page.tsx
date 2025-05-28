import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-24">
      <Image
        src="/assets/logo-full-colorised.png"
        alt="Note Overflow"
        width={500}
        height={500}
      />
    </div>
  );
}
