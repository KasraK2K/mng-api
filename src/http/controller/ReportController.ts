import Controller from "./Controller";
import { Request, Response } from "express";
import reportLogic from "../logic/ReportLogic";

class ReportController extends Controller {
  public async management(req: Request, res: Response) {
    await reportLogic
      .management(req.body)
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

export default new ReportController();
