"use strict";

import express from 'express';
const app = express();
import { connectDB } from './connect-db.js';
import { fillPokemonDB } from './fill-pokemon-db.js';
import { errorHandler, InvalidURL, InvalidInputs, PokemonBadRequest, PokemonNotFound, PokemonNotFoundForRemoval, PokemonNotFoundForReplacement, PokemonNotFoundForUpdate } from './error-handler.js';

import dotenv from 'dotenv';
dotenv.config();

import crypto from 'crypto';
const secret = crypto.randomBytes(64).toString("hex");

let pokemonModel = null;
app.listen(process.env.PORT, async () => { // Process env port specified for hosting
  // Connect to the Db
  await connectDB();
  // Set up the Db and fill it
  pokemonModel = fillPokemonDB();
  console.log(`Example app listening on port ${process.env.PORT}`);
});

const asyncWrapper = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
};

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
app.get('/api/assignment1/pokemons', asyncWrapper((req, res, next) => {
  pokemonModel.find({}).skip(req.query.after).limit(req.query.count)
  .then(docs => {
      console.log(docs);
      res.json(docs);
  })
  .catch(err => {
      next(err);      
  });
}));

// Get a pokemon based on id
app.get('/api/assignment1/pokemons/:id', asyncWrapper((req, res, next) => {
  let pokemonId =  req.params.id;
  console.log(pokemonId);

  try {
    if (!parseInt(pokemonId)) {
    throw new PokemonNotFound(pokemonId);
  }
  } catch (error) {
    next(error);
  }

  pokemonModel.find({ id: pokemonId})
      .then(doc => {
          
        if (!doc.length) {
          throw new PokemonNotFound(pokemonId);
        } else {
          console.log(doc);
          res.json(doc);
        }
      })
      .catch(err => {
        next(err);  
      });
}));

// Add a new pokemon
app.post('/api/assignment1/pokemons', asyncWrapper((req, res, next) => {
  
  pokemonModel.create(req.body)
    .then(doc => {
      res.json(doc);
    })
    .catch(err => {
      next(err);
    });
  
}));

// Delete a pokemon
app.delete('/api/assignment1/pokemons/:id', asyncWrapper((req, res, next) => {

  pokemonModel.findOneAndDelete({ id: req.params.id }, function (error, doc) {
  
  try {
    if (doc) {
    res.send(`Successfully deleted pokemon with id ${req.params.id}`);
  } else if (error) {
    next(error);
  } else {
    throw new PokemonNotFoundForRemoval(req.params.id);
  }
  } catch (error) {
    next(error);
  }  
  });  
  
}));

// Replace a pokemon
app.put('/api/assignment1/pokemons/:id', asyncWrapper((req, res, next) => {
  
  const selection = { id: req.params.id }
  const replacement = req.body
  const options = {
    new: true,
    runValidators: true,
    overwrite: true
  }

  pokemonModel.findOneAndUpdate(selection, replacement, options, (err, doc) => {
    try {
      if (doc) {
        res.send("Replaced successfully!");
      } else if (err) {
        throw new InvalidInputs;
      } else {
        throw new PokemonNotFoundForReplacement(req.params.id);
      }
    } catch (error) {
      next(error);
    }
  }); 
  
}));

// Modify a pokemon
app.patch('/api/assignment1/pokemons/:id', asyncWrapper((req, res, next) => {
  
  const selection = { id: req.params.id }
  const update = req.body
  const options = {
    new: true,
    runValidators: true
  }

  pokemonModel.findOneAndUpdate(selection, update, options, (err, doc) => {
    try {
      if (doc) {
        res.send("Updated successfully!");
      } else if (err) {
        throw new InvalidInputs;
      } else {
        throw new PokemonNotFoundForUpdate(req.params.id);
      }
    } catch (error) {
      next(error);
    }
    
  }); 
  
}));

// An endpoint to catch all invalid URL errors from any http method
app.all("*", asyncWrapper((req, res, next) => {
  try {
    throw new InvalidURL;
  } catch (error) {
    next(error);
  }  
}));


// Trigger our error handler module
app.use((err, req, res, next) => {
  errorHandler(err, res);
});