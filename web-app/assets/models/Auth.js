let db, config;

module.exports = (_db, _config) => {
  db = _db;
  config = _config;
  return Auth;
};

let Auth = class {
  static verifyUser(email, pwd, type) {
    return new Promise((next) => {
      if (type === "admin") {
        db.query("Select * from admin where email = ? and pwd = ?", [
          email,
          pwd,
        ])
          .then((result) => {
            if (result[0] !== undefined) {
              next({type: "admin", id: 0});
            } else {
              next(new Error(config.errors.wrongCred));
            }
          })
          .catch((err) => next(err));
      } else {
        db.query("Select * from resp_maint where email = ? and pwd = ?", [
          email,
          pwd,
        ])
          .then((result) => {
            if (result[0] !== undefined) {
              next({type: "resp-maint", id: result[0].id});
            } else {
              next(new Error(config.errors.wrongCred));
            }
          })
          .catch((err) => next(err));
      }
    });
  }
};
