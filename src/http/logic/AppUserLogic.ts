import Logic from "./Logic";
import appUserRepository from "../repository/AppUserRepository";
import pointRepository from "../repository/PointRepository";
import claimRepository from "../repository/ClaimRepository";
import rewardRepository from "../repository/RewardRepository";

class AppUserLogic extends Logic {
  public list(args: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args, objectSchema.appUser.list);
      if ("errors" in value) return reject({ result: false, error_code: 3002, errors: value.errors });
      else
        await appUserRepository
          .list({ summary: true })
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, ...err }));
    });
  }

  public details(args: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args, objectSchema.appUser.details);
      if ("errors" in value) return reject({ result: false, error_code: 3002, errors: value.errors });
      else {
        await appUserRepository
          .list({
            id: args.id,
          })
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, ...err }));
      }
    });
  }

  public rewards(args: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args, objectSchema.rewards);
      if ("errors" in value) return reject({ result: false, error_code: 3002, errors: value.errors });
      else {
        const user_id = "user_id" in args ? parseInt(args.user_id) || 0 : 0;
        await rewardRepository
          .list({ user_id })
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, ...err }));
      }
    });
  }

  public claims(args: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args, objectSchema.claims);
      if ("errors" in value) return reject({ result: false, error_code: 3002, errors: value.errors });
      else {
        const user_id = "user_id" in args ? parseInt(args.user_id) || 0 : 0;
        await claimRepository
          .list({ user_id })
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, ...err }));
      }
    });
  }

  public points(args: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args, objectSchema.points);
      if ("errors" in value) return reject({ result: false, error_code: 3002, errors: value.errors });
      else {
        const user_id = "user_id" in args ? parseInt(args.user_id) || 0 : 0;
        await pointRepository
          .list({ user_id })
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, ...err }));
      }
    });
  }
}

export default new AppUserLogic();
