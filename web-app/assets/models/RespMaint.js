let db, config;

// Le require() envoie une fonction envoyant la class resp_maint
// Permettant de définir des constantes dans le module venant du fichier principal
module.exports = (_db, _config) => {
  db = _db;
  config = _config;
  return RespMaint;
};

let RespMaint = class {
  // Envoie un membre via son ID
  //   static getByID(id) {
  //     return new Promise((next) => {
  //       db.query("SELECT * FROM resp_maint WHERE id = ?", [id])
  //         .then((result) => {
  //           if (result[0] != undefined) next(result[0]);
  //           else next(new Error(config.errors.wrongID));
  //         })
  //         .catch((err) => next(err));
  //     });
  //   }

  // Envoie tous les membres
  static getAll() {
    return new Promise((next) => {
      db.query("SELECT id, name, email FROM resp_maint")
        .then((result) => next(result))
        .catch((err) => next(err));
    });
  }

  // Ajoute un membre avec son nom, email et mot de passe comme paramètre
  static add(name, email, pwd) {
    return new Promise((next) => {
      if (
        name != undefined &&
        email != undefined &&
        pwd != undefined &&
        name.trim() != ""
      ) {
        // name = name.trim();

        db.query("SELECT * FROM resp_maint WHERE email = ?", [email])
          .then((result) => {
            if (result[0] != undefined) {
              next(new Error(config.errors.emailAlreadyTaken));
            } else {
              return db.query(
                "INSERT INTO resp_maint(name, email, pwd) VALUES(?, ?, ?)",
                [name, email, pwd]
              );
            }
          })
          .then(() => {
            return db.query("SELECT * FROM resp_maint WHERE email = ?", [
              email,
            ]);
          })
          .then((result) => {
            next({
              id: result[0].id,
              name: result[0].name,
              email: result[0].email,
              pwd: result[0].pwd,
            });
          })
          .catch((err) => next(err));
      } else {
        next(new Error(config.errors.noEmailValue));
      }
    });
  }

  // Modifie le nom d'un membre via son ID
  static update(id, name, email, pwd) {
    return new Promise((next) => {
      if (name != undefined || email != undefined || pwd != undefined) {
        db.query("SELECT * FROM resp_maint WHERE id = ?", [id])
          .then((result) => {
            if (result[0] != undefined) {
              const oldName = result[0].name;
              const oldEmail = result[0].email;
              const oldPwd = result[0].pwd;
              const newName =
                (name !== undefined && name.trim() !== "" && name) || oldName;
              const newEmail =
                (email !== undefined && email.trim() !== "" && email) ||
                oldEmail;
              const newPwd =
                (pwd !== undefined && pwd.trim() !== "" && pwd) || oldPwd;
              const data = db.query(
                "SELECT * FROM resp_maint WHERE email = ? AND id != ?",
                [email, id]
              );
              return {
                newName,
                newEmail,
                newPwd,
                data,
              };
            } else {
              next(new Error(config.errors.wrongID));
            }
          })
          .then((result) => {
            // TO-DO: RE-DO the if cause it's puting same email
            // next(result.data[0]);
            if (result.data[0] != undefined) {
              next(new Error(config.errors.sameEmail));
            } else {
              //   next(Object.keys(result.data));
              return db.query(
                "UPDATE resp_maint SET name = ?, email = ?, pwd = ? WHERE id = ?",
                [result.newName, result.newEmail, result.newPwd, id]
              );
            }
          })
          .then(() => next(true))
          .catch((err) => next(err));
      } else {
        next(new Error(config.errors.noValues));
      }
    });
  }

  // Supprime un membre via son ID
  static delete(id) {
    return new Promise((next) => {
      db.query("SELECT * FROM resp_maint WHERE id = ?", [id])
        .then((result) => {
          if (result[0] != undefined) {
            return db.query("DELETE FROM resp_maint WHERE id = ?", [id]);
          } else {
            next(new Error(config.errors.wrongID));
          }
        })
        .then(() => next(true))
        .catch((err) => next(err));
    });
  }
};
