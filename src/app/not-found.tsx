import FuzzyText from "@/components/animation/FuzzyText";

const NotFound = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center flex-col gap-3">
      <FuzzyText
        fontSize="100px"
        fontWeight={900}
        baseIntensity={0.1}
        hoverIntensity={0.2}
        color="orange"
      >
        404
      </FuzzyText>
      <FuzzyText
        fontSize="40px"
        fontWeight={900}
        baseIntensity={0.1}
        hoverIntensity={0.2}
        color="orange"
      >
        not found
      </FuzzyText>
    </div>
  );
};

export default NotFound;
