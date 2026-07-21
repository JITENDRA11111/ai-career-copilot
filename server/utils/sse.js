/* -------------------------------------------------------------------------- */
/* Server-Sent Events Helper */
/* -------------------------------------------------------------------------- */

const DEFAULT_HEARTBEAT = 30000; // 30 seconds

export class SSEConnection {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.closed = false;
    this.heartbeat = null;

    this.initialize();
  }

  /* ---------------------------------------------------------------------- */
  /* Initialize SSE Headers */
  /* ---------------------------------------------------------------------- */

  initialize() {
    this.res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": process.env.CLIENT_URL || "*",
      "Access-Control-Allow-Credentials": "true",
    });

    // Flush headers immediately
    if (this.res.flushHeaders) {
      this.res.flushHeaders();
    }

    // Initial connection event
    this.sendEvent("connected", {
      success: true,
      message: "SSE Connected",
      timestamp: new Date().toISOString(),
    });

    this.startHeartbeat();

    // Cleanup on client disconnect
    this.req.on("close", () => {
      console.log("🔌 SSE client disconnected");
      this.close();
    });

    this.req.on("end", () => {
      this.close();
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Send Event */
  /* ---------------------------------------------------------------------- */

  sendEvent(event, data) {
    if (this.closed) return;

    this.res.write(`event: ${event}\n`);
    this.res.write(`data: ${JSON.stringify(data)}\n\n`);

    if (this.res.flush) {
      this.res.flush();
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Send Text Chunk */
  /* ---------------------------------------------------------------------- */

  sendChunk(chunk) {
    if (this.closed) return;

    this.sendEvent("chunk", {
      text: chunk,
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Progress Event */
  /* ---------------------------------------------------------------------- */

  sendProgress(step, progress) {
    this.sendEvent("progress", {
      step,
      progress,
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Complete */
  /* ---------------------------------------------------------------------- */

  complete(data) {
    this.sendEvent("complete", data);
    this.close();
  }

  /* ---------------------------------------------------------------------- */
  /* Error */
  /* ---------------------------------------------------------------------- */

  sendError(error) {
    this.sendEvent("error", {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : String(error),
    });

    this.close();
  }

  /* ---------------------------------------------------------------------- */
  /* Heartbeat */
  /* ---------------------------------------------------------------------- */

  startHeartbeat() {
    this.heartbeat = setInterval(() => {
      if (this.closed) return;

      this.res.write(": heartbeat\n\n");
    }, DEFAULT_HEARTBEAT);
  }

  /* ---------------------------------------------------------------------- */
  /* Close */
  /* ---------------------------------------------------------------------- */

  close() {
    if (this.closed) return;

    this.closed = true;

    if (this.heartbeat) {
      clearInterval(this.heartbeat);
    }

    this.res.end();
  }
}