function normalizeCity(city) {
  if (!city) return "Unknown";
  city = city.trim().toLowerCase();

  if (city === "pondicherry" || city === "puducherry") return "Puducherry";

  return city.charAt(0).toUpperCase() + city.slice(1);
}

document.addEventListener("DOMContentLoaded", () => {
  // Show homepage preview (top 3 per city in grid)
  loadCityPreviews();

  // Wire search
  const input = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) searchBtn.addEventListener("click", searchHospitals);
  if (input) input.addEventListener("input", searchSuggestions);

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("searchResults");
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });
});

/* =========  A) HOMEPAGE PREVIEW (top 3 per city, grid) ========= */
async function loadCityPreviews() {
  const preview = document.getElementById("cityPreview");
  preview.innerHTML = `<p>Loading cities...</p>`;

  try {
    const cities = await fetchJSON("http://localhost:8080/hospitals/cities");
    if (!cities || cities.length === 0) {
      preview.innerHTML = "<p>No cities found.</p>";
      return;
    }

    const normalizedMap = {};
    cities.forEach(city => {
      const norm = normalizeCity(city);
      if (!normalizedMap[norm]) normalizedMap[norm] = city; // keep one original
    });

    preview.innerHTML = "";
    for (const norcity of Object.keys(normalizedMap)) {
      const rawCity = normalizedMap[norcity];
      const top = await fetchJSON(
        `http://localhost:8080/hospitals/top/${encodeURIComponent(rawCity)}`
      );
      const limited = (top || []).slice(0, 3);

      const citySection = document.createElement("div");
      citySection.className = "city-section";
      citySection.innerHTML = `
        <div class="city-header">
          <h2>${norcity}</h2>
        </div>
        <div class="city-cards">
          ${limited.map(cardHTML).join("") || "<p>No hospitals yet.</p>"}
        </div>
      `;

      preview.appendChild(citySection);
    }

    // attach events
    preview.querySelectorAll(".city-cards").forEach(attachCardClicks);
    preview.querySelectorAll(".view-all").forEach((btn) => {
      btn.addEventListener("click", () => {
        const city = btn.getAttribute("data-city");
        searchByCity(city);
      });
    });
  } catch (e) {
    console.error("Error loading city previews:", e);
    preview.innerHTML = "<p>Failed to load city preview.</p>";
  }
}

/* =========  B) SEARCH (name/area/city) ========= */
function searchHospitals() {
  let query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  fetch(`http://localhost:8080/hospitals/search/${encodeURIComponent(query)}`)
    .then((res) => res.json())
    .then((data) =>
      displayHospitals(data, `Search results for “${query}”`)
    )
    .catch((err) => console.error("Search error:", err));
}

/* =========  C) SEARCH SUGGESTIONS with keyboard nav ========= */
let selectedIndex = -1;

function searchSuggestions() {
  let query = document.getElementById("searchInput").value.trim();
  const dropdown = document.getElementById("searchResults");

  if (query.length < 1) {
    dropdown.innerHTML = "";
    dropdown.style.display = "none";
    return;
  }

  fetch(`http://localhost:8080/hospitals/suggestions/${encodeURIComponent(query)}`)
    .then((res) => res.json())
    .then((data) => {
      dropdown.innerHTML = "";
      dropdown.style.display = "block";
      selectedIndex = -1;

      if (!data || data.length === 0) {
        dropdown.innerHTML = `<div class='suggestion-item'>
          <span class="suggestion-icon">🔍</span>No matches found
        </div>`;
        return;
      }

      data.forEach((item) => {
        let div = document.createElement("div");
        div.className = "suggestion-item";
        div.innerHTML = `<span class="suggestion-icon">🏥</span> 
          <b>${item.name}</b> <span style="color:gray;">(${item.area}, ${normalizeCity(item.city ?? "")})</span>`;
        div.addEventListener("click", () => {
          document.getElementById("searchInput").value = item.name;
          dropdown.style.display = "none";
          window.location.href = `hospital.html?id=${item.id}`;
        });
        dropdown.appendChild(div);
      });

      enableKeyboardNavigation(data);
    })
    .catch((err) => console.error("Error loading suggestions:", err));
}

function enableKeyboardNavigation(data) {
  const input = document.getElementById("searchInput");
  const dropdown = document.getElementById("searchResults");
  const items = dropdown.getElementsByClassName("suggestion-item");

  input.onkeydown = function (e) {
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      selectedIndex = (selectedIndex + 1) % items.length;
      highlight(items);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      highlight(items);
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < data.length) {
        const hospital = data[selectedIndex];
        input.value = hospital.name;
        dropdown.style.display = "none";
        window.location.href = `hospital.html?id=${hospital.id}`;
      } else {
        searchHospitals();
      }
      e.preventDefault();
    }
  };
}

function highlight(items) {
  for (let i = 0; i < items.length; i++) {
    items[i].style.background = i === selectedIndex ? "#f0f0f0" : "white";
  }
}

/* =========  D) DISPLAY HOSPITALS ========= */
function displayHospitals(data, titleText = "Hospitals") {
  const list = document.getElementById("hospitalList");
  list.innerHTML = "";

  if (!data || data.length === 0) {
    list.innerHTML = "<p>No hospitals found.</p>";
    return;
  }

  data.forEach((h) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = cardHTML(h);
    list.appendChild(wrapper.firstElementChild);
  });

  attachCardClicks(list);
}

/* ========= Helpers ========= */
function cardHTML(h) {
  return `
    <div class="hospital-card" data-id="${h.id}" style="cursor:pointer">
      <h3>${h.name}</h3>
      <p>${h.area}, ${normalizeCity(h.city ?? "")} </p>
      <p>${h.address}</p>
    </div>
  `;
}

function attachCardClicks(container) {
  container.querySelectorAll(".hospital-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      if (id) window.location.href = `hospital.html?id=${id}`;
    });
  });
}

async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return r.json();
}
