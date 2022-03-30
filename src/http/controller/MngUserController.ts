import Controller from "./Controller";
import { Request, Response } from "express";
import mngUserLogic from "../logic/MngUserLogic";

class MngUserController extends Controller {
  public async list(req: Request, res: Response) {
    await mngUserLogic
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
    await mngUserLogic
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

export default new MngUserController();
