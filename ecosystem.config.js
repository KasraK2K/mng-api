//================================================================================================================
//
//  #####   ###    ###   ####         #####   ####   #####    ####  ##    ##   ####  ######  #####  ###    ###
//  ##  ##  ## #  # ##  #    #        ##     ##     ##   ##  ##      ##  ##   ##       ##    ##     ## #  # ##
//  #####   ##  ##  ##     ##         #####  ##     ##   ##   ###     ####     ###     ##    #####  ##  ##  ##
//  ##      ##      ##   ##           ##     ##     ##   ##     ##     ##        ##    ##    ##     ##      ##
//  ##      ##      ##  ######        #####   ####   #####   ####      ##     ####     ##    #####  ##      ##
//
//================================================================================================================

// NOTE: To run typescript file install this `pm2 install typescript`
module.exports = {
  apps: [
    {
      name: "mng-api",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      script: process.env.NODE_ENV === "production" ? "build/index.js" : "src/index.ts",
      autorestart: true,
      watch: true,
      time: true,
      instances: "max",
      exec_mode: "cluster",
      error_file: "/var/pm2-logs/dev/err.log",
      out_file: "/var/pm2-logs/dev/out.log",
      log_file: "/var/pm2-logs/dev/combined.log",

      // default variables
      env: {
        IS_ON_SERVER: true,
        NODE_ENV: "development",
      },

      // production environment
      env_production: {
        NODE_ENV: "production",
        JWT_SECRET: "Embargo_mnG_V2.1_Emb@rgoL!m!ted@!AllManagementSaltsPr0d0cti0n",
        PORT: "6300",
      },

      // development environment
      env_development: {
        NODE_ENV: "development",
        JWT_SECRET: "Embargo_mnG_V2.1_Emb@rgoL!m!ted@!AllManagementSaltsDevel0pment",
        PORT: "6300",
      },
    },
  ],
};
