// =============== THEME TOGGLE ===============
const themeToggle = document.getElementById("themeToggle");
(function initTheme() {
    const saved = localStorage.getItem("theme") || "light";
    if (saved === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "Light Mode";
    }
})();
themeToggle.addEventListener("click", () => {
    const dark = document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", dark ? "dark" : "light");
    themeToggle.textContent = dark ? "Light Mode" : "Dark Mode";
});

// =============== DOM HOOKS ========= ======
const fromInput = document.getElementById("fromStation");
const toInput = document.getElementById("toStation");
const fromSuggestions = document.getElementById("fromSuggestions");
const toSuggestions = document.getElementById("toSuggestions");
const searchBtn = document.getElementById("searchBtn");
const trainTypeSelect = document.getElementById("trainType");
const sortSelect = document.getElementById("sortBy");
const trainSearchInput = document.getElementById("trainSearch");
const trainList = document.getElementById("trainList");
const resultMeta = document.getElementById("resultMeta");

// Keep last route search for better rendering/sorting
let lastRouteQuery = null;

// =============== UTILITIES ===============
const toCode = (val) => val.trim().toUpperCase();
const timeToMin = (hhmm) => {
    if (!hhmm || hhmm === "--") return -1;
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
};

function cleanInputToCodeOrName(value) {
    // Allows users to type: "New Delhi (NDLS)" or "NDLS" or "New Delhi"
    const v = value.trim();
    const match = v.match(/\(([A-Z]{2,5})\)$/);
    if (match) return match[1];
    // If exactly looks like code
    if (/^[A-Z]{2,5}$/.test(v.toUpperCase())) return v.toUpperCase();
    return v; // name string, will resolve via stations
}

function findStationCode(mixed) {
    if (!mixed) return null;
    if (/^[A-Z]{2,5}$/.test(mixed)) return mixed;
    const q = mixed.toLowerCase();
    const found = window.stations.find(
        s =>
            s.code.toLowerCase() === q ||
            s.name.toLowerCase() === q
    );
    return found ? found.code : null;
}

function sliceRoute(train, fromCode, toCode) {
    const idxFrom = train.route.findIndex(r => r.code === fromCode);
    const idxTo = train.route.findIndex(r => r.code === toCode);
    if (idxFrom === -1 || idxTo === -1 || idxFrom >= idxTo) return null;
    const part = train.route.slice(idxFrom, idxTo + 1);
    return { segment: part, fromIdx: idxFrom, toIdx: idxTo };
}

function titleCase(s) {
    return s
        .split(" ")
        .filter(Boolean)
        .map(x => x[0]?.toUpperCase() + x.slice(1))
        .join(" ");
}

// =============== SUGGESTIONS ===============
function showSuggestions(input, box) {
    const q = input.value.trim().toLowerCase();
    box.innerHTML = "";
    if (!q) { box.classList.remove("show"); return; }

    const matches = window.stations
        .filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.code.toLowerCase().startsWith(q)
        )
        .slice(0, 10);

    if (!matches.length) { box.classList.remove("show"); return; }

    const frag = document.createDocumentFragment();
    matches.forEach(s => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.textContent = `${s.name} (${s.code})`;
        item.addEventListener("click", () => {
            input.value = `${s.name} (${s.code})`;
            box.classList.remove("show");
        });
        frag.appendChild(item);
    });
    box.appendChild(frag);
    box.classList.add("show");
}

fromInput.addEventListener("input", () => showSuggestions(fromInput, fromSuggestions));
toInput.addEventListener("input", () => showSuggestions(toInput, toSuggestions));
document.addEventListener("click", (e) => {
    if (!e.target.closest(".input-wrap")) {
        fromSuggestions.classList.remove("show");
        toSuggestions.classList.remove("show");
    }
});

