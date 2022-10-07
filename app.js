const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();


app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sanjay:Test123@cluster0.as5ht.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item ({
  name: "Welcome to your Todolist!"
});

const item2 = new Item ({
  name: "Hit the + button to add a new item."
});

const item3 = new Item ({
  name: "<--- Hit this to delete an item."
});

const deaultItems = [item1,item2,item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){
  Item.find({},function(err,foundItems){
    if (foundItems.length === 0){
      Item.insertMany(deaultItems,function(err){
        if (err){
          console.log(err);
        } else{
          console.log("Success");
        }
      });
      res.redirect("/");
    } else{
      res.render("list.ejs",{listTitle:"Today",newItem:foundItems})
    }
  });
});

app.post("/",function(req,res){
  const itemName = req.body.todo;
  const nameList = req.body.list;
  const newItem = new Item({
    name: itemName
  });

  if (nameList === "Today"){
    newItem.save();
    res.redirect("/");
  } else{
    List.findOne({name:nameList},function(err,foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + nameList);
    }) ;
  }
});

app.get("/:listName",function(req,res){
  const listName = _.capitalize(req.params.listName);
  List.findOne({name:listName},function(err,results){
    if (!err){
      if(!results){
        const list = new List({
          name: listName,
          items: deaultItems
        });
        list.save();
        res.redirect("/" + listName);
      } else{
        res.render("list.ejs",{listTitle:results.name,newItem:results.items})
      }
    }
  });
});

app.post("/delete",function(req,res){
   const checkedId = req.body.checkbox;
   const customName = req.body.customListName;
   if(customName==="Today"){
     Item.findByIdAndRemove(checkedId,function(err){
       if(err){
         console.log(err);
       } else{
         console.log("Success");
       }
     });
     res.redirect("/")
   } else{
     List.findOneAndUpdate({name: customName},{$pull: {items: {_id: checkedId}}}, function(err,foundList){
       if(!err){
         res.redirect("/"+customName)
       }
     });
   }
});

app.get("/about",function(req,res){
  res.render("about.ejs");
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function(){
  console.log("Server has started successfully.");
})
