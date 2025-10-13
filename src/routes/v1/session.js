const express = require("express");
const { session } = require("../../controllers/session");
const authenticate = require("../../middleware/admin.auth");
const sessionRoute = express.Router();

sessionRoute.post("/add", authenticate, session.addSession);
sessionRoute.get("/get", authenticate, session.getAllSession);
sessionRoute.get("/fetch", authenticate, session.getSessions);
sessionRoute.get("/getbyid/:id", authenticate, session.getSessionById);
sessionRoute.patch("/update", authenticate, session.updateSession);
sessionRoute.delete("/delete/:id", authenticate, session.deleteSession);
sessionRoute.patch("/defaultset", authenticate, session.defaultSession);
sessionRoute.get("/count", authenticate, session.countSession);

module.exports = { sessionRoute }



