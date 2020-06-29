const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const session = require("express-session");
const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./article/ArticlesController");
const userController = require("./user/UserController");

const Article = require("./article/Articles");
const Categories = require("./categories/Categories");
const User = require("./user/User");

//View Engine
app.set("view engine", "ejs");

//Sessions
app.use(
  session({
    secret: "aleatórioQualquerCoisa",
    cookie: { maxAge: 1800000 },
  })
);

//Body-Parser
app.use(bodyParser.urlencoded({ extended: false }));
//Static
app.use(express.static("public"));
//DB Connection
connection
  .authenticate()
  .then(() => {
    console.log("Conexão feita com sucesso");
  })
  .catch((err) => {
    console.log("conexão falhou: ", err);
  });

// Controllers
app.use("/", categoriesController);
app.use("/", articlesController);
app.use("/", userController);

//Rotas

app.get("/", (req, res) => {
  Article.findAll({
    order: [["id", "DESC"]],
    limit: 4,
  }).then((articles) => {
    Categories.findAll().then((categories) => {
      res.render("index", {
        articles: articles,
        categories: categories,
      });
    });
  });
});

app.get("/:slug", (req, res) => {
  let { slug } = req.params;
  Article.findOne({
    where: {
      slug: slug,
    },
  })
    .then((article) => {
      if (article != undefined) {
        Categories.findAll().then((categories) => {
          res.render("article", {
            article: article,
            categories: categories,
          });
        });
      } else {
        res.redirect("/");
      }
    })
    .catch((err) => {
      res.redirect("/");
    });
});

app.get("/category/:slug", (req, res) => {
  let { slug } = req.params;
  Categories.findOne({
    where: {
      slug: slug,
    },

    include: [{ model: Article, include: [{ model: Categories }] }],
  })
    .then((category) => {
      if (category != undefined) {
        Categories.findAll().then((categories) => {
          res.render("index", {
            articles: category.articles,
            categories: categories,
          });
        });
      } else {
        res.redirect("/");
      }
    })
    .catch((err) => {
      res.redirect("/");
    });
});

app.listen(8080, () => {
  console.log("Server rodando na porta 8080");
});
