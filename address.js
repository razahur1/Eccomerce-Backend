var config = {
  cUrl: "https://api.countrystatecity.in/v1/countries",
  ckey: "NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA==",
  geoNamesUrl: "http://api.geonames.org/postalCodeSearchJSON",
  geoNamesUsername: "razahur110",
};

var countrySelect = document.querySelector(".country"),
  stateSelect = document.querySelector(".state"),
  citySelect = document.querySelector(".city"),
  postalCodeSelect = document.querySelector(".postal-code"); // Add this line if you have a postal code dropdown

function loadCountries() {
  let apiEndPoint = config.cUrl;

  fetch(apiEndPoint, { headers: { "X-CSCAPI-KEY": config.ckey } })
    .then((Response) => Response.json())
    .then((data) => {
      data.forEach((country) => {
        const option = document.createElement("option");
        option.value = country.iso2;
        option.textContent = country.name;
        countrySelect.appendChild(option);
      });
    })
    .catch((error) => console.error("Error loading countries:", error));

  stateSelect.disabled = true;
  citySelect.disabled = true;
  postalCodeSelect.disabled = true; // Disable postal code dropdown
}

function loadStates() {
  stateSelect.disabled = false;
  citySelect.disabled = true;
  postalCodeSelect.disabled = true; // Disable postal code dropdown
  const selectedCountryCode = countrySelect.value;

  stateSelect.innerHTML = '<option value="">Select State</option>';
  citySelect.innerHTML = '<option value="">Select City</option>';
  postalCodeSelect.innerHTML = '<option value="">Select Postal Code</option>'; // Clear postal codes

  fetch(`${config.cUrl}/${selectedCountryCode}/states`, {
    headers: { "X-CSCAPI-KEY": config.ckey },
  })
    .then((response) => response.json())
    .then((data) => {
      data.forEach((state) => {
        const option = document.createElement("option");
        option.value = state.iso2;
        option.textContent = state.name;
        stateSelect.appendChild(option);
      });
    })
    .catch((error) => console.error("Error loading states:", error));
}

function loadCities() {
  citySelect.disabled = false;
  const selectedCountryCode = countrySelect.value;
  const selectedStateCode = stateSelect.value;

  citySelect.innerHTML = '<option value="">Select City</option>';
  postalCodeSelect.innerHTML = '<option value="">Select Postal Code</option>'; // Clear postal codes

  fetch(
    `${config.cUrl}/${selectedCountryCode}/states/${selectedStateCode}/cities`,
    {
      headers: { "X-CSCAPI-KEY": config.ckey },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      data.forEach((city) => {
        const option = document.createElement("option");
        option.value = city.iso2;
        option.textContent = city.name;
        citySelect.appendChild(option);
      });
    })
    .catch((error) => console.error("Error loading cities:", error));
}

function loadPostalCodes() {
  postalCodeSelect.disabled = false;
  const selectedCityCode = citySelect.value;

  postalCodeSelect.innerHTML = '<option value="">Select Postal Code</option>'; // Clear existing postal codes

  fetch(
    `${config.geoNamesUrl}?placename=${selectedCityCode}&username=${config.geoNamesUsername}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.postalCodes) {
        data.postalCodes.forEach((postalCode) => {
          const option = document.createElement("option");
          option.value = postalCode.postalCode;
          option.textContent = postalCode.postalCode;
          postalCodeSelect.appendChild(option);
        });
      }
    })
    .catch((error) => console.error("Error loading postal codes:", error));
}

// Add event listener to load postal codes when a city is selected
citySelect.addEventListener("change", loadPostalCodes);

window.onload = loadCountries;
