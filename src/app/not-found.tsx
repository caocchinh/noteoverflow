import FuzzyText from '@/components/animation/FuzzyText';

const NotFound = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-3">
      <FuzzyText
        baseIntensity={0.1}
        color="orange"
        fontSize="100px"
        fontWeight={900}
        hoverIntensity={0.2}
      >
        404
      </FuzzyText>
      <FuzzyText
        baseIntensity={0.1}
        color="orange"
        fontSize="40px"
        fontWeight={900}
        hoverIntensity={0.2}
      >
        not found
      </FuzzyText>
    </div>
  );
};

export default NotFound;
