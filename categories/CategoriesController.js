const express = require("express");
const router = express.Router();
const Category = require("./Categories");
const slugify = require("slugify");
const adminAuth = require("../middlewares/adminAuth");

router.get("/categories", (req, res) => {
  res.send("Página de categorias");
});

router.get("/admin/categories/new", adminAuth, (req, res) => {
  res.render("admin/categories/new");
});

router.post("/admin/categories/save", adminAuth, (req, res) => {
  let { title } = req.body;

  if (title != undefined) {
    Category.create({
      title: title,
      slug: slugify(title),
    })
      .then(() => {
        res.redirect("/admin/categories");
      })
      .catch((err) => {
        res.redirect("/admin/categories/new");
      });
  } else {
    res.redirect("/admin/categories/new");
  }
});

router.get("/admin/categories", adminAuth, (req, res) => {
  Category.findAll().then((categories) => {
    res.render("admin/categories/index", { categories: categories });
  });
});

router.post("/admin/categories/delete", adminAuth, (req, res) => {
  let { id } = req.body;

  if (id != undefined) {
    if (!isNaN(id)) {
      Category.destroy({
        where: {
          id: id,
        },
      })
        .then(() => {
          res.redirect("/admin/categories");
        })
        .catch((err) => {
          res.redirect("/admin/categories");
        });
    } else {
      res.redirect("/admin/categories");
    }
  } else {
    res.redirect("/admin/categories");
  }
});

router.get("/admin/categories/edit/:id", adminAuth, (req, res) => {
  let { id } = req.params;

  if (!isNaN(id)) {
    Category.findByPk(id)
      .then((category) => {
        if (category != undefined) {
          res.render("admin/categories/edit", { category: category });
        } else {
          res.redirect("/admin/categories");
        }
      })
      .catch((err) => {
        res.redirect("/admin/categories");
      });
  } else {
    res.redirect("/admin/categories");
  }
});

router.post("/admin/categories/update", adminAuth, (req, res) => {
  let { id, title } = req.body;
  let slug = slugify(title);

  Category.update(
    {
      title: title,
      slug: slug,
    },
    {
      where: {
        id: id,
      },
    }
  ).then(() => {
    res.redirect("/admin/categories");
  });
});

module.exports = router;
