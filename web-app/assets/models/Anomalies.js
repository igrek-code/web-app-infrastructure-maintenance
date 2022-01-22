let db, config;

// Le require() envoie une fonction envoyant la class resp_maint
// Permettant de définir des constantes dans le module venant du fichier principal
module.exports = (_db, _config) => {
  db = _db;
  config = _config;
  return Anomalies;
};

let Anomalies = class {
  // Envoie tous les anomalies
  static getAll(id_ressource) {
    return new Promise((next) => {
      db.query("SELECT id, description FROM anomalies where id_ressource = ?", [id_ressource])
        .then((result) => next(result))
        .catch((err) => next(err));
    });
  }

  // Ajoute un membre avec son nom, email et mot de passe comme paramètre
  static add(desc, id_ressource) {
    return new Promise((next) => {
      if (
        desc !== undefined &&
        id_ressource !== undefined &&
        desc.trim() !== "" &&
        id_ressource.trim() !== ""
      ) {
        db.query(
          "INSERT INTO anomalies (description, id_ressource) VALUES(?, ?)",
          [desc, id_ressource]
        )
          .then(() => {
            return db.query(
              "SELECT * FROM anomalies WHERE id = last_insert_id()"
            );
          })
          .then((result) => {
            next({
              id: result[0].id,
              desc: result[0].description,
              id_ressource: result[0].id_ressource,
            });
          })
          .catch((err) => next(err));
      } else {
        next(new Error(config.errors.noValues));
      }
    });
  }

  // Supprime une ressource via son ID
  static delete(id) {
    return new Promise((next) => {
      db.query("SELECT * FROM anomalies WHERE id = ?", [id])
        .then((result) => {
          if (result[0] != undefined) {
            return db.query("DELETE FROM anomalies WHERE id = ?", [id]);
          } else {
            next(new Error(config.errors.wrongID));
          }
        })
        .then(() => next(true))
        .catch((err) => next(err));
    });
  }
};
