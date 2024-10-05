async function calculateDistance() {
  try {
    const apikey = "AlzaSysN3DanROghubBHAw3cqDNxdEuPvrXw88E";
    //"AIzaSyCGz0yWi0pKAO3xfDnu1Pl9F5tqF7ecw8E";
    const vendorAddress = "Hiranand Street, Karachi";
    const deliveryAddress = "Gulshan-e-Iqbal, Karachi";
    const apiUrl = `https://maps.gomaps.pro/maps/api/distancematrix/json?units=imperial&origins=${vendorAddress}&destinations=${deliveryAddress}&key=${apikey}`;
    //https://maps.gomaps.pro/maps/api/distancematrix/json?destinations=New York&origins=New Jercy&key=your api key from gomaps.pro
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log(data);
    console.log(data.rows[0].elements[0]);
  } catch (error) {
    console.error(error);
  }
}

calculateDistance();

// Convert degrees to radians
// function toRadians(degrees) {
//   return (degrees * Math.PI) / 180;
// }

// // Haversine formula to calculate the distance between two points
// function haversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371; // Radius of the Earth in kilometers
//   const dLat = toRadians(lat2 - lat1);
//   const dLon = toRadians(lon2 - lon1);

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRadians(lat1)) *
//       Math.cos(toRadians(lat2)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distance = R * c; // Distance in kilometers
//   return distance;
// }

// // Function to get coordinates from the Nominatim API
// async function getCoordinates(city, street, zipcode, country) {
//   const url = `https://nominatim.openstreetmap.org/search?q=${street},${city},${zipcode},${country}&format=json`;

//   try {
//     const response = await fetch(url);
//     const data = await response.json();

//     if (data && data.length > 0) {
//       const { lat, lon } = data[0];
//       return { lat: parseFloat(lat), lon: parseFloat(lon) };
//     } else {
//       throw new Error("No coordinates found for the given location");
//     }
//   } catch (error) {
//     console.error("Error fetching coordinates:", error);
//     throw error;
//   }
// }

// // Function to calculate the shipping distance between two locations
// async function calculateShippingDistance(
//   fromStreet,
//   fromCity,
//   fromZipcode,
//   fromCountry,
//   toStreet,
//   toCity,
//   toZipcode,
//   toCountry
// ) {
//   try {
//     // Get coordinates for the origin
//     const fromCoordinates = await getCoordinates(
//       fromCity,
//       fromStreet,
//       fromZipcode,
//       fromCountry
//     );
//     console.log(
//       `Origin Coordinates: ${fromCoordinates.lat}, ${fromCoordinates.lon}`
//     );

//     // Get coordinates for the destination
//     const toCoordinates = await getCoordinates(
//       toCity,
//       toStreet,
//       toZipcode,
//       toCountry
//     );
//     console.log(
//       `Destination Coordinates: ${toCoordinates.lat}, ${toCoordinates.lon}`
//     );

//     // Calculate the distance between the two locations
//     const distance = haversineDistance(
//       fromCoordinates.lat,
//       fromCoordinates.lon,
//       toCoordinates.lat,
//       toCoordinates.lon
//     );
//     console.log(`Shipping Distance: ${distance.toFixed(2)} km`);

//     return distance;
//   } catch (error) {
//     console.error("Error calculating shipping distance:", error);
//   }
// }

// // Example usage
// (async () => {
//   const fromStreet = "Hiranand Street";
//   const fromCity = "Karachi";
//   const fromZipcode = "74400";
//   const fromCountry = "PK";

//   // const toStreet = "University Road";
//   // const toCity = "Karachi";
//   // const toZipcode = "75270";
//   // const toCountry = "PK";

//   // const toStreet = "I.I. Chundrigar Road";
//   // const toCity = "Karachi";
//   // const toZipcode = "74000";
//   // const toCountry = "PK";

//   // const toStreet = "Tariq Road";
//   // const toCity = "Karachi";
//   // const toZipcode = "75400";
//   // const toCountry = "PK";

//   const toStreet = "Nazimabad Block 4";
//   const toCity = "Karachi";
//   const toZipcode = "74600";
//   const toCountry = "PK";

//   await calculateShippingDistance(
//     fromStreet,
//     fromCity,
//     fromZipcode,
//     fromCountry,
//     toStreet,
//     toCity,
//     toZipcode,
//     toCountry
//   );
// })();
