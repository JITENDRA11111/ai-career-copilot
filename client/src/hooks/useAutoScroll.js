import { useEffect, useRef, useState } from "react";

const useAutoScroll = (
  dependency,
  options = {
    behavior: "smooth",
    block: "end",
  }
) => {

  const bottomRef = useRef(null);

  const containerRef = useRef(null);

  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {

    if (autoScroll) {

      bottomRef.current?.scrollIntoView(options);

    }

  }, [dependency, autoScroll]);

  useEffect(() => {

    const container = containerRef.current;

    if (!container) return;

    const handleScroll = () => {

      const threshold = 100;

      const isNearBottom =
        container.scrollHeight -
          container.scrollTop -
          container.clientHeight <
        threshold;

      setAutoScroll(isNearBottom);

    };

    container.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {

      container.removeEventListener(
        "scroll",
        handleScroll
      );

    };

  }, []);

  return {
    containerRef,
    bottomRef,
    autoScroll,
  };

};

export default useAutoScroll;