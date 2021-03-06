//=======================================================
//
//  #####     #####   ##   ##  ######  #####  #####
//  ##  ##   ##   ##  ##   ##    ##    ##     ##  ##
//  #####    ##   ##  ##   ##    ##    #####  #####
//  ##  ##   ##   ##  ##   ##    ##    ##     ##  ##
//  ##   ##   #####    #####     ##    #####  ##   ##
//
//=======================================================

import express from "express";
import path from "path";
import fs from "fs";
import Controller from "../controller/Controller";
import homeController from "../controller/HomeController";
import authController from "../controller/AuthController";
import informationController from "../controller/InformationController";
import mngUserController from "../controller/MngUserController";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../../swagger";
import venueController from "../controller/VenueController";
import loyaltySchemeController from "../controller/LoyaltySchemeController";
import offerController from "../controller/OfferController";
import appUserController from "../controller/AppUserController";
import reportController from "../controller/ReportController";

const swaggerOptions = {
  explorer: true,
  swaggerOptions: { validatorUrl: null },
  customCss: fs.readFileSync(path.join(__dirname, "../../swagger/css/feeling-blue.css"), "utf8"),
};

const router = express.Router();

router.post("/", homeController.index);
router.post("/shake-hand", informationController.info);

// ─── MANAGER USERS ──────────────────────────────────────────────────────────────
router.post("/mng-users/list", mngUserController.list);
router.post("/mng-users/upsert", mngUserController.upsert);

// ─── VENUES ─────────────────────────────────────────────────────────────────────
router.post("/venues/list", venueController.list);
router.post("/venues/upsert", venueController.upsert);

// ─── LOYALTY SCHEME ─────────────────────────────────────────────────────────────
router.post("/schemes/list", loyaltySchemeController.list);
router.post("/schemes/upsert", loyaltySchemeController.upsert);

// ─── LOYALTY SCHEME ─────────────────────────────────────────────────────────────
router.post("/offers/list", offerController.list);
router.post("/offers/upsert", offerController.upsert);

// ─── APP USER ───────────────────────────────────────────────────────────────────
router.post("/app-users/list", appUserController.list);
router.post("/app-users/details", appUserController.details);
router.post("/app-users/rewards", appUserController.rewards);
router.post("/app-users/claims", appUserController.claims);
router.post("/app-users/points", appUserController.points);

// ─── REPORT ─────────────────────────────────────────────────────────────────────
router.post("/reports/sites-statistics-amount", reportController.management);
router.post("/reports/onboarding", reportController.onboarding);

// ─── AUTHORIZATION ──────────────────────────────────────────────────────────────
router.post("/login", authController.login);

// ─── SWAGGER ────────────────────────────────────────────────────────────────────
router.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// ─── 404 ────────────────────────────────────────────────────────────────────────
router.use("*", (req, res) => {
  return new Controller().resGen({
    req,
    res,
    status: 404,
    result: false,
    error_code: 3001,
  });
});

export default router;
