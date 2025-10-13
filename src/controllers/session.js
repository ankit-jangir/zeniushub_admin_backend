const { logger } = require("sequelize/lib/utils/logger");
const customError = require("../utils/error.handler");
const { try_catch } = require("../utils/tryCatch.handler");
const sessionService = require("../services/session.service");
const sessionSchema = require("../validators/session.validation");
const { z } = require('zod');
const session = {

    addSession: try_catch(
        async (req, res) => {

            const result = sessionSchema.pick({ session_year: true }).safeParse({ session_year: parseInt(req.body.session_year) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            const currentYear = new Date().getFullYear();
            if (parseInt(req.body.session_year) > currentYear) {
                throw new customError("Future session year cannot be added", 400);
            }
            await sessionService.addSession(req.body);

            return res.status(201).send({ status: "001", message: "Session created successfully" });
        }
    ),
    


    getAllSession: try_catch(
        async (req, res) => {
          const sessionYearSchema = z.string().regex(/^\d*$|^$/, {
            message: "session_year must contain only digits or be completely blank."
          });
      
          const result = sessionYearSchema.safeParse(req.query.session_year);
          
          
      
          if (!result.success) {
            throw new customError(
              result.error.errors.map(err => err.message).join(", "),
              400
            );
          }
      
         
          let limit = parseInt(req.query.limit);
          let page = parseInt(req.query.page);
      
          if (isNaN(limit) || limit < 1) limit = 18;
          if (isNaN(page) || page < 1) page = 1;
      
          const { totalCount, data } = await sessionService.findwithRegex(
            { session_year: req.query.session_year },
            limit,
            page
          );
      
          return res.status(200).send({
            status: "001",
            sessions: {
              count: totalCount,
              rows: data
            }
          });
        }
      ),
      
      
      
      
    

    getSessions: try_catch(
        async (req, res) => {



            const sessions = await sessionService.getSessions();
            return res.status(200).send({ status: "001", sessions });
        }
    ),

    getSessionById: try_catch(
        async (req, res) => {

            const result = sessionSchema.pick({ id: true }).safeParse({ id: parseInt(req.params.id) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            const session = await sessionService.getSessionById(req.params.id);
            if (!session) {

                throw new customError("Session not found", 404);

            }
            return res.status(200).send({ status: "001", session });
        }
    ),

    updateSession: try_catch(
        async (req, res) => {
            const result = sessionSchema.pick({ session_year: true, id: true }).safeParse({ id: parseInt(req.body.id), session_year: parseInt(req.body.session_year) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            await sessionService.updateSession({ session_year: req.body.session_year }, { id: req.body.id });

            return res.status(200).send({ status: "001", message: "Session updated successfully" });
        }
    ),

    deleteSession: try_catch(
        async (req, res) => {

            const result = sessionSchema.pick({ id: true }).safeParse({ id: parseInt(req.params.id) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            const deleted = await sessionService.deleteSession(req.params.id);

            if (!deleted) {


                throw new customError("Session not found", 404);
            }
            return res.status(200).send({ status: "001", message: "Session deleted successfully" });
        }
    ),

    defaultSession: try_catch(
        async (req, res) => {
            const result = sessionSchema.pick({ id: true }).safeParse({ id: parseInt(req.body.id) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            await sessionService.defaultSession({ is_default: true }, { id: req.body.id });

            return res.status(200).send({ status: "001", message: "Session successfully set to default." });
        }
    ),

    countSession: try_catch(
        async (req, res) => {
            const sessions = await sessionService.countSession();
            return res.status(200).send({ status: "001", count: sessions });
        }
    )

}
module.exports = { session }


