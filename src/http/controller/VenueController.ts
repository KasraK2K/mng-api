import Controller from "./Controller";
import { Request, Response } from "express";
import venueLogic from "../logic/VenueLogic";

class VenueController extends Controller {
  public async list(req: Request, res: Response) {
    await venueLogic
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
    await venueLogic
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

export default new VenueController();
