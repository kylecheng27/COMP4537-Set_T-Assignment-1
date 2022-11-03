"use strict";

import express from 'express';
const app = express();
import axios from 'axios';
import mongoose from 'mongoose';
import { connectDB } from './connectDB.js';

const pokedexJsonUrl = 'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json';
const pokemonTypeJsonUrl = 'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json';


// Setup the schema
const {Schema} = mongoose;
const pokemonSchema = new Schema({
    'base': {
        'HP': Number,
        'Attack': Number,
        'Defense': Number,
        'Speed': Number,
        "Special Attack": Number,
        "Special Defense": Number
    },
    'id': {type: Number, unique: true},
    'name': {
        'english': {type: String, maxLength: 20},
        'japanese': String,
        'chinese': String,
        'french': String
    },
    'type': [String],
});

// create pokedex collection with the schema
const collectionEntryName = 'pokemon'
const pokemonModel = mongoose.model(collectionEntryName, pokemonSchema);


const port = 5000;
app.listen(process.env.PORT || port, async () => { // Process env port specified for hosting
  // Connect to the Db
  connectDB();
  console.log(`Example app listening on port ${port}`);
});

// Get the Pokemon stuff from github repo
async function getPokemonDocs() {
    try {
      const pokedexResponse = await axios.get(pokedexJsonUrl);
      const pokemonTypeResponse = await axios.get(pokemonTypeJsonUrl);

      let pokedex = pokedexResponse.data;
      let pokemonType = pokemonTypeResponse.data;
      
      Object.keys(pokedex).forEach( key => {
        pokedex[key].base["Special Attack"] = pokedex[key].base["Sp. Attack"];
        pokedex[key].base["Special Defense"] = pokedex[key].base["Sp. Defense"];
      });

      return [pokedex, pokemonType];
    } catch (error) {
      console.error(error);
    }
  }

// Insert Pokemon stuff into Atlas db on promise fulfilled
// An async function returns a promise, access the promise to get the stuff
// Within the promise, update Mongo Atlas db
getPokemonDocs().then(([pokedex, pokemonType]) => {
  
  // Fill cloud db
  pokemonModel.insertMany(pokedex, error => {
    console.log(error);
});
}, error => console.log(error));

// Specify the API paths

app.use(express.json());


// MIDTERM Query Arithmetic Comparison Operators
app.get("/pokemonsAdvancedFiltering", (req, res) => {
  let rawQueries = req.query["comparisonOperators"].split(",");
  let trimmedQueries = rawQueries.map(s => s.trim());
  let regexedQueries = trimmedQueries.map(s => s.replace(/<=/g, "$lte")
  .replace(/>/g, "$gt")
  .replace(/</g, "$lt")
  .replace(/>=/g, "$gte")
  .replace(/==/g, "$eq")
  .replace(/!=/g, "$nt")
  );


  
  ["HP<=20","Attack>30"]
  pokemonModel.find({"base.HP": {$lte: 20}, "base.Attack": {$gt: 30}}, (err, docs) => {
    res.json(docs);
  });

  
});

// MIDTERM Query push Operator
app.patch("/pokemonsAdvancedUpdate", (req, res) => {
  // {"id":"1","pushOperator":"[Electric, Water]"}
  let pokemonId = req.query["id"];
  let rawQueries = req.query["pushOperator"].split(",");
  let trimmedQueries = rawQueries.map(s => s.trim());
})

// Get all the pokemons
app.get('/api/assignment1/pokemons', (req, res) => {
  pokemonModel.find({}).skip(req.query.after).limit(req.query.count)
  .then(docs => {
      console.log(docs);
      res.json(docs);
  })
  .catch(err => {
      console.error(err);
      res.json({ msg: "fail to return all pokemons...  Check with server devs" });
  });
});

// Get a pokemon based on id
app.get('/api/assignment1/pokemons/:id', (req, res) => {
  console.log(req.params.id);
  pokemonModel.find({ id: req.params.id})
      .then(doc => {
          
        if (!doc.length) {
          res.json({ msg: `pokemon with id ${req.params.id} does not exist...` });
        } else {
          console.log(doc);
          res.json(doc);
        }
        
      })
      .catch(err => {
          console.error(err);
          res.json({ msg: `db error...  Check with server devs` });
      });
});

// Delete a pokemon
app.delete('/api/assignment1/pokemons/:id', (req, res) => {
  pokemonModel.deleteOne({ id: req.params.id }, (err, result) => {
      if (err) {
        console.log(err);
        res.json({ msg: `pokemon with id ${req.params.id} does not exist...` });
      }
      console.log(result);
    });
  
    res.send("Deleted successfully?");
});

// Add a new pokemon
app.post('/api/assignment1/pokemons', (req, res) => {
  try {
    pokemonModel.create(req.body, err => {
      if (err) console.log(err);
      // saved!
    });
  } catch (error) {
    console.log(error);
    res.json({ msg: `Invalid pokemon!` });
  }  
    res.json(req.body);
});

// Modify a pokemon
app.patch('/api/assignment1/pokemons/:id', (req, res) => {
  pokemonModel.updateOne({ id: req.params.id }, req.body, (err, res) => {
  // Updated at most one doc, `res.nModified` contains the number
  // of docs that MongoDB updated
  if (err) console.log(err);
  console.log(res);
});

res.send("Updated successfully!");
});


app.put('/api/assignment1/pokemons/:id', (req, res) => {
  pokemonModel.replaceOne({id: req.params.id }, req.body, (err, res) => {
    // Updated at most one doc, `res.nModified` contains the number
    // of docs that MongoDB updated
    if (err) console.log(err);
    console.log(res);
  });
  res.send('Replacement successful!');
})