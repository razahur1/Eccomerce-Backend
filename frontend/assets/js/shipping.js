// async function calculateDistance() {
//   try {
//     const apikey = "AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao";
//     //"AIzaSyCGz0yWi0pKAO3xfDnu1Pl9F5tqF7ecw8E";
//     const vendorAddress = "Numaish Chowrangi, Karachi";
//     const deliveryAddress = "Gulshan-e-Iqbal, Karachi";
//     const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${vendorAddress}&destinations=${deliveryAddress}&key=${apikey}`;

//     const response = await fetch(apiUrl);
//     const data = await response.json();
//     console.log(data);
//     console.log(data.rows[0].elements[0]);
//   } catch (error) {
//     console.error(error);
//   }
// }

// calculateDistance();

function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (degree) => degree * (Math.PI / 180);

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
}

// // Coordinates for Numaish Chowrangi and Gulshan Iqbal Block 2
// const lat1 = 24.8457;
// const lon1 = 67.0228;
// const lat2 = 24.8777;
// const lon2 = 67.078;

// const distance = calculateDistance(lat1, lon1, lat2, lon2);
// console.log(`Distance: ${distance.toFixed(2)} km`);


async function getCoordinates(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.length > 0) {
      const location = data[0];
      return {
        latitude: location.lat,
        longitude: location.lon
      };
    } else {
      console.error('Address not found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching the geocoding data:', error);
  }
}

// Example usage
const address = 'Gulshan Iqbal Block 2, Karachi';
getCoordinates(address).then((coordinates) => {
  if (coordinates) {
    console.log(`Latitude: ${coordinates.latitude}, Longitude: ${coordinates.longitude}`);

    // Now calculate the distance
    const lat1 = parseFloat(coordinates.latitude);
    const lon1 = parseFloat(coordinates.longitude);

    const lat2 = 24.8777;
    const lon2 = 67.078;

    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    console.log(`Distance: ${distance.toFixed(2)} km`);
  }
});
