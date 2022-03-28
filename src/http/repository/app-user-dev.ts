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
