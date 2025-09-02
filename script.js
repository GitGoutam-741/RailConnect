<<<<<<< Updated upstream

// Filter Function for Search
        document.getElementById("dropdownSearch").addEventListener("input", function () {
            const filter = this.value.toLowerCase();
            const items = document.querySelectorAll("#dropdownList li:not(.group)");
            items.forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(filter) ? "block" : "none";
            });
        });



        //For station suggestion:


let stations = [];

// Load station list
fetch("stations.json")
  .then(res => res.json())
  .then(data => {
    stations = data.stations ? data.stations : data; // supports both formats
    console.log(`Loaded ${stations.length} stations.`);
  })
  .catch(err => console.error("Error loading stations.json:", err));

function setupAutocomplete(inputId, suggestionId) {
  const input = document.getElementById(inputId);
  const suggestionBox = document.getElementById(suggestionId);

  input.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();
    suggestionBox.innerHTML = "";

    if (!query) {
      suggestionBox.style.display = "none";
      return;
    }

    const matches = stations.filter(
      s =>
        s.name.toLowerCase().startsWith(query) ||
        s.code.toLowerCase().startsWith(query)
    ).slice(0, 10);

    if (!matches.length) {
      suggestionBox.style.display = "none";
      return;
    }

    matches.forEach(s => {
      const div = document.createElement("div");
      div.textContent = `${s.name} (${s.code})`;
      div.classList.add("suggestion-item");
      div.onclick = () => {
        input.value = `${s.name} (${s.code})`;
        suggestionBox.style.display = "none";
      };
      suggestionBox.appendChild(div);
    });

    suggestionBox.style.display = "block";
  });

  document.addEventListener("click", (e) => {
    if (e.target !== input) suggestionBox.style.display = "none";
  });
}

setupAutocomplete("fromStation", "fromSuggestions");
setupAutocomplete("toStation", "toSuggestions");

=======
// script.js

async function registerUser(e) {
  e.preventDefault();

  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;
  const email = document.getElementById("reg-email").value;

  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email })
  });

  const data = await res.json();
  alert(data.message);
}

async function loginUser(e) {
  e.preventDefault();

  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  alert(data.message);
}
>>>>>>> Stashed changes
