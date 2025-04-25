import { Router } from "express";
import { redirectToTink, handleCallback, userData } from "../controller/tinkController";
const router = Router();

router.get("/connect", redirectToTink);
router.get("/callback", handleCallback);
// router.get("/subscription",fetchSubscriptions)
router.get("/userdata",userData)

export default router;
