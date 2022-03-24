import Controller from "./Controller";
import { Request, Response } from "express";
import loyaltySchemeLogic from "../logic/LoyaltySchemeLogic";

class LoyaltySchemeController extends Controller {
  public async list(req: Request, res: Response) {
    await loyaltySchemeLogic
      .list(req.body)
      .then((response) => super.resGen({ req, res, result: response.result, data: response.data }))
      .catch((err) =>
        super.resGen({
          req,
          res,
          status: err.code,
          result: err.result,
          error_code: err.error_code,
          error_user_messages: err.errors,
        })
      );
  }

  public async upsert(req: Request, res: Response) {
    await loyaltySchemeLogic
      .upsert(req.body)
      .then((response) => super.resGen({ req, res, result: response.result, data: response.data }))
      .catch((err) =>
        super.resGen({
          req,
          res,
          status: err.code,
          result: err.result,
          error_code: err.error_code,
          error_user_messages: err.errors,
        })
      );
  }
}

export default new LoyaltySchemeController();
