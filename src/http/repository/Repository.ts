import { IReadTable } from "../../common/interfaces/repository";
import { Pool, PoolClient } from "pg";
import { LoggerEnum } from "../../common/enums/logger.enum";
import _ from "lodash";

// `SELECT $1::text, $2::integer, $3::boolean FROM $4 WHERE $5`, [1, 2, 3, 4, 5];
// `INSERT INTO $1 (id, name, email, access) VALUES ($2, $3, $4, $5) RETURNING id`, [1, 2, 3, 4, 5];

class Repository {
  protected async readTable(args: IReadTable, source: Pool = pg.pool_main): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { fields, where, table, order, limit, group } = Repository.sanitizeArgs(args);
      const list: Record<string, any>[] = [];
      const query = `select ${fields} from ${table} ${where} ${order} ${group} ${limit}`;

      await this.executeQuery({ query, source })
        .then((qres) => {
          qres?.rows?.forEach((row: Record<string, any>) => {
            list.push(row);
          });
          resolve(list);
        })
        .catch((err) => {
          logger(`{red} error readTable {reset}`);
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          reject(err);
        });
    });
  }

  protected getUpsertQuery(data: Record<string, any>, schema: Record<string, any>): string {
    /*
    data : {
      id: 1,
      name: 'kasra',
      family_name: 'karami',
      address: {
        line1: "38 Raven"
        postcode: "sw62gn"
      }
    }

    schema = {
      table_name: `"Users"`,
      checking_data_field: 'user_id',
      table_id: 'id',
      returning: 'id',
      fields:{
        name (database field):{ field:'name' } (data field), 
        surname:{ field:'family_name'} ,
        address: {field:'address', is_json:true}
      }
    }
    */
    const checking_data_field = schema.checking_field || "id";
    const table_id = schema.table_id || "id";
    const table_name = schema.table_name || "";
    const fields: Record<string, any> = schema.fields || {};
    const keys: string[] = [];
    const values: string[] = [];
    const updates: string[] = [];
    let query = "";

    _.keys(fields).forEach((key) => {
      const fieldObject = fields[key]; // { field:'name' }
      let val = data[fieldObject.field] || "0";

      if (fieldObject.is_json) val = ` '${JSON.stringify(val)}' `;
      else if (fieldObject.is_array) val = ` '{${val}}' `;
      else val = ` '${val}' `;

      keys.push(` "${key}" `); // ['name', 'surname', 'address']
      values.push(val); // ['kasra','karami']
      updates.push(` "${key}" = ${val} `); // [` name = 'kasra' `, ` surname = 'karami' `]
    });

    if (Number(data[checking_data_field]) === 0) {
      query = `INSERT INTO ${table_name} (${keys.join(" , ")}) VALUES (${values.join(" , ")})`;
      if (schema.returning) query += ` RETURNING ${schema.returning}`;
    } else {
      query = `UPDATE ${table_name} SET ${updates.join(",")} WHERE "${table_id}" = ${data[checking_data_field]}`;
    }
    return query;
  }

  private static sanitizeArgs(args: IReadTable): IReadTable {
    args.fields = args.fields || "*";
    args.where = args.where && args.where.length ? ` WHERE ${args.where} ` : "";
    args.table = args.table || "";
    args.order = args.order && args.order.length ? ` ORDER BY ${args.order} ` : "";
    args.limit = args.limit && Number(args.limit) ? ` LIMIT ${args.limit} ` : "";
    args.group = args.group && args.group.length ? ` GROUP BY ${args.group} ` : "";
    return args;
  }

  protected executeQuery(args: { query: string; source: Pool }): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { source, query = "" } = args;

      await source
        .connect()
        .then((client: PoolClient) => {
          client
            .query(query)
            .then((qres) => {
              resolve(qres);
            })
            .catch((err) => {
              switch (err.code) {
                case "23505": // unique key is already exist
                  logger(`{red}${err.detail}{reset}`, LoggerEnum.ERROR);
                  logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
                  return reject({
                    result: false,
                    error_code: 3008,
                    errors: [err.detail],
                  });

                case "42P01":
                  logger(`{red}Database Table Not Found{reset}`, LoggerEnum.ERROR);
                  logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
                  return reject({ result: false, error_code: 3007 });

                case "42703":
                  logger(`{red}Database Column Not Found{reset}`, LoggerEnum.ERROR);
                  logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
                  return reject({ result: false, error_code: 3010 });

                case "ECONNREFUSED":
                  logger(`{red}Database Connection Refused{reset}`, LoggerEnum.ERROR);
                  logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
                  return reject({ result: false, error_code: 3009 });

                default:
                  logger(`{red}${err.message}{reset}`, LoggerEnum.ERROR);
                  logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
                  return reject(err);
              }
            })
            .finally(() => {
              client.release();
            });
        })
        .catch((err) => {
          logger(`{red} error executeQuery {reset}`);
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          reject(err);
        });
    });
  }

  protected executeQueryWithParameter(args: {
    query: string;
    source: Pool;
    parameter: string[];
    omits: string[];
  }): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const { source, query = "", parameter = [], omits = [] } = args;

      await source
        .connect()
        .then((client: PoolClient) => {
          client
            .query(query, parameter)
            .then((qres) => {
              omits && omits.length && (qres.rows = _.omit(qres.rows, omits));
              resolve(qres);
            })
            .catch((err) => {
              logger(`{red} error executeQuery {reset}`);
              logger(`{red} ${query} {reset}`);
              logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
              reject(err);
            })
            .finally(() => {
              client.release();
            });
        })
        .catch((err) => {
          logger(`{red} error executeQuery {reset}`);
          logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
          reject(err);
        });
    });
  }
}

export default Repository;
