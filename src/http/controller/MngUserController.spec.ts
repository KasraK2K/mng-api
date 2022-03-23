import mngUserController from "./MngUserController";
import mngUserLogic from "../logic/MngUserLogic";
import config from "config";
import { IApplicationConfig } from "../../../config/config.interface";
import { Request, Response } from "express";
import { Request as RequestMock } from "jest-express/lib/request";
import { Response as ResponseMock } from "jest-express/lib/response";

let req: Request;
let res: Response;
const mockEndpoint = "/some-endpoint";
const applicationConfig: IApplicationConfig = config.get("application");
const mode: string = config.get("mode");

describe("MngUserController", () => {
  let controller: typeof mngUserController;

  beforeEach(() => {
    controller = mngUserController;
    req = new RequestMock(mockEndpoint) as any as Request;
    res = new ResponseMock() as any as Response;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.resetModules();
  });

  // ──────────────────────────────────────────────────────────────
  //   :::::: D E F I N E : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────
  it("mngUserController should be defined", () => {
    expect(controller).toBeDefined();
  });

  // ──────────────────────────────────────────────────────────
  //   :::::: L I S T : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────
  describe("mngUserController.list()", () => {
    it("mngUserController.list() should use mngUserLogic.list", async () => {
      // jest.fn(mngUserLogic.list).mockReturnValue(Promise.resolve({ result: true, data: { key: "value" } }));
      
      // jest
      //   .mock("./../logic/MngUserLogic.ts")
      //   .fn(mngUserLogic.list)
      //   .mockReturnValue(Promise.resolve({ result: true, data: { key: "value" } }));
      
      // jest.spyOn(mngUserLogic, "list").mockReturnValue(Promise.resolve({ result: true, data: { key: "value" } }));
     
      // const result = await controller.list(req, res);
    });
  });
});
