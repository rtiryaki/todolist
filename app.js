const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const https = require("https");
const _ = require("lodash");
const date = require(__dirname + "/public/js/date.js");

// Define App Use
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Define arrays
//let items = ["Buy Food", "Cook Food", "Eat Food"];
//let workItems = [];

// Define mongoose database for todoList
mongoose.connect(
  "mongodb+srv://admin-rtiryaki:Mert8021@cluster0-fomxm.mongodb.net/todolistDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Items = mongoose.model("Item", itemsSchema);

const item1 = new Items({
  name: "Welcome to to do list",
});
const item2 = new Items({
  name: "Use + to add item",
});

const item3 = new Items({
  name: "<<-- Use chekbox to delete item",
});

const defaultItems = [item1, item2, item3];

// Define custom list db

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

// GET REQUEST FROM CLIENT
app.get("/", (req, res) => {
  // Check db if it is empty
  Items.find({}, (err, foundItems) => {
    if (err) {
      console.log(err);
    } else {
      if (foundItems.length === 0) {
        Items.insertMany(defaultItems, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully items added to db");
            res.redirect("/");
          }
        });
      } else {
        res.render("list", { listTitle: "Today", newItems: foundItems });
      }
    }
  });
});

app.get("/:customListName", (req, res) => {
  // Get data from post form
  const customListName = _.capitalize(req.params.customListName);
  // Check if list exists or not
  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        // Create new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // Display existing list
        res.render("list", {
          listTitle: foundList.name,
          newItems: foundList.items,
        });
      }
    }
  });
});

// POST REQUEST
app.post("/", (req, res) => {
  const itemName = req.body.newInput;
  const listName = req.body.button;

  // Add new item to DB
  const item = new Items({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

// DELETE POST REQUEST
app.post("/delete", (req, res) => {
  const checkboxId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);
  if (listName === "Today") {
    Items.findByIdAndRemove(checkboxId, (err) => {
      if (!err) {
        console.log("Succesfully deleted item from DB");
        res.redirect("/");
      }
    });
  } else {
    //console.log("It comes from " + listName);
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkboxId } } },
      (err, foundList) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

let port = process.env.PORT || 3000;

// Server listen
app.listen(port, () => {
  console.log("Server started succesfully");
});
