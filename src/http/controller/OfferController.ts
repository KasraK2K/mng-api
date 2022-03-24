import Controller from "./Controller";
import { Request, Response } from "express";
import offerLogic from "../logic/OfferLogic";

class OfferController extends Controller {
  public async list(req: Request, res: Response) {
    await offerLogic
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
    await offerLogic
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

export default new OfferController();
