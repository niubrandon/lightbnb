SELECT properties.city, count(properties.city) as total_reservations FROM properties 
JOIN reservations ON properties.id = reservations.property_id
GROUP BY properties.city;
ORDER BY count(properties.city) DESC;