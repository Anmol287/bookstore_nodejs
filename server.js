const express = require("express");
const path = require("path");
let app = express();
const body_parser = require("body-parser");
app.use(body_parser.urlencoded({ extended: false }));
const checker = require("./auth.js");
app.use(express.static("images")); //use for register folder


app.get("/", function (req, res) {
  res.render(path.join(__dirname, "/login.hbs"));
});


app.post("/", async (req, res) => {
  try {
    const isAuthenticated = await checker.auth(req.body.email, req.body.pass);
    if (isAuthenticated) {
      res.redirect("/home");
    } else {
      res.status(400).send("Wrong credentials");
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.get("/home", (req, res) => {
  if (checker.isuserloggedin() == true) {
    bookdata = checker.getbookdata();
    res.render(path.join(__dirname, "/Bookstore.hbs"), { bookdata: bookdata });
  } else {
    res.render(path.join(__dirname, "/404.hbs"));
  }
});


app.get("/about", (req, res) => {
  if (checker.isuserloggedin() == true) {
    res.render(path.join(__dirname, "/about.hbs"));
  }
  else {
    res.render(path.join(__dirname, "/404hbs"));
  }
});

app.get("/contact", (req, res) => {
  res.render(path.join(__dirname, "contact.hbs"))
})

//cart ,add to cart 
app.get("/cart", (req, res) => {
  data = checker.getcartitems()
  if (data.length == 0) {
    res.render(path.join(__dirname, "/emptycart.hbs"))
  }
  else {
    price = checker.totalprice()
    res.render(path.join(__dirname, "/cart.hbs"), { cartitems: data, price: price })
  }
});

app.get("/additem/:id", (req, res) => {
  let idofproduct = req.params.id
  //console.log(idofproduct)
  checker.additem(idofproduct)
  res.redirect("/home")
})

app.get("/removeitem/:id", (req, res) => {
  let idofproduct = req.params.id
  checker.removeitem(idofproduct)
  res.redirect("/cart")
})

//creating registeration
app.get("/register", function (req, res) {
  res.render(path.join(__dirname, "/register.hbs"));
});

app.post('/register', function (req, res) {
  checker.registeruser(req.body)
    .then(() => {
      res.redirect("/"); 
    })
    .catch((error) => {
      if (error.message === "User already exists") {
        res.send("User already exists. Please choose a different email.");
      } else {
        console.error("Registration error:", error);
        res.status(500).send("Internal Server Error");
      }
    });
});


app.get("/logout", (req, res) => {
  checker.logout();
  res.render(path.join(__dirname, "/login.hbs"));
})

app.listen(8000);
console.log("Server started");
