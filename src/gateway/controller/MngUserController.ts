import Controller from "./Controller";
import { Request, Response } from "express";

class MngUserController extends Controller {
  public async create(req: Request, res: Response) {
    return res.json({ params: res.locals.params });
  }
}

export default new MngUserController();