// =============== RENDERING ===============
function renderTrains(trains, opts = {}) {
    const { fromCode = null, toCode = null } = opts;
    trainList.innerHTML = "";

    if (!trains.length) {
        trainList.innerHTML = `<li class="train-card"><div class="train-sub">No trains found.</div></li>`;
        resultMeta.textContent = "";
        return;
    }

    const frag = document.createDocumentFragment();

    trains.forEach(train => {
        let segment = train.route;
        let depFrom = train.route[0]?.dep ?? "--";
        let arrTo = train.route.at(-1)?.arr ?? "--";

        if (fromCode && toCode) {
            const sliced = sliceRoute(train, fromCode, toCode);
            if (!sliced) return; // skip this train if cannot slice
            segment = sliced.segment;
            depFrom = segment[0].dep;
            arrTo = segment.at(-1).arr;
        }

        const li = document.createElement("li");
        li.className = "train-card";

        const subTitle =
            fromCode && toCode
                ? `${fromCode} → ${toCode} • Dep ${depFrom || "--"} • Arr ${arrTo || "--"}`
                : `${segment[0].code} → ${segment.at(-1).code} • Dep ${depFrom || "--"} • Arr ${arrTo || "--"}`;

        li.innerHTML = `
      <div class="train-head">
        <div class="train-title">${train.number} — ${train.name}</div>
        <div class="train-type">${titleCase(train.type)}</div>
      </div>
      <div class="train-sub">${subTitle}</div>
      <div class="stops">
        ${segment
                .map(
                    s => `
          <div class="stop">
            <div class="stop-left">
              <span class="code">${s.code}</span>
              <span>${s.station}</span>
            </div>
            <div class="arrdep">Arr: ${s.arr} &nbsp; | &nbsp; Dep: ${s.dep}</div>
            <div class="pf">PF: ${s.pf || "-"}</div>
          </div>`
                )
                .join("")}
      </div>
    `;
        frag.appendChild(li);
    });

    trainList.appendChild(frag);
    resultMeta.textContent = `${trains.length} train(s)`;
}

// =============== FILTER + SORT ===============
function filterByType(trains) {
    const typeVal = (trainTypeSelect.value || "all").toLowerCase();
    if (typeVal === "all") return trains;
    return trains.filter(t => (t.type || "").toLowerCase() === typeVal);
}

function sortTrains(trains, fromCode = null) {
    const mode = sortSelect.value;
    if (mode !== "departure") return trains;

    // Sort by departure *at the user's origin* if present; else by first dep
    return [...trains].sort((a, b) => {
        const getDep = (train) => {
            if (fromCode) {
                const idx = train.route.findIndex(r => r.code === fromCode);
                if (idx >= 0) return timeToMin(train.route[idx].dep);
            }
            return timeToMin(train.route[0]?.dep);
        };
        return getDep(a) - getDep(b);
    });
}

// =============== SEARCH (Route) ===============
searchBtn.addEventListener("click", () => {
    const fromMixed = cleanInputToCodeOrName(fromInput.value);
    const toMixed = cleanInputToCodeOrName(toInput.value);

    const fromCode = findStationCode(typeof fromMixed === "string" ? fromMixed.toUpperCase() : fromMixed);
    const toCode = findStationCode(typeof toMixed === "string" ? toMixed.toUpperCase() : toMixed);

    if (!fromCode || !toCode) {
        alert("Please pick valid stations from the suggestion lists.");
        return;
    }
    if (fromCode === toCode) {
        alert("Origin and destination cannot be the same.");
        return;
    }

    // Find trains that contain both codes in order
    let result = window.trains.filter(t => {
        const codes = t.route.map(r => r.code);
        const i1 = codes.indexOf(fromCode);
        const i2 = codes.indexOf(toCode);
        return i1 >= 0 && i2 >= 0 && i1 < i2;
    });

    result = filterByType(result);
    result = sortTrains(result, fromCode);

    lastRouteQuery = { fromCode, toCode };
    renderTrains(result, { fromCode, toCode });
});

// =============== SEARCH (Train Name/Number) ===============
trainSearchInput.addEventListener("input", () => {
    const q = trainSearchInput.value.trim().toLowerCase();
    if (!q) {
        trainList.innerHTML = "";
        resultMeta.textContent = "";
        lastRouteQuery = null;
        return;
    }
    let result = window.trains.filter(
        t => t.number.includes(q) || (t.name || "").toLowerCase().includes(q)
    );
    result = filterByType(result);
    result = sortTrains(result, lastRouteQuery?.fromCode || null);
    // When searching by train, we show full route (no slicing)
    renderTrains(result);
});
