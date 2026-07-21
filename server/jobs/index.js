import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";

import { resumeParseQueue } from "./queues.js";

// Import processors so they register to listen on the queues
import "./processors/resumeProcessor.js";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/api/admin/queues");

createBullBoard({
  queues: [
    new BullAdapter(resumeParseQueue)
  ],
  serverAdapter: serverAdapter
});

export const bullBoardRouter = serverAdapter.getRouter();
