let entries = [];
let searchTerm = "";
let personFilter = null;

const searchEl = document.getElementById("search");
const listEl = document.getElementById("quotes");
const emptyEl = document.getElementById("empty");
const bannerEl = document.getElementById("person-banner");
const bannerNameEl = document.getElementById("person-banner-name");
const clearPersonEl = document.getElementById("clear-person");
const peopleEl = document.getElementById("people");
const clearSearchEl = document.getElementById("clear-search");

function readHash() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ""));
  return {
    person: params.get("person"),
    q: params.get("q") || "",
  };
}

function writeHash() {
  const params = new URLSearchParams();
  if (personFilter) params.set("person", personFilter);
  if (searchTerm) params.set("q", searchTerm);
  const str = params.toString();
  const newHash = str ? `#${str}` : "";
  if (newHash === location.hash || (newHash === "" && !location.hash)) return;
  if (newHash) {
    history.replaceState(null, "", location.pathname + location.search + newHash);
  } else {
    history.replaceState(null, "", location.pathname + location.search);
  }
}

function setPersonFilter(name) {
  personFilter = name;
  writeHash();
  render();
}

function entryMatches(entry, term) {
  const personMatch =
    !personFilter || entry.some((q) => q.person === personFilter);
  if (!personMatch) return false;
  if (!term) return true;
  return entry.some((q) =>
    `${q.text} ${q.note || ""}`.toLowerCase().includes(term),
  );
}

function render() {
  const term = searchTerm.trim().toLowerCase();
  const filtered = entries.filter((entry) => entryMatches(entry, term));

  if (personFilter) {
    bannerEl.classList.remove("hidden");
    bannerEl.classList.add("flex");
    bannerNameEl.textContent = personFilter;
    peopleEl.classList.add("hidden");
  } else {
    bannerEl.classList.add("hidden");
    bannerEl.classList.remove("flex");
    peopleEl.classList.remove("hidden");
  }

  listEl.innerHTML = "";
  for (const entry of filtered) {
    const li = document.createElement("li");
    li.className =
      "rounded-lg bg-white border border-cyan-200 px-5 py-4 shadow-sm space-y-3";

    for (const q of entry) {
      const block = document.createElement("div");

      const text = document.createElement("p");
      text.className = "text-lg leading-relaxed";
      text.textContent = `“${q.text}”`;

      const attribution = document.createElement("p");
      attribution.className = "mt-2 text-sm text-cyan-500";

      const dash = document.createTextNode("— ");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = q.person;
      btn.className =
        "font-medium text-cyan-700 hover:text-cyan-900 underline underline-offset-2";
      btn.addEventListener("click", () => setPersonFilter(q.person));

      attribution.appendChild(dash);
      attribution.appendChild(btn);

      if (q.note) {
        const note = document.createElement("span");
        note.className = "text-cyan-600";
        note.textContent = `, ${q.note}`;
        attribution.appendChild(note);
      }

      block.appendChild(text);
      block.appendChild(attribution);
      li.appendChild(block);
    }

    listEl.appendChild(li);
  }

  emptyEl.classList.toggle("hidden", filtered.length !== 0);
  clearSearchEl.classList.toggle("hidden", searchTerm.length === 0);
}

searchEl.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  writeHash();
  render();
});

clearPersonEl.addEventListener("click", () => setPersonFilter(null));

clearSearchEl.addEventListener("click", () => {
  searchTerm = "";
  searchEl.value = "";
  searchEl.focus();
  writeHash();
  render();
});

window.addEventListener("hashchange", () => {
  const { person, q } = readHash();
  personFilter = person;
  searchTerm = q;
  searchEl.value = q;
  render();
});

function renderPeople() {
  const names = [
    ...new Set(entries.flatMap((entry) => entry.map((q) => q.person))),
  ].sort((a, b) => a.localeCompare(b));
  peopleEl.innerHTML = "";
  for (const name of names) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = name;
    btn.className =
      "rounded-full bg-white border border-cyan-300 px-3 py-1 text-sm text-cyan-700 hover:bg-cyan-100 hover:text-cyan-900 shadow-sm";
    btn.addEventListener("click", () => setPersonFilter(name));
    peopleEl.appendChild(btn);
  }
}

async function init() {
  const res = await fetch("quotes.json");
  entries = await res.json();
  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [entries[i], entries[j]] = [entries[j], entries[i]];
  }
  const { person, q } = readHash();
  personFilter = person;
  searchTerm = q;
  searchEl.value = q;
  renderPeople();
  render();
}

init();
