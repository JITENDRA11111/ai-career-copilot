import express from "express";

import auth from "../middleware/authMiddleware.js";

import {
    generate,
    regenerate,
    save,
    list,
} from "../controllers/coverLetter.controller.js";

const router = express.Router();

router.post(
    "/generate",
    auth,
    generate
);

router.post(
    "/regenerate",
    auth,
    regenerate
);

router.post(
    "/save",
    auth,
    save
);

router.get(
    "/list",
    auth,
    list
);

export default router;