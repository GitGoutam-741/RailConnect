
const fromInput = document.getElementById("fromStation");
const toInput = document.getElementById("toStation");
const fromSuggestions = document.getElementById("fromSuggestions");
const toSuggestions = document.getElementById("toSuggestions");

function showSuggestions(input, suggestionsBox) {
    const query = input.value.toLowerCase();
    suggestionsBox.innerHTML = "";
    if (!query) {
        suggestionsBox.style.display = "none";
        return;
    }
    const matches = window.stations.filter(st => st.name.toLowerCase().includes(query) || st.code.toLowerCase().includes(query));
    if (matches.length === 0) {
        suggestionsBox.style.display = "none";
        return;
    }
    matches.forEach(st => {
        const div = document.createElement("div");
        div.classList.add("autocomplete-item");
        div.textContent = `${st.name} (${st.code})`;
        div.addEventListener("click", () => {
            input.value = `${st.name} (${st.code})`;
            suggestionsBox.style.display = "none";
        });
        suggestionsBox.appendChild(div);
    });
    suggestionsBox.style.display = "block";
}

fromInput.addEventListener("input", () => showSuggestions(fromInput, fromSuggestions));
toInput.addEventListener("input", () => showSuggestions(toInput, toSuggestions));

document.getElementById("ticketForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const from = fromInput.value;
    const to = toInput.value;
    const date = document.getElementById("journeyDate").value;
    const classType = document.getElementById("classType").value;
    if (!from || !to || !date) {
        alert("Please fill all fields");
        return;
    }
    alert(`Checking availability for:
From: ${from}
To: ${to}
Date: ${date}
Class: ${classType}

Redirecting to IRCTC website...`);
    window.open("https://www.irctc.co.in", "_blank");
});