import Logic from "./Logic";
import appUserRepository from "../repository/AppUserRepository";

class AppUserLogic extends Logic {
  public list(args: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args, objectSchema.appUser.list);
      if ("errors" in value) return reject({ result: false, error_code: 3002, errors: value.errors });
      else
        await appUserRepository
          .list(args)
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, err }));
    });
  }

  public details(args: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args, objectSchema.appUser.details);
      if ("errors" in value) return reject({ result: false, error_code: 3002, errors: value.errors });
      else
        await appUserRepository
          .details(args)
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, err }));
    });
  }

  public rewards(args: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args, objectSchema.appUser.rewards);
      if ("errors" in value) return reject({ result: false, error_code: 3002, errors: value.errors });
      else
        await appUserRepository
          .rewards(args)
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, err }));
    });
  }

  public claims(args: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args, objectSchema.appUser.claims);
      if ("errors" in value) return reject({ result: false, error_code: 3002, errors: value.errors });
      else
        await appUserRepository
          .claims(args)
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, err }));
    });
  }

  public points(args: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(args, objectSchema.appUser.points);
      if ("errors" in value) return reject({ result: false, error_code: 3002, errors: value.errors });
      else
        await appUserRepository
          .points(args)
          .then((response) => resolve({ result: true, data: response }))
          .catch((err) => reject({ result: false, err }));
    });
  }
}

export default new AppUserLogic();
