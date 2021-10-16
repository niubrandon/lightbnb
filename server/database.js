const db = require('../db');


/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = (email) => {

  return db.query(
    `SELECT * FROM users
    WHERE email = $1;`
    ,
    [email], true
  );

};

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithId = function(id) {

  return db.query(
    `SELECT * FROM users
     WHERE id = $1;`
    , [id], true
  );

};

exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */

const addUser = function(user) {
  const {name, password, email} = user;

  return db.query(
    `INSERT INTO users(name, email, password)
     VALUES($1, $3, $2)
     RETURNING *;
    `, [name, password, email], true);
  

};

exports.addUser = addUser;

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return db.query(
    `SELECT * FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    WHERE reservations.guest_id = $1
    LIMIT $2`,
    [guest_id, limit]
  );
};
exports.getAllReservations = getAllReservations;


/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {

  const queryParams = [];

  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

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

  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  return db.query(
    queryString,
    queryParams);
    
};


exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {

  const {owner_id, title, description, thumbnail_photo_url, cover_photo_url,
    cost_per_night, street, city, province, post_code, country,
    parking_spaces, number_of_bathrooms, number_of_bedrooms} = property;
  
  const queryString = `INSERT INTO properties(owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms)
  VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING *`;
  const queryParams = [owner_id, title, description, thumbnail_photo_url,
    cover_photo_url, cost_per_night, street, city, province,
    post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms];

  return db.query(queryString, queryParams);
};

exports.addProperty = addProperty;

//modify parmas later
const addReservation = function(reservation) {
  console.log("printout the reservation", reservation);
  const queryString = `INSERT INTO reservations(start_date, end_date, property_id, guest_id)
  VALUES('2025-01-01', '2025-01-05', $1, $2)
  RETURNING *;
 `;
  const queryParams = [reservation["prop_id"], reservation["owner_id"]];
  return db.query(queryString, queryParams);
};

exports.addReservation = addReservation;


