import Logic from "./Logic";
import userRepository from "../repository/UserRepository";
import bcrypt from "bcryptjs";
import { LoggerEnum } from "../../common/enums/logger.enum";
import jwt from "jsonwebtoken";

class UserLogic extends Logic {
  async login(params: Record<string, any>): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const value = objectValidator(params, objectSchema.login);
      if ("errors" in value) return reject({ result: false, errors: value.errors });

      let userList: Record<string, any>[] = [];

      await userRepository
        .listUser({ email: value.email })
        .then((response) => {
          userList = response;
        })
        .catch((err) => {
          logger(`{red} error login {reset}`);
          logger(err.stack, LoggerEnum.ERROR);
          reject({ result: false, err });
        });

      // ────────────────────────────────────────────── USER FOUNDED ─────
      if (userList.length > 0) {
        const user = userList[0];
        const hashPassword = user.password;
        const user_id = user.id;
        const compareResult = bcrypt.compareSync(value.password, hashPassword);
        if (compareResult) {
          logger(`user ${value.email} logged in`, LoggerEnum.INFO);
          const token = jwt.sign({ user_id }, process.env.JWT_SECRET ?? "", {
            expiresIn: "2y",
          });
          user.token = token;
          delete user.password;
          resolve({ result: true, data: [user] });
        }
        // ──────────────────────────────────────────── WRONG PASSWORD ─────
        else {
          logger(`password is invalid for email ${user.email}`, LoggerEnum.ERROR);
          reject({ result: false, error_code: 3004 });
        }
      } else {
        logger(`user with email ${value.email} not found`, LoggerEnum.ERROR);
        reject({ result: false, error_code: 3004 });
      }
    });
  }
}

export default new UserLogic();
