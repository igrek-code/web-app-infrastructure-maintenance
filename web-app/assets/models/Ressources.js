let db, config;

// Le require() envoie une fonction envoyant la class resp_maint
// Permettant de définir des constantes dans le module venant du fichier principal
module.exports = (_db, _config) => {
  db = _db;
  config = _config;
  return Ressources;
};

let Ressources = class {
  // Envoie tous les ressources d'un responsable
  static getAll(resp_maint_id) {
    console.log(resp_maint_id);
    return new Promise((next) => {
      db.query("SELECT id, name, description, localisation FROM ressources where resp_maint_id = ?", [
        resp_maint_id,
      ])
        .then((result) => next(result))
        .catch((err) => next(err));
    });
  }

  // Envoie une ressource par id
  static getId(id) {
    return new Promise((next) => {
      db.query("SELECT id, name, description, localisation FROM ressources where id = ?", [
        id,
      ])
        .then((result) => next(result))
        .catch((err) => next(err));
    });
  }

  // Ajoute un membre avec son nom, email et mot de passe comme paramètre
  static add(name, desc, localisation, resp_maint_id) {
    return new Promise((next) => {
      if (
        name !== undefined &&
        desc !== undefined &&
        localisation !== undefined &&
        resp_maint_id !== undefined &&
        name.trim() !== "" &&
        desc.trim() !== "" &&
        localisation.trim() !== ""
      ) {
        db.query(
          "INSERT INTO ressources (name, description, localisation, resp_maint_id) VALUES(?, ?, ?, ?)",
          [name, desc, localisation, resp_maint_id]
        )
          .then(() => {
            return db.query(
              "SELECT * FROM ressources WHERE id = last_insert_id()"
            );
          })
          .then((result) => {
            next({
              id: result[0].id,
              name: result[0].name,
              desc: result[0].description,
              localisation: result[0].localisation,
              resp_maint_id: result[0].resp_maint_id,
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
      db.query("SELECT * FROM ressources WHERE id = ?", [id])
        .then((result) => {
          if (result[0] != undefined) {
            return db.query("DELETE FROM ressources WHERE id = ?", [id]);
          } else {
            next(new Error(config.errors.wrongID));
          }
        })
        .then(() => next(true))
        .catch((err) => next(err));
    });
  }
};
