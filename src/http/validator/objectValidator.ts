import { LoggerEnum } from "../../common/enums/logger.enum";
import moment from "moment";

export const objectValidator = (obj: Record<string, any>, skeme: Record<string, any>) => {
  const value: { errors?: string[] } & Record<string, any> = {};
  const errorValues: string[] = [];

  Object.keys(skeme).forEach((key) => {
    const skm = skeme[key];
    let defaultValue: any = 0;
    const type = skm.type ?? "int";

    // ───────────────────────────────────── ASSIGN DEFAULT VALUES ─────
    if ("default" in skm) defaultValue = skm.default;
    else defaultValue = valueByType(type);
    // ─────────────────────────────────────────────────────────────────

    if (!(key in obj)) {
      if (skm.force_type) errorValues.push(`validation error ${key}; the value of (${key}) has not been provided`);
      else value[key] = defaultValue;
    } else {
      let v = obj[key];

      // ────────────────────────────────────── EXPLICIT TYPE CHANGE ─────
      if (type !== "array") v = explicitTypeChange(type, defaultValue, v);
      else if (!Array.isArray(v)) {
        if (skm.force_type) errorValues.push(`validation error ${key}; (${key}) should be an array (value:${v})`);
        v = defaultValue;
      }
      // ─────────────────────────────────────────────────────────────────

      // ──────────────────────────────────────────────── CONDITIONS ─────
      if ("min_length" in skm && type === "string" && v.length < skm.min_length)
        errorValues.push(`validation error ${key}; min length of (${key}) should be ${skm.min_length} (value:${v})`);

      if ("min_length" in skm && type === "array" && v.length < skm.min_length)
        errorValues.push(`validation error ${key}; min items of (${key}) should be ${skm.min_length}`);

      if ("cut_at_max" in skm && type === "string") v = v.substring(0, skm.cut_at_max);

      if ("min_value" in skm && (type === "float" || type === "int") && v < skm.min_value)
        errorValues.push(`validation error ${key}; min value of (${key}) should be ${skm.min_value} (value:${v})`);

      if ("is_date" in skm && type === "string") {
        const isValid = moment(v, "YYYY-MM-DD", true).isValid();
        if (!isValid) {
          if (skm.force_type) errorValues.push(`validation error ${key}; ${key} is not a valid date (value:${v}) `);
          else v = "2000-01-01";
        }
      }
      // ─────────────────────────────────────────────────────────────────

      value[key] = v;
    }
  });

  if (errorValues.length > 0) value.errors = errorValues;

  return value;
};

const valueByType = (type: any) => {
  switch (type) {
    case "int":
      return 0;

    case "string":
      return "";

    case "boolean":
      return true;

    case "float":
      return 0.0;

    case "array":
      return [];

    case "object":
      return {};
  }
};

const explicitTypeChange = (type: any, defaultValue: any, value: any) => {
  switch (type) {
    case "int":
      return parseInt(value) || defaultValue;

    case "string":
      if (typeof value == "number") value = value.toString();
      else if (typeof value !== "string") value = defaultValue;
      return value;

    case "boolean":
      if (typeof value !== "boolean") value = defaultValue;
      return value;

    case "float":
      return parseFloat(value) || defaultValue;

    case "object":
      if (typeof value !== "object" || Array.isArray(value)) value = defaultValue;
      return value;
  }
};

const addErrors = (obj: Record<string, any>, err: string) => {
  if (!("errors" in obj)) obj.errors = [];
  obj.errors.push(err);
};

export const beaconValidator = async (value: Record<string, any>) => {
  const beacons: string[] = value.beacons;

  let hasError = false;
  beacons.forEach((b) => {
    if (typeof b !== "string") {
      addErrors(value, `validation error; beacon array value ${b} should be string`);
      hasError = true;
    } else {
      const beaconMinorMajor = b.split("-");
      if (beaconMinorMajor.length !== 2) {
        addErrors(value, `validation error; beacon value ${b} should be two parts`);
        hasError = true;
      } else {
        const major = parseInt(beaconMinorMajor[0]);
        const minor = parseInt(beaconMinorMajor[1]);
        if (major < 10000 || major > 99999 || minor < 10000 || minor > 99999) {
          addErrors(value, `validation error; beacon minor and major (${b}) should be between 10000 and 99999`);
          hasError = true;
        }
      }
    }
  });
  if (hasError) return;

  const beaconStr = beacons.map((str) => "'" + str + "'").join(",");
  const query = `
    SELECT COUNT(*) AS row_count FROM (
    SELECT id, unnest(beacon) AS beacon_each FROM "Venues"
    ) AS aa
    WHERE id <> ${value.id} AND beacon_each IN (${beaconStr})
  `;

  await pg.pool_main
    .query(query)
    .then((res) => {
      const resultCount = Number(res.rows[0].row_count);
      if (resultCount) addErrors(value, `validation error; beacon ${beaconStr} already exists`);
    })
    .catch((err) => {
      logger(`{red}error validateBeacons function{reset}`, LoggerEnum.ERROR);
      logger(`{red}${err.stack}{reset}`, LoggerEnum.ERROR);
    });
};

// const validateVenueWorkingHours = async (value, working_hours) => {
//   const daysArray = ["mon", "tue", "wed", "thu", "fri", "sat", "sun", "hol"];

//   if (working_hours.length != 8) {
//     addErrors(value, `validation error; working hours should include 8 days`);
//   }
//   daysArray.forEach((day) => {
//     const dayObj = working_hours.find((ob) => ob.day == day);
//     if (dayObj == undefined) {
//       addErrors(value, `validation error; working hours does not have value for (${day})`);
//     } else {
//       if (Object.keys(dayObj).length != 4) {
//         addErrors(
//           value,
//           `validation error; working hours (${day}) should include 4 key values (type,time1,time2,day) ${dayObj.length}`
//         );
//       } else {
//         if ("type" in dayObj) {
//           if (!["open", "closed"].includes(dayObj.type))
//             addErrors(value, `validation error; working hours (${day}).(type) should be open or closed`);
//         } else addErrors(value, `validation error; working hours (${day}) should include type`);

//         if (!("time1" in dayObj)) addErrors(value, `validation error; working hours (${day}) should include time1`);
//         if (!("time2" in dayObj)) addErrors(value, `validation error; working hours (${day}) should include time2`);

//         if (dayObj.type === "open") {
//           if (parseInt(dayObj.time1) < 0 || parseInt(dayObj.time1) > 2400)
//             addErrors(value, `validation error; working hours (${day}).(time1) is not a valid time`);

//           if (parseInt(dayObj.time2) < 0 || parseInt(dayObj.time2) > 2400)
//             addErrors(value, `validation error; working hours (${day}).(time2) is not a valid time`);

//           if (parseInt(dayObj.time2) <= parseInt(dayObj.time1))
//             addErrors(value, `validation error; working hours (${day}).(time2) should be after (${day}).(time1)`);
//         }
//       }
//     }
//   });
// };

export default { objectValidator, beaconValidator };
