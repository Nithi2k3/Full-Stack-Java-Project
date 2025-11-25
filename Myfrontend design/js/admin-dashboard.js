function normalizeCity(city) {
  if (!city) return "Unknown";
  city = city.trim().toLowerCase();
  if (city === "pondicherry" || city === "puducherry") return "Puducherry";
  return city.charAt(0).toUpperCase() + city.slice(1);
}

let selectedHospitalId = null;
const token = localStorage.getItem("jwtToken");

// ✅ Gate: only ADMIN
if (!token) {
  window.location.href = "login.html";
} else {
  const payload = JSON.parse(atob(token.split('.')[1]));
  if (payload.role !== "ADMIN" && payload.role !== "ROLE_ADMIN") {
    alert("Access Denied! Admin only.");
    window.location.href = "login.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadGroupedByCity();

  document.getElementById("adminSearchBtn").addEventListener("click", doAdminSearch);
  document.getElementById("adminSearch").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doAdminSearch();
    }
  });

  document.getElementById("adminSearch").addEventListener("input", adminSuggestions);

  document.getElementById("hospitalAddForm").addEventListener("submit", onAddSubmit);
  document.getElementById("addHospitalBtn").addEventListener("click", showAddForm);
  document.getElementById("cancelAddBtn").addEventListener("click", hideAddForm);
});

function logout() {
  localStorage.removeItem("jwtToken");
  window.location.href = "index.html";
}

/* ===== Load & Group ===== */
async function loadGroupedByCity() {
  const container = document.getElementById("adminGroupedList");
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
  const container = document.getElementById("adminGroupedList");
  const block = document.createElement("div");
  block.className = "city-block";
  block.innerHTML = `
    <div class="city-heading"><h3>${normalizeCity(city)}</h3></div>
    <div class="city-hospitals">
      ${
        hospitals.map(h => `
          <div class="hospital-card">
            <div>
              <strong>${h.name}</strong>
              <div class="sub">${h.area} — ${h.address}</div>
            </div>
            <div class="actions">
              <button class="delete-btn" data-id="${h.id}">Delete</button>
            </div>
          </div>`).join("")
      }
    </div>
  `;
  container.appendChild(block);

  block.querySelectorAll(".delete-btn").forEach(btn =>
    btn.addEventListener("click", () => confirmDelete(btn.getAttribute("data-id")))
  );
}

/* ===== Search ===== */
function doAdminSearch() {
  const q = document.getElementById("adminSearch").value.trim();
  if (!q) {
    loadGroupedByCity();
    return;
  }

  fetch(`http://localhost:8080/hospitals/search/${encodeURIComponent(q)}`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => renderGrouped(data))
    .catch(err => console.error("Search failed:", err));
}

function renderGrouped(hospitals) {
  const byCity = {};
  (hospitals || []).forEach(h => {
    const c = normalizeCity(h.city || "Unknown");
    if (!byCity[c]) byCity[c] = [];
    byCity[c].push(h);
  });

  const container = document.getElementById("adminGroupedList");
  container.innerHTML = "";
  const cities = Object.keys(byCity).sort();

  if (cities.length === 0) {
    container.innerHTML = "<p>No matches found.</p>";
    return;
  }

  cities.forEach(city => renderCityGroup(city, byCity[city]));
}

/* ===== Add Hospital ===== */
function showAddForm() {
  document.getElementById("addForm").style.display = "flex";
}
function hideAddForm() {
  document.getElementById("addForm").style.display = "none";
}
function onAddSubmit(e) {
  e.preventDefault();

  const hospitalData = {
    name: document.getElementById("addName").value,
    area: document.getElementById("addArea").value,
    address: document.getElementById("addAddress").value,
    city: document.getElementById("addCity").value,
    contactNo: document.getElementById("addContactNo").value
  };

  fetch(`http://localhost:8080/hospitals`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(hospitalData)
  })
    .then(res => {
      if (!res.ok) throw new Error("Add failed");
      return res.json();
    })
    .then(() => {
      hideAddForm();
      showToast("✅ Hospital added successfully!");
      loadGroupedByCity();
    })
    .catch(() => alert("Failed to add hospital."));
}

/* ===== Delete Hospital ===== */
function confirmDelete(id) {
  if (confirm("Are you sure you want to delete this hospital?")) {
    fetch(`http://localhost:8080/hospitals/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Delete failed");
        showToast("🗑️ Hospital deleted successfully!");
        loadGroupedByCity();
      })
      .catch(() => alert("Failed to delete hospital."));
  }
}

/* ===== Search Suggestions + Keyboard Nav ===== */
let selectedIndex = -1;
function adminSuggestions() {
  const query = document.getElementById("adminSearch").value.trim();
  let dropdown = document.getElementById("adminSearchResults");

  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.id = "adminSearchResults";
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
      selectedIndex = -1;

      if (!data || data.length === 0) {
        dropdown.innerHTML = `<div class='suggestion-item'>No matches found</div>`;
        return;
      }

      data.forEach(h => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.innerHTML = `<b>${h.name}</b> <span style="color:gray;">(${h.area}, ${h.city})</span>`;
        div.addEventListener("click", () => {
          document.getElementById("adminSearch").value = h.name;
          dropdown.style.display = "none";
          renderGrouped([h]);
        });
        dropdown.appendChild(div);
      });

      enableKeyboardNavigation(data, dropdown);
    })
    .catch(err => console.error("Error loading suggestions:", err));
}

function enableKeyboardNavigation(data, dropdown) {
  const input = document.getElementById("adminSearch");
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
        renderGrouped([hospital]);
      } else {
        doAdminSearch();
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

/* ===== Toast Popup ===== */
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

/* ===== Helpers ===== */
async function fetchJSON(url) {
  const r = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
