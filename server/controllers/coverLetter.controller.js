import CoverLetter from "../models/CoverLetter.js";

import {
  generateCoverLetter,
  regenerateCoverLetter,
} from "../services/coverLetterService.js";

export const generate = async (req, res) => {

    try {

        const {
            resumeId,
            jobTitle,
            company,
            jobDescription,
            tone,
        } = req.body;

        const result = await generateCoverLetter({
            resumeId,
            jobTitle,
            company,
            jobDescription,
            tone,
        });

        return res.json(result);

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

export const regenerate = async (req, res) => {

    try {

        const {
            coverId,
            feedback,
        } = req.body;

        const cover = await CoverLetter.findById(coverId);

        if (!cover)
            return res.status(404).json({
                message: "Cover letter not found",
            });

        const result = await regenerateCoverLetter({
  previousContent: cover.content,
  feedback,
});

        cover.content = result.text;
        cover.htmlContent = result.html;
        cover.version += 1;

        await cover.save();

        res.json(result);

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });
    }
};

export const save = async (req, res) => {

    try {

        const cover = await CoverLetter.create({

            userId: req.user.id,

            resumeId: req.body.resumeId,

            jobTitle: req.body.jobTitle,

            company: req.body.company,

            content: req.body.content,

            htmlContent: req.body.htmlContent,

            tone: req.body.tone,
        });

        res.status(201).json(cover);

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });
    }
};

export const list = async (req, res) => {

    try {

        const covers = await CoverLetter.find({
            userId: req.user.id,
        }).sort({
            createdAt: -1,
        });

        res.json(covers);

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });
    }
};