async function calculateDistance() {
  try {
    const apikey = "AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao"; 
    //"AIzaSyCGz0yWi0pKAO3xfDnu1Pl9F5tqF7ecw8E";
    const vendorAddress = "Numaish Chowrangi, Karachi";
    const deliveryAddress = "Gulshan-e-Iqbal, Karachi";
    const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${vendorAddress}&destinations=${deliveryAddress}&key=${apikey}`;

    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log(data);
    console.log(data.rows[0].elements[0]);
  } catch (error) {
    console.error(error);
  }
}

calculateDistance();
