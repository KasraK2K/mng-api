import config from "config";
import { IConfig } from "../../config/config.interface";
import general from "./general-endpoints";
import managerUser from "./manager-user-endpoints";

const configs: IConfig = config.util.toObject();

export default {
  openapi: "3.0.n",
  info: {
    title: "Node Starter",
    description: "This is a node.js starter pack to create service easy and fast",
    version: configs.application.api_version,
  },
  servers: [
    {
      url: process.env.IS_ON_SERVER ? "https://api.mng.dev.embargoapp.com" : "http://localhost:3000",
      description: "Manager API",
    },
  ],

  // ────────────────────────────────────────────────────────────────────
  //   :::::: E N D P O I N T S : :  :   :    :     :        :          :
  // ────────────────────────────────────────────────────────────────────
  paths: {
    // ─────────────────────────────────────────────────── GENERAL ─────
    "/shake-hand": general["/shake-hand"],
    "/login": general["/login"],
    // ────────────────────────────────────────────── MANAGER USER ─────
    "/mng-users/list": managerUser["/mng-users/list"],
  },

  variables: {
    api_key:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzb3VyY2UiOiJtbmciLCJpYXQiOjE2NDM0MDM5NjV9.TDXx-pdtzEqMxaXRGXtk6MZkmgOILvQpYplzvCCwP3k",
    user: {
      email: "kasra@email.com",
      password: "12345678",
    },
  },
};
