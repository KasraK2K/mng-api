// ──────────────────────────────────────────────────────────
//   :::::: U S E R : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────
const userList = async (args = {}) => {
  const where = [];
  if ("search" in args) {
    const search = args.search;
    const searchInt = parseInt(args.search) || -1;
    where.push(` 
         (name like '%${search}%') or (email like '%${search}%') or (id = ${searchInt}) 
        `);
  }
  // if ('email' in args) where.push(` email = '${args.email}' `)

  const whereStr = where.length > 0 ? where.join(" and ") : "";

  return new Promise(async (resolve, reject) => {
    await readTheTable({
      fields:
        " id , email , name , gender , registered , approved , birthday , system , device , blacklisted , login_type , build , os_type  ",
      source: "prod",
      table: ' "Users" ',
      where: whereStr,
      limit: 200,
    })
      .then((response) => {
        resolve({ result: true, data: response });
      })
      .catch((err) => {
        helpers.lg(`{red}error app userList function{reset}`);
        helpers.lg(`{red}${err.stack}{reset}`);
        reject({ result: false });
      });
  });
};

// ────────────────────────────────────────────────────────────── USER DETAIL ─────
const userDetails = async (args = {}) => {
  const user_id = "id" in args ? args.id : 0;

  return new Promise(async (resolve, reject) => {
    const fields = `id , email, name, gender, registered, approved, birthday, firebase, version, identifier, system, device, 
        "lastIP" as last_ip, tracker, blacklisted, "contactNumber" as contact_number, "addressLine1" as address_line1,
        "addressLine2"  as address_line2, "addressCity"  as address_city, "addressCountry"  as address_country, 
        "addressPostcode" as address_postcode, rtimestamp as register_timestamp, login_type, os_type, build `;
    await readTheTable({
      fields: fields,
      source: "prod",
      table: ' "Users" ',
      where: ` id = ${user_id} `,
      limit: 10,
    })
      .then((response) => {
        resolve({ result: true, data: response });
      })
      .catch((err) => {
        helpers.lg(`{red}error app userList function{reset}`);
        helpers.lg(`{red}${err.stack}{reset}`);
        reject({ result: false });
      });
  });
};

// ────────────────────────────────────────────────────────────────
//   :::::: R E W A R D S : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────
const rewardHistory = async (args = {}) => {
  const user_id = "user_id" in args ? parseInt(args.user_id) || 0 : 0;

  return new Promise(async (resolve, reject) => {
    const list = [];
    const query = `
        SELECT r.id as reward_id, 
            coalesce(v.name,'') as venue_name, 
            coalesce(l.name,'') as scheme_name, 
            r.scheme_id, r.venue_id, r.offer_id, r.user_id, r.rtimestamp, r.uses, 
            count(c.reward_id) as count,
            coalesce(max(c.rtimestamp)::TEXT,'') as claim_rtimestamp
        FROM "UserRewards" r
        LEFT JOIN "UserRewardClaims" c ON r.id = c.reward_id
        LEFT JOIN "Venues" v ON r.venue_id = v.id
        LEFT JOIN "LoyaltySchemes" l ON r.scheme_id = l.id
        WHERE r.user_id = ${user_id} 
        GROUP BY r.id,v.name,l.name
        `;
    await executeQuery({ source: "prod", query: query })
      .then((qres) => {
        for (let row of qres.qres.rows) {
          list.push(row);
        }
        resolve({ result: true, data: list });
      })
      .catch((err) => {
        helpers.lg(`{red}error rewardHistory function{reset}`);
        helpers.lg(`{red}${err.stack}{reset}`);
        reject({ result: false });
      });
  });
};

