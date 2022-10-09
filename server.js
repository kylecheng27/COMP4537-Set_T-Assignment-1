const express = require('express');
const app = express();
const axios = require('axios');
const mongoose = require('mongoose');

const pokedexJsonUrl = 'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json';
const pokemonTypeJsonUrl = 'https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json';

// Grab the data from github repo
async function getPokemonDocs() {
    try {
      const pokedexResponse = await axios.get(pokedexJsonUrl);
      const pokedexArray = pokedexResponse.data;

      const pokemonTypeResponse = await axios.get(pokemonTypeJsonUrl);
      const pokemonTypeArray = pokemonTypeResponse.data;

      console.log(pokedexArray);
      console.log(pokemonTypeArray);
    } catch (error) {
      console.error(error);
    }
  }
getPokemonDocs();

// Connect to Atlas mongo and fill the db
const {Schema} = mongoose;

const pokemonSchema = new Schema({
    
});

// app.listen(5000, err => {
//     if(err) {
//         console.log(err);
//     }

//     https.get(pokemonJsonUrl, async res => {
//     console.log(res);
//     });
// });



