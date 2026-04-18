import type { RequestHandler } from "express";
import { trackProductClick, trackProductView } from "../services/eventService.js";
import { httpStatus } from "../utils/httpStatus.js";
import { validateTrackEventInput } from "../validators/event.validation.js";
export const trackViewController: RequestHandler = async (req, res) => {
  const userId = req.auth?.userId ?? null;
  const input = validateTrackEventInput(req.body);
  const interaction = await trackProductView(userId, input);

  res.status(httpStatus.created).json({
    success: true,
    data: { interaction },
  });
};

export const trackClickController: RequestHandler = async (req, res) => {
  const userId = req.auth?.userId ?? null;
  const input = validateTrackEventInput(req.body);
  const interaction = await trackProductClick(userId, input);

  res.status(httpStatus.created).json({
    success: true,
    data: { interaction },
  });
};
