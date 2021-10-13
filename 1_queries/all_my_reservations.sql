SELECT properties.id, properties.title, properties.cost_per_night, reservations.start_date, b.average_rating FROM reservations
JOIN properties ON reservations.property_id = properties.id
JOIN (SELECT properties.id as property_id, properties.cost_per_night, avg(property_reviews.rating) as average_rating FROM properties 
JOIN property_reviews ON properties.id = property_reviews.property_id
GROUP BY properties.id
ORDER BY properties.cost_per_night) as b ON reservations.property_id = b.property_id
WHERE reservations.guest_id = 1 AND reservations.end_date <= now()::date
ORDER BY reservations.start_date
LIMIT 10;




