import { fetchEventSource } from "@microsoft/fetch-event-source";

const API_URL =
  import.meta.env.VITE_API_URL ||
  `${import.meta.env.VITE_API_URL}`;

/* -------------------------------------------------------------------------- */
/* Stream Resume Review */
/* -------------------------------------------------------------------------- */

export const streamReview = ({
  resumeId,
  token,
  onConnected,
  onProgress,
  onChunk,
  onComplete,
  onError,
  signal,
}) => {
  return fetchEventSource(
    `${API_URL}/resume/${resumeId}/review/stream`,
    {
      method: "POST",

      signal,

      headers: {
        Authorization: `Bearer ${token}`,

        Accept: "text/event-stream",
      },

      async onopen(response) {
        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        console.log(
          "SSE Connection Opened"
        );
      },

      onmessage(event) {

        const data = JSON.parse(event.data);

        switch (event.event) {

          case "connected":

            onConnected?.(data);

            break;

          case "progress":

            onProgress?.(data);

            break;

          case "chunk":

            onChunk?.(data);

            break;

          case "complete":

            onComplete?.(data);

            break;

          case "error":

            onError?.(data);

            break;

          default:

            console.log(
              "Unknown SSE Event:",
              event.event
            );

        }

      },

      onclose() {

        console.log(
          "SSE Connection Closed"
        );

      },

      onerror(err) {

        console.error(err);

        onError?.({
          message:
            err.message ||
            "Streaming failed",
        });

        throw err;

      },

    }
  );
};