function normalizeCity(city) {
  if (!city) return "Unknown";
  city = city.trim().toLowerCase();

  if (city === "pondicherry" || city === "puducherry") return "Puducherry";

  return city.charAt(0).toUpperCase() + city.slice(1);
}

let selectedHospitalId = null;
const token = localStorage.getItem("jwtToken");

// ✅ Gate: staff only
if (!token) {
  window.location.href = "login.html";
} else {
  const payload = JSON.parse(atob(token.split('.')[1]));
  if (payload.role !== "STAFF" && payload.role !== "ROLE_STAFF") {
    alert("Access Denied! Staff only.");
    window.location.href = "login.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadGroupedByCity();

  document.getElementById("staffSearchBtn").addEventListener("click", doStaffSearch);
  document.getElementById("staffSearch").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doStaffSearch();
    }
  });

  document.getElementById("staffSearch").addEventListener("input", staffSuggestions);

  document.getElementById("hospitalUpdateForm").addEventListener("submit", onUpdateSubmit);
});

function logout() {
  localStorage.removeItem("jwtToken");
  window.location.href = "index.html";
}

/* ===== Load & Group ===== */
async function loadGroupedByCity() {
  const container = document.getElementById("groupedList");
  container.innerHTML = "<p>Loading…</p>";

  try {
    const cities = await fetchJSON("http://localhost:8080/hospitals/cities");
    container.innerHTML = "";
    for (const rawcity of cities) {
      const norcity = normalizeCity(rawcity);
      const hospitals = await fetchJSON(`http://localhost:8080/hospitals/city/${encodeURIComponent(rawcity)}`);
      renderCityGroup(norcity, hospitals);
    }
  } catch {
    container.innerHTML = "<p>Failed to load hospitals.</p>";
  }
}

function renderCityGroup(city, hospitals) {
  const container = document.getElementById("groupedList");
  const block = document.createElement("div");
  block.className = "city-block";
  block.innerHTML = `
    <div class="city-heading"><h3>${normalizeCity(city)}</h3></div>
    <div class="city-hospitals">
      ${hospitals.map(h => `
        <div class="hospital-card">
          <div>
            <strong>${h.name}</strong>
            <div class="sub">${h.area} — ${h.address}</div>
          </div>
          <button class="update-btn" data-id="${h.id}">Update</button>
        </div>`).join("")}
    </div>
  `;
  container.appendChild(block);

  block.querySelectorAll(".update-btn").forEach(btn =>
    btn.addEventListener("click", () => showUpdateForm(btn.getAttribute("data-id")))
  );
}

/* ===== Staff search ===== */
function doStaffSearch() {
  const q = document.getElementById("staffSearch").value.trim();
  const container = document.getElementById("groupedList");

  if (!q) {
    loadGroupedByCity();
    return;
  }

  fetch(`http://localhost:8080/hospitals/search/${encodeURIComponent(q)}`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => renderGrouped(data))
    .catch(err => {
      console.error("Search failed:", err);
      container.innerHTML = "<p>Search failed.</p>";
    });
}

function renderGrouped(hospitals) {
  const byCity = {};
  (hospitals || []).forEach(h => {
    const c = normalizeCity(h.city || "Unknown");
    if (!byCity[c]) byCity[c] = [];
    byCity[c].push(h);
  });

  const container = document.getElementById("groupedList");
  container.innerHTML = "";
  const cities = Object.keys(byCity).sort();

  if (cities.length === 0) {
    container.innerHTML = "<p>No matches found.</p>";
    return;
  }

  cities.forEach(city => renderCityGroup(city, byCity[city]));
}

/* ===== Suggestions dropdown ===== */
function staffSuggestions() {
  const query = document.getElementById("staffSearch").value.trim();
  let dropdown = document.getElementById("staffSearchResults");

  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.id = "staffSearchResults";
    document.querySelector(".top-bar").appendChild(dropdown);
  }

  if (query.length < 2) {
    dropdown.innerHTML = "";
    dropdown.style.display = "none";
    return;
  }

  fetch(`http://localhost:8080/hospitals/suggestions/${encodeURIComponent(query)}`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      dropdown.innerHTML = "";
      dropdown.style.display = "block";

      if (!data || data.length === 0) {
        dropdown.innerHTML = `<div class='suggestion-item'>No matches found</div>`;
        return;
      }

      data.forEach(h => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.innerHTML = `<b>${h.name}</b> <span style="color:gray;">(${h.area}, ${h.city})</span>`;
        div.addEventListener("click", () => {
          document.getElementById("staffSearch").value = h.name;
          dropdown.style.display = "none";
          renderGrouped([h]);
        });
        dropdown.appendChild(div);
      });
    })
    .catch(err => console.error("Error loading suggestions:", err));
}

/* ===== Show update form ===== */
async function showUpdateForm(id) {
  selectedHospitalId = id;

  try {
    const hospital = await fetchJSON(`http://localhost:8080/hospitals/${id}`);

    // pre-fill values
    document.getElementById("totalBeds").value = hospital.totalBeds ?? "";
    document.getElementById("availableBeds").value = hospital.availableBeds ?? "";
    document.getElementById("availableDoctors").value = hospital.availableDoctors ?? "";
    document.getElementById("oxygenAvailable").value = hospital.oxygenAvailable ? "true" : "false";
    document.getElementById("ventilatorAvailable").value = hospital.ventilatorAvailable ? "true" : "false";
    document.getElementById("ambulanceAvailable").value = hospital.ambulanceAvailable ? "true" : "false";
    document.getElementById("open24Hours").value = hospital.open24Hours ? "true" : "false";

    document.getElementById("updateForm").style.display = "flex";
  } catch (err) {
    alert("Failed to load hospital details.");
    console.error(err);
  }
}

function hideUpdateForm() {
  selectedHospitalId = null;
  document.getElementById("updateForm").style.display = "none";
}

/* ===== Update submit ===== */
function onUpdateSubmit(e) {
  e.preventDefault();

  const hospitalData = {
    totalBeds: parseInt(document.getElementById("totalBeds").value || "0"),
    availableBeds: parseInt(document.getElementById("availableBeds").value || "0"),
    availableDoctors: parseInt(document.getElementById("availableDoctors").value || "0"),
    oxygenAvailable: document.getElementById("oxygenAvailable").value === "true",
    ventilatorAvailable: document.getElementById("ventilatorAvailable").value === "true",
    ambulanceAvailable: document.getElementById("ambulanceAvailable").value === "true",
    open24Hours: document.getElementById("open24Hours").value === "true"
  };

  fetch(`http://localhost:8080/hospitals/${selectedHospitalId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(hospitalData)
  })
    .then(res => {
      if (!res.ok) throw new Error("Update failed");
      return res.json().catch(() => ({}));
    })
    .then(() => {
      hideUpdateForm();
      showSuccessPopup("✅ Hospital updated successfully!");
      doStaffSearch();
    })
    .catch(err => {
      console.error(err);
      alert("Failed to update.");
    });
}

/* ===== Success popup ===== */
function showSuccessPopup(message) {
  const popup = document.createElement("div");
  popup.className = "toast-success";
  popup.textContent = message;
  document.body.appendChild(popup);

  void popup.offsetWidth;
  popup.classList.add("show");
  
  setTimeout(() => {
    popup.classList.remove("show");
    popup.addEventListener("transitionend", () => popup.remove(), {once:true });
  }, 2500);
}

/* ===== Helpers ===== */
async function fetchJSON(url) {
  const r = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
