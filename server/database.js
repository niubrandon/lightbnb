const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  host:'localhost',
  database: 'lightbnb',
  password: '123',
  port: 5432
});
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = (email) => {

  return pool.query(
    `SELECT * FROM users
    WHERE email = $1;`
    ,
    [email]
  ).then((result) => {
    console.log("return from getUserWithEmail", result.rows[0]);
    let user;
    if (result.rows.length !== 0) {
      user = result.rows[0];
      return Promise.resolve(user);
    } else {
      user = null;
      return Promise.resolve(user);
    }
  
    
  }).catch((err) => console.log(err.message));
};

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithId = function(id) {

  return pool.query(
    `SELECT * FROM users
     WHERE id = $1;`
    , [id]
  ).then((result) => {
    //modify later
    console.log("return from getUserWithId", result.rows);
    
    return Promise.resolve(result.rows[0]);

  }

  ).catch((err) => console.log(err.message));
};

exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */

const addUser = function(user) {
  const {name, password, email} = user;
  return pool.query(
    `INSERT INTO users(name, email, password)
     VALUES($1, $3, $2)
     RETURNING *;
    `
    , [name, password, email]).then((result) => {
    //modify later handling error regarding user name and email exists
    console.log("addUser", result.rows[0]);
    return Promise.resolve(result.rows[0]);
  }).catch((err) => {
    console.log(err.message);
  });

};
/*
const addUser =  function(user) {
  const userId = Object.keys(users).length + 1;
  user.id = userId;
  users[userId] = user;
  return Promise.resolve(user);
} */
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  //use guest_id to find all
  //return getAllProperties(null, 2);
  return pool.query(
    `SELECT * FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    WHERE reservations.guest_id = $1
    LIMIT $2`,
    [guest_id, limit]
  ).then((result) => {
    console.log(result.rows);
    return Promise.resolve(result.rows);
  }).catch((err) => {
    console.log(err.message);
  });
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {

  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;
//options {city, owner_id, minimum_price_per_night, maximum_price_per_night, minumum_rating;}
  // 3
  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    queryString += `WHERE properties.owner_id = $${queryParams.length} `;
    
  }

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    if (queryParams.length === 0) {
      queryString += `WHERE city LIKE $${queryParams.length} `;
    } else {
      queryString += ` AND city LIKE $${queryParams.length} `;
    }
    
  }

  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night * 100}`);
    if (queryParams.length === 0) {
      queryString += `WHERE cost_per_night >= $${queryParams.length}`;
    } else {
      queryString += ` AND cost_per_night >= $${queryParams.length}`;
    }
    
  }

  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night * 100}`);
    if (queryParams.length === 0) {
      queryString += `WHERE cost_per_night <= $${queryParams.length}`;
    } else {
      queryString += ` AND cost_per_night <= $${queryParams.length}`;
    }
    
  }


  queryString += `GROUP BY properties.id`;

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    
    queryString += ` HAVING avg(property_reviews.rating) >= $${queryParams.length}`;
    
   
  }


  // 4
  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);


  let propertiesList;
  return pool
    .query(
      queryString,
      queryParams)
    .then((result) => {
      return result.rows;
    /*  propertiesList = result.rows;
      let resultProperties = {};
      for (let i = 1; i <= limit; i++) {
        resultProperties[i] = propertiesList[i - 1];
      }
      console.log("getAllProperties", resultProperties);
      return Promise.resolve(resultProperties); */
    })
    .catch((err) => {
      return err.message;
      /* Promise.reject(err); */
    });
    
};



/* const getAllProperties = function(options, limit = 10) {
  const limitedProperties = {};
  for (let i = 1; i <= limit; i++) {
    limitedProperties[i] = properties[i];
  }
  console.log("properties are", limitedProperties);
  return Promise.resolve(limitedProperties);
} */
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
