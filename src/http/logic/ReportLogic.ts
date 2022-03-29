import Logic from "./Logic";
import reportRepository from "../repository/ReportRepository";

class ReportLogic extends Logic {
  public management(args: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args, objectSchema.report.management);
      if ("errors" in value) return reject({ result: false, error_code: 3002, errors: value.errors });
      else
        await reportRepository
          .management(value)
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, ...err }));
    });
  }

  public onboarding(args: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args, objectSchema.report.onboarding);
      if ("errors" in value) return reject({ result: false, error_code: 3002, errors: value.errors });
      else
        await reportRepository
          .onboarding(value)
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, ...err }));
    });
  }
}

export default new ReportLogic();