// ────────────────────────────────────────────────────────────────
//   :::::: M E S S A G E : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────
const sendMessage = async (args = {}) => {
  const user_id = helpers.getValue({ obj: args, field: "user_id" });
  const title = helpers.getValue({ obj: args, field: "title", type: "string" });
  const body = helpers.getValue({ obj: args, field: "body", type: "string" });
  const scheme_id = helpers.getValue({ obj: args, field: "scheme_id" });
  const venue_id = helpers.getValue({ obj: args, field: "venue_id" });

  return new Promise(async (resolve, reject) => {
    if (!helpers.validateValue({ value: user_id, type: "not-zero" })) {
      reject({ result: false, error_code: 3005 });
      return;
    } else if (!helpers.validateValue({ value: title, type: "not-empty" })) {
      reject({ result: false, error_code: 3007 });
      return;
    } else if (!helpers.validateValue({ value: body, type: "not-empty" })) {
      reject({ result: false, error_code: 3008 });
      return;
    }

    const query = `insert into messages (kind, title, body, user_id, scheme_id, venue_id, notification_id, status)
                       values (0, '${title}', '${body}', ${user_id}, ${scheme_id},${venue_id},0,0)`;
    await executeQuery({ source: "prod", query: query })
      .then(() => {
        helpers.lg(`message added to user ${user_id}`);
        resolve({ result: true });
      })
      .catch((err) => {
        helpers.lg(`{red}error sendMessage function{reset}`);
        helpers.lg(`{red}${err.stack}{reset}`);
        reject({ result: false });
      });
    resolve({ result: true });
  });
};

const listMessage = async (args = {}) => {
  const user_id = helpers.getValue({ obj: args, field: "user_id" });

  return new Promise(async (resolve, reject) => {
    if (!helpers.validateValue({ value: user_id, type: "not-zero" })) {
      reject({ result: false, error_code: 3005 });
      return;
    }
    let query = `SELECT m.message_id, m.kind, m.scheme_id, m.venue_id, m.notification_id, m.status, m.trash, m.body, m.title, m.rtimestamp,
                        n.body as notification_body, n.title as notification_title
                    FROM messages as m
                    LEFT JOIN "NotificationSchedule" as n on
                        m.notification_id = n.id
                    WHERE m.user_id = ${user_id}
                    Order by m.message_id desc`;
    const list = [];
    await executeQuery({ source: "prod", query: query })
      .then((qres) => {
        for (let row of qres.qres.rows) {
          list.push(row);
        }
        resolve({ result: true, data: list });
      })
      .catch((err) => {
        helpers.lg(`{red}error listMessage function{reset}`);
        helpers.lg(`{red}${err.stack}{reset}`);
        reject({ result: false });
      });
    resolve({ result: true });
  });
};

// ──────────────────────────────────────────────────────────────
//   :::::: C L A I M S : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────
const claimHistory = async (args = {}) => {
  const user_id = "user_id" in args ? parseInt(args.user_id) || 0 : 0;

  return new Promise(async (resolve, reject) => {
    const list = [];
    const query = `
            SELECT c.id, c.reward_id, c.rtimestamp, r.offer_id, o.description
            FROM public."UserRewardClaims" c
            left join "UserRewards" r on r.id = c.reward_id
            left join "Offers" o on o.id =  r.offer_id
            
            where r.user_id = ${user_id}
            order by reward_id
        `;
    await executeQuery({ source: "prod", query: query })
      .then((qres) => {
        for (let row of qres.qres.rows) {
          list.push(row);
        }
        resolve({ result: true, data: list });
      })
      .catch((err) => {
        helpers.lg(`{red}error claimHistory function{reset}`);
        helpers.lg(`{red}${err.stack}{reset}`);
        reject({ result: false });
      });
  });
};

// ────────────────────────────────────────────────────────────
//   :::::: P O I N T : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────
const pointHistory = async (args = {}) => {
  const user_id = "user_id" in args ? parseInt(args.user_id) || 0 : 0;

  return new Promise(async (resolve, reject) => {
    const list = [];
    const query = `
            SELECT p.point_id, p.rtimestamp, v.name as venue_name, l.name as scheme_name, p.point, p.type,   p.latitude, p.longitude, p.point_uid,p.scheme_id,  p.venue_id
            FROM public."UserPoints" p
            left join "Venues" v on v.id = p.venue_id
            left join "LoyaltySchemes" l on l.id = p.scheme_id

            where user_id = ${user_id} 
            order by point_id desc
        `;
    await executeQuery({ source: "prod", query: query })
      .then((qres) => {
        for (let row of qres.qres.rows) {
          list.push(row);
        }
        resolve({ result: true, data: list });
      })
      .catch((err) => {
        helpers.lg(`{red}error pointHistory function{reset}`);
        helpers.lg(`{red}${err.stack}{reset}`);
        reject({ result: false });
      });
  });
};
