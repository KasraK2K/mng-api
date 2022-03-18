import Controller from "./Controller";
import { Request, Response } from "express";
import mngUserLogic from "../logic/MngUserLogic";

class MngUserController extends Controller {
  public async list(req: Request, res: Response) {
    await mngUserLogic
      .list(res.locals.params)
      .then((response) => super.resGen({ req, res, result: response.result, data: response.data }))
      .catch((err) =>
        super.resGen({
          req,
          res,
          status: 200,
          result: err.result,
          error_code: err.error_code ?? 3000,
          error_user_messages: err.errors ?? [],
        })
      );
  }

  public async upsert(req: Request, res: Response) {
    await mngUserLogic
      .upsert(res.locals.params)
      .then((response) => super.resGen({ req, res, result: response.result, data: response.data }))
      .catch((err) =>
        super.resGen({
          req,
          res,
          status: err.code ?? 401,
          result: err.result,
          error_code: err.error_code ?? 3000,
          error_user_messages: err.errors ?? [],
        })
      );
  }
}

export default new MngUserController();
