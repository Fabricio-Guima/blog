const express = require("express");
const router = express.Router();
const User = require("./User");
const bcrypt = require("bcryptjs");

router.get("/admin/users", (req, res) => {
  User.findAll()
    .then((users) => {
      res.render("admin/users/index", { users: users });
    })
    .catch((err) => {
      res.render("/");
    });
});

router.get("/admin/users/create", (req, res) => {
  res.render("admin/users/create");
});

router.post("/users/save", (req, res) => {
  let { email, password } = req.body;

  User.findOne({
    where: {
      email: email,
    },
  }).then((user) => {
    if (user == undefined) {
      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(password, salt);

      User.create({
        email: email,
        password: hash,
      })
        .then(() => {
          res.redirect("/");
        })
        .catch((err) => {
          res.redirect("/");
        });
    } else {
      res.redirect("/admin/users/create");
    }
  });
});

router.get("/admin/users/edit/:id", (req, res) => {
  let { id } = req.params;
  if (!isNaN(id)) {
    User.findByPk(id)
      .then((user) => {
        if (user != undefined) {
          res.render("admin/users/edit", { user: user });
        } else {
          res.redirect("/admin/users");
        }
      })
      .catch((err) => {
        res.redirect("/admin/users");
      });
  }
});

router.post("/admin/users/update", (req, res) => {
  let { email, password, id } = req.body;

  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(password, salt);

  User.update(
    {
      email: email,
      password: hash,
    },
    {
      where: {
        id: id,
      },
    }
  )
    .then(() => {
      res.redirect("/admin/users");
    })
    .catch((err) => {
      res.redirect("/admin/users");
    });
});

router.post("/admin/users/delete", (req, res) => {
  let { id } = req.body;
  if (id != undefined) {
    if (!isNaN(id)) {
      User.destroy({
        where: {
          id: id,
        },
      })
        .then(() => {
          res.redirect("/admin/users");
        })
        .catch((err) => {
          res.redirect("/admin/users");
        });
    } else {
      res.redirect("/admin/users");
    }
  } else {
    res.redirect("/admin/users");
  }
});

router.get("/login", (req, res) => {
  res.render("admin/users/login");
});

router.post("/authenticate", (req, res) => {
  let { email, password } = req.body;

  User.findOne({ where: { email: email } }).then((user) => {
    if (user != undefined) {
      let correct = bcrypt.compareSync(password, user.password);

      if (correct) {
        req.session.user = {
          id: user.id,
          email: user.email,
        };
        res.redirect("/admin/articles");
      } else {
        res.redirect("/login");
      }
    } else {
      res.redirect("/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.user = undefined;
  res.redirect("/");
});

module.exports = router;
