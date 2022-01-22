const {
  checkAndChange,
  AuthAdminMiddleWare,
  AuthRespMaintMiddleWare,
} = require("./assets/functions");
const mysql = require("promise-mysql");
const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan")("dev");
const config = require("./assets/config");
const twig = require("twig");
const path = require("path");
const expressSession = require("express-session");

require("dotenv").config();

mysql
  .createConnection({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
  })
  .then((db) => {
    console.log("Connected to Database: " + config.db.database);

    const app = express();
    app.use(
      expressSession({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
      })
    );

    let AuthRouter = express.Router();
    let Auth = require("./assets/models/Auth")(db, config);

    let ViewRouter = express.Router();

    let RespMaintRouter = express.Router();
    let RespMaint = require("./assets/models/RespMaint")(db, config);

    let RessourcesRouter = express.Router();
    let Ressources = require("./assets/models/Ressources")(db, config);

    let AnomaliesRouter = express.Router();
    let Anomalies = require("./assets/models/Anomalies")(db, config);

    app.use(morgan);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
      next();
    });

    // AUTHENTIFICATION
    AuthRouter.route("/login").post(async (req, res) => {
      let authentified = await Auth.verifyUser(
        req.body.email,
        req.body.pwd,
        req.body.type
      );
      authentified = checkAndChange(authentified);
      if (authentified.status === "success") {
        req.session.user = authentified.result.type;
        req.session.id_user = authentified.result.id;
      }
      res.json(authentified);
    });

    AuthRouter.route("/logout").get((req, res) => {
      req.session.destroy();
    });

    app.use(config.rootAPI + "auth", AuthRouter);

    // VIEWS

    // AFFICHER PAGE ADMIN
    ViewRouter.route("/admin").get(AuthAdminMiddleWare, (req, res) => {
      res.render(__dirname + "/assets/views/admin.twig", {
        hn: req.hostname+":"+config.port,
      });
    });

    // PAGE DE CONNEXION
    ViewRouter.route("/").get((req, res) => {
      if (!req.session.user) res.render(__dirname + "/assets/views/index.twig", {
        hn: req.hostname+":"+config.port,
      });
      else if (req.session.user === "admin") res.redirect("/admin");
      else res.redirect("/resp-maint");
    });

    // PAGE RESPONSABLE DE MAINTENANCE
    ViewRouter.route("/resp-maint").get(AuthRespMaintMiddleWare, (req, res) => {
      res.render(__dirname + "/assets/views/resp_maint.twig", {
        hn: req.hostname+":"+config.port,
      });
    });

    // FORMULAIRE
    ViewRouter.route("/formulaire/:id").get((req, res) => {
      res.render(__dirname + "/assets/views/formulaire.twig", {
        id_ressource: req.params.id,
        hn: req.hostname+":"+config.port,
      });
    });

    app.use(config.root, ViewRouter);

    // ANOMALIES ROUTES

    AnomaliesRouter.route("/:id")
      // GET ANOMALIES PAR RESSOURCE
      .get(async (req, res) => {
        let allAnomalies = await Anomalies.getAll(req.params.id);
        res.json(checkAndChange(allAnomalies));
      })

      // Supprime une anomalie avec ID
      .delete(AuthRespMaintMiddleWare, async (req, res) => {
        let deleteAnomalie = await Anomalies.delete(req.params.id);
        res.json(checkAndChange(deleteAnomalie));
      });

    AnomaliesRouter.route("/")

      // Ajoute une anomalie avec description
      .post(async (req, res) => {
        res.header();
        let addAnomalie = await Anomalies.add(
          req.body.desc,
          req.body.id_ressource
        );
        res.json(checkAndChange(addAnomalie));
      });

    app.use(config.rootAPI + "anomalies", AnomaliesRouter);

    // RESSOURCES ROUTES

    RessourcesRouter.route("/:id")

      // Supprime une ressource avec ID
      .delete(AuthRespMaintMiddleWare, async (req, res) => {
        let deleteRessource = await Ressources.delete(req.params.id);
        res.json(checkAndChange(deleteRessource));
      });

    RessourcesRouter.route("/by-id/:id")

      // Récupère une ressource par id
      .get(async (req, res) => {
        let Ressource = await Ressources.getId(req.params.id);
        res.json(checkAndChange(Ressource));
      });

    RessourcesRouter.route("/")

      // Récupère tous les ressources d'un responsable
      .get(AuthRespMaintMiddleWare, async (req, res) => {
        let allRessources = await Ressources.getAll(req.session.id_user);
        res.json(checkAndChange(allRessources));
      })

      // Ajoute une ressource
      .post(AuthRespMaintMiddleWare, async (req, res) => {
        let addRessource = await Ressources.add(
          req.body.name,
          req.body.desc,
          req.body.localisation,
          req.session.id_user
        );
        res.json(checkAndChange(addRessource));
      });

    app.use(config.rootAPI + "ressources", RessourcesRouter);

    // RESPONSABLE MAINTENANCE ROUTES

    RespMaintRouter.route("/:id")

      // Supprime un membre avec ID
      .delete(AuthAdminMiddleWare, async (req, res) => {
        let deleteMember = await RespMaint.delete(req.params.id);
        res.json(checkAndChange(deleteMember));
      });

    RespMaintRouter.route("/")

      // Récupère tous les membres
      .get(AuthAdminMiddleWare, async (req, res) => {
        let allRespMaint = await RespMaint.getAll();
        res.json(checkAndChange(allRespMaint));
      })

      // Ajoute un membre avec son nom, email, mot de passe
      .post(AuthAdminMiddleWare, async (req, res) => {
        let addMember = await RespMaint.add(
          req.body.name,
          req.body.email,
          req.body.pwd
        );
        res.json(checkAndChange(addMember));
      });

    app.use(config.rootAPI + "resp-maint", RespMaintRouter);

    app.get("/assets/qrcode.min.js", (req, res) => {
      res.sendFile(path.join(__dirname + "/assets/qrcode.min.js"));
    });

    app.get("*", (req, res) => {
      res.sendStatus(404);
    });

    app.listen(config.port, () =>
      console.log("Server started on port " + config.port)
    );
  })
  .catch((err) => {
    console.log("Error during database connection");
    console.log(err.message);
  });
