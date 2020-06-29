const express = require("express");
const router = express.Router();
const Article = require("./Articles");
const Category = require("../categories/Categories");
const slugify = require("slugify");
const adminAuth = require("../middlewares/adminAuth");

router.get("/articles", (req, res) => {
  res.render("index");
});

router.get("/admin/articles", adminAuth, (req, res) => {
  Article.findAll({
    include: [{ model: Category }],
  })
    .then((articles) => {
      res.render("admin/articles/index", { articles: articles });
    })
    .catch((err) => {
      res.redirect("/admin/articles");
    });
});

router.get("/admin/articles/new", adminAuth, (req, res) => {
  Category.findAll()
    .then((categories) => {
      res.render("admin/articles/new", { categories: categories });
    })
    .catch((err) => {
      res.render("admin/articles/new");
    });
});

router.post("/admin/articles/save", adminAuth, (req, res) => {
  let { title, body, category } = req.body;

  Article.create({
    title: title,
    slug: slugify(title),
    body: body,
    categoryId: category,
  })
    .then(() => {
      res.redirect("/admin/articles");
    })
    .catch((err) => {
      res.redirect("/admin/articles");
    });
});

router.post("/admin/articles/delete", adminAuth, (req, res) => {
  let { id } = req.body;

  if (id != undefined) {
    if (!isNaN(id)) {
      Article.destroy({
        where: {
          id: id,
        },
      })
        .then(() => {
          res.redirect("/admin/articles");
        })
        .catch((err) => {
          res.redirect("/admin/articles");
        });
    } else {
      res.redirect("/admin/articles");
    }
  } else {
    res.redirect("/admin/articles");
  }
});

router.get("/admin/articles/edit/:id", adminAuth, (req, res) => {
  let { id } = req.params;

  if (!isNaN(id)) {
    console.log(id);
    Article.findByPk(id)
      .then((article) => {
        if (article != undefined) {
          Category.findAll().then((categories) => {
            res.render("admin/articles/edit", {
              article: article,
              categories: categories,
            });
          });
        } else {
          res.redirect("/admin/articles");
        }
      })
      .catch((err) => {
        res.redirect("/admin/articles");
      });
  } else {
    res.redirect("/admin/articles");
  }
});

router.post("/admin/articles/update", adminAuth, (req, res) => {
  let { id, title, body, category } = req.body;
  let slug = slugify(title);

  Article.update(
    {
      title,
      body,
      categoryId: category,
      slug,
    },
    {
      where: {
        id,
      },
    }
  )
    .then(() => {
      res.redirect("/admin/articles");
    })
    .catch((err) => {
      res.redirect("/");
    });
});

router.get("/articles/page/:num", (req, res) => {
  let page = req.params.num;
  let offset = 0;
  if (isNaN(page) || page == 1) {
    offset = 0;
  } else {
    offset = (parseInt(page) - 1) * 4;
  }

  Article.findAndCountAll({
    limit: 4,
    offset: offset,
    order: [["id", "DESC"]],
  }).then((articles) => {
    let next;
    if (offset + 4 >= articles.count) {
      next = false;
    } else {
      next = true;
    }

    let result = {
      page: parseInt(page),
      next: next,
      articles: articles,
    };

    Category.findAll().then((categories) => {
      res.render("admin/articles/page", {
        result: result,
        categories: categories,
      });
    });
  });
});

module.exports = router;
