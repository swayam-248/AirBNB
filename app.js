const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js");
const path = require('path');
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
app.use(express.static(path.join(__dirname, "/public")))

const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb"

main().then(()=>{
  console.log("connected to Db");
})
  .catch((err)=>{
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);

 

app.get("/", (req, res)=>{
  res.send("Hi, I am root");
});

//This is the index route
app.get("/listings", async (req, res)=>{
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", {allListings});
});

//New route
app.get("/listings/new", (req, res)=>{
  res.render("listings/new.ejs");
})

//Edit route
app.get("/listings/:id/edit",async (req, res)=>{
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", {listing});
})


//Show route ie read operation of CRUD
app.get("/listings/:id", async(req, res)=>{
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", {listing})
})

function formatListingBody(listingBody) {
  if (!listingBody) return {};
  const imageUrl = listingBody.image?.url || listingBody.image;
  return {
    title: listingBody.title,
    description: listingBody.description,
    price: listingBody.price,
    country: listingBody.country,
    location: listingBody.location,
    image: {
      url: imageUrl || "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60"
    }
  };
}

//create route
app.post("/listings", async (req, res)=>{
  const listingData = formatListingBody(req.body.listing || req.body);
  const newListing = new Listing(listingData);
  await newListing.save();
  res.redirect("/listings");
})

//update route
app.put("/listings/:id", async (req, res)=>{
  let {id} = req.params;
  const listingData = formatListingBody(req.body.listing || req.body);
  await Listing.findByIdAndUpdate(id, listingData, { runValidators: true });
  res.redirect(`/listings/${id}`);
})

//Delete route
app.delete("/listings/:id", async (req, res)=>{
  let {id} = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
})



// app.get("/testListing", async (req, res)=>{
//   let sampleListing = new Listing({
//     title: "My new villa",
//     description: "by the beach",
//     price: 1200,
//     location: "himachal",
//     country: "India"
//   });
//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successfull")
// })

app.listen(8080, ()=>{
  console.log("server is listening on port number 8080");
});



