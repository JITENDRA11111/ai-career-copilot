import { useState, useRef, useCallback, useEffect } from "react";

import { streamReview } from "../api/reviewApi";

export const useReviewStream = () => {
  /* -------------------------------------------------------------------------- */
  /* State */
  /* -------------------------------------------------------------------------- */

  const [isStreaming, setIsStreaming] = useState(false);

  const [connected, setConnected] = useState(false);

  const [progress, setProgress] = useState(0);

  const [step, setStep] = useState("");

  const [chunks, setChunks] = useState("");

  const [review, setReview] = useState(null);

  const [error, setError] = useState(null);

  /* -------------------------------------------------------------------------- */
  /* Abort Controller */
  /* -------------------------------------------------------------------------- */

  const controllerRef = useRef(null);

  /* -------------------------------------------------------------------------- */
  /* Start Streaming */
  /* -------------------------------------------------------------------------- */

  const startReview = useCallback(
    async (resumeId, token) => {
      if (isStreaming) return;

      controllerRef.current = new AbortController();

      setConnected(false);
      setProgress(0);
      setStep("");
      setChunks("");
      setReview(null);
      setError(null);
      setIsStreaming(true);

      try {
        await streamReview({
          resumeId,

          token,

          signal: controllerRef.current.signal,

          onConnected: () => {
            setConnected(true);
          },

          onProgress: (data) => {
            setStep(data.step);
            setProgress(data.progress);
          },

          onChunk: (data) => {
            setChunks((prev) => prev + data.text);
            setProgress((prev) => {
              if (prev >= 20 && prev < 90) {
                return prev + (Math.random() * 0.8);
              }
              return prev;
            });
          },

          onComplete: (data) => {
            setReview(data.review);

            setProgress(100);

            setStep("Completed");

            setIsStreaming(false);
          },

          onError: (err) => {
            setError(
              err.message || "Streaming failed"
            );

            setIsStreaming(false);
          },
        });
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("Streaming cancelled");
        } else {
          setError(err.message);
        }

        setIsStreaming(false);
      }
    },
    [isStreaming]
  );

  /* -------------------------------------------------------------------------- */
  /* Cancel Stream */
  /* -------------------------------------------------------------------------- */

  const stopReview = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    setIsStreaming(false);
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Cleanup on Unmount */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Exposed API */
  /* -------------------------------------------------------------------------- */

  return {
    connected,

    isStreaming,

    progress,

    step,

    chunks,

    review,

    error,

    startReview,

    stopReview,
  };
};