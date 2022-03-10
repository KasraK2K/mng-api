import Controller from "./Controller";
import config from "config";
import { IApplicationConfig } from "@/../config/config.interface";
import { Request, Response } from "express";
import { Request as RequestMock } from "jest-express/lib/request";
import { Response as ResponseMock } from "jest-express/lib/response";

let req: Request;
let res: Response;
const mockEndpoint = "/some-endpoint";
const applicationConfig: IApplicationConfig = config.get("application");
const mode: string = config.get("mode");

describe("Controller", () => {
  let controller: Controller;

  beforeEach(() => {
    controller = new Controller();
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
  it("Controller should be defined", () => {
    expect(controller).toBeDefined();
  });

  // ──────────────────────────────────────────────────────────────
  //   :::::: L O G G E R : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────
  it("Controller.logger() should log", () => {
    const logSpy = jest.spyOn(console, "log");

    controller.logger();
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith("Log from Controller");
  });

  // ──────────────────────────────────────────────────────────────
  //   :::::: R E S G E N : :  :   :    :     :        :          :
  // ──────────────────────────────────────────────────────────────
  describe("Controller.resGen()", () => {
    it("Controller.resGen() should use responseGenerator", () => {
      const result = controller.resGen({
        req,
        res,
        result: true,
        data: { key: "value" },
      }) as any;

      expect(result).toBe(res);
      expect(result.statusCode).toBe(200);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(result.body).toEqual({
        api_version: applicationConfig.api_version,
        front_version: applicationConfig.front_version,
        endpoint: mockEndpoint,
        env: process.env.NODE_ENV,
        mode: mode,
        result: true,
        data: { key: "value" },
      });
    });

    it("Controller.resGen() should use errorGenerator", () => {
      const result = controller.resGen({
        req,
        res,
        status: 500,
        result: false,
        error_code: 1,
        error_user_messages: ["some error"],
      }) as any;

      expect(result).toBe(res);
      expect(result.statusCode).toBe(500);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(result.body).toEqual({
        api_version: applicationConfig.api_version,
        front_version: applicationConfig.front_version,
        endpoint: mockEndpoint,
        env: process.env.NODE_ENV,
        mode: mode,
        result: false,
        error_code: 1,
        error_message: "Error code not found",
        error_user_messages: ["some error"],
      });
    });
  });
});
