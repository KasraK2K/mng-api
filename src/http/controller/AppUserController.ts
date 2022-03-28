import Controller from "./Controller";
import { Request, Response } from "express";
import appUserLogic from "../logic/AppUserLogic";

class AppUserController extends Controller {
  public async list(req: Request, res: Response) {
    await appUserLogic
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

  public async details(req: Request, res: Response) {
    await appUserLogic
      .details(req.body)
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

  public async rewards(req: Request, res: Response) {
    await appUserLogic
      .rewards(req.body)
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

export default new AppUserController();
