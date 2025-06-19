import { ReactNode, useState } from "react";

function useMultistepForm(steps: ReactNode[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  function next() {
    setCurrentIndex((i) => {
      if (i < steps.length - 1) {
        return i + 1;
      } else {
        return i;
      }
    });
  }
  function back() {
    setCurrentIndex((i) => {
      if (i <= 0) return 0;
      else return i - 1;
    });
  }
  function goTo(index: number) {
    setCurrentIndex(index);
  }
  return {
    currentIndex,
    step: steps[currentIndex],
    isFirstIndex: currentIndex === 0,
    isLastIndex: currentIndex === steps.length - 1,
    back,
    next,
    goTo,
  };
}

export default useMultistepForm;
