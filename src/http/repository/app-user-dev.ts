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
