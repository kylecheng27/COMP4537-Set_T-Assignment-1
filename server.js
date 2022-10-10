"use strict";

const express = require('express');
const app = express();
const axios = require('axios');
const mongoose = require('mongoose');

const pokedexJsonUrl = 'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json';
const pokemonTypeJsonUrl = 'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json';

// Connect to the Db
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
    'id': Number,
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

// Connect to the Mongo Atlas db
const mongoAtlasUsername = 'comp4537-assign1';
const mongoAtlasPassword = 'ZfFIAV6yrxYgiGSb';
const port = 5000;
app.listen(process.env.PORT || port, async () => { // Process env port specified for hosting
  try {
    // await mongoose.connect('mongodb://localhost:27017/comp4537-lab4'); //name of my db
    // mongodb atlas connection url -> mongodb+srv://username:password@cluster....
    await mongoose.connect(`mongodb+srv://${mongoAtlasUsername}:${mongoAtlasPassword}@cluster0.3ewe01h.mongodb.net/pokedex?retryWrites=true&w=majority`); //mongodb atlas remote cluster
} catch (error) {
    console.log('db error');
  }
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
  // console.log(pokedex);
  // console.log(pokemonType);
  
  // Fill cloud db
  pokemonModel.insertMany(pokedex, error => {
    console.log(error);
});

}, error => console.log(error));


// Specify the API paths

// Get all the pokemons
app.get('/api/assignment1/pokemons', (req, res) => {
  pokemonModel.find({})
  .then(docs => {
      console.log(docs);
      res.json(docs);
  })
  .catch(err => {
      console.error(err);
      res.json({ msg: "fail to return all pokemons...  Check with server devs" });
  });
});

// Get a pokemon
app.get('/api/assignment1/pokemons/:id', (req, res) => {
  console.log(req.params.id);
  pokemonModel.find({ _id: mongoose.Types.ObjectId(`${req.params.id}`) })
      .then(doc => {
          console.log(doc);
          res.json(doc);
      })
      .catch(err => {
          console.error(err);
          res.json({ msg: `fail to return pokemon with id ${req.params.id}...  Check with server devs` });
      });
});
