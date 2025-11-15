
// ==========================
// Footer year auto-update
// ==========================
const startYear = 2025;
const currentYear = new Date().getFullYear();
const yearText = currentYear === startYear ? `${startYear}` : `${startYear}-${currentYear}`;
document.getElementById('footer-year').textContent = yearText;

// ==========================
// Channel Categories
// ==========================
const categories = [
    { name: "Entertainment & Documentaries", min: 1, max: 199 },
];

// ==========================
// Utilities
// ==========================
function getFirstNumber(c) {
    if (typeof c.number === "number") return c.number;
    if (typeof c.number === "string") {
        const match = c.number.match(/\d+/);
        return match ? parseInt(match[0], 10) : NaN;
    }
    return NaN;
}

function formatChannelNumber(number, isRadio = false) {
    // If number is an integer, handle normally
    if (Number.isInteger(number)) {
        if (isRadio && number >= 3101 && number <= 3250) {
            return "0" + number.toString().slice(1);
        }
        return number;
    }

    // If number is a string that is purely digits, convert to number
    if (typeof number === "string" && /^\d+$/.test(number)) {
        let num = parseInt(number, 10);
        if (isRadio && num >= 3101 && num <= 3250) {
            return "0" + num.toString().slice(1);
        }
        return num;
    }

    // Otherwise, treat as HTML and return as-is
    return number;
}

// ==========================
// Render channels grouped by category
// ==========================
async function renderChannels(jsonFile, containerId, region) {
    try {
        const res = await fetch(jsonFile);
        const channels = await res.json();
        const container = document.getElementById(containerId);
        container.innerHTML = "";

        // Collect all radio channels first to prevent duplication
        const radioChannels = channels.filter(c =>
            /Radio/i.test(c.name) || (getFirstNumber(c) >= 3101 && getFirstNumber(c) <= 3250)
        );
        const radioSids = radioChannels.map(c => c.sid);


        for (const cat of categories) {
            let catChannels = [];

            if (cat.custom) {
                catChannels = channels.filter(c => {
                    const n = getFirstNumber(c);
                    return cat.custom(c, n);
                });
            } else {
                catChannels = channels.filter(c => {
                    const n = getFirstNumber(c);

                    // Exclude channels already categorised as Radio
                    if (radioSids.includes(c.sid)) return false;

                    // Normal range check
                    return n >= cat.min && n <= cat.max;
                });
            }

            if (!catChannels.length) continue;

            const section = document.createElement("section");
            section.classList.add("channel-category");
            section.innerHTML = `<h3>${cat.name}</h3><ul></ul>`;
            const ul = section.querySelector("ul");

            for (const ch of catChannels) {
                const li = document.createElement("li");
                li.innerHTML = `
              <a href="listings.html?sid=${ch.sid}" class="channel-link">
                <span class="channel-number">${formatChannelNumber(ch.number, cat.isRadio)}</span>
                ${ch.logo ? `<img src="${ch.logo}" alt="${ch.name} logo" class="channel-logo">` : ""}
                <span class="channel-name">
                  ${ch.name}
                  <div class="mini-epg" id="epg-${ch.sid}-${region}" style="font-size: 13px; color: #555; margin-top: 4px;">
                    <em>Click for listings\u2026</em>
                  </div>
                </span>
              </a>
            `;
                ul.appendChild(li);
            }

            container.appendChild(section);
        }

        return channels;
    } catch (err) {
        console.error(`Error rendering channels from ${jsonFile}:`, err);
        return [];
    }
}

// ==========================
// Load Now & Next sequentially
// ==========================
async function loadEPGSequential(channels, region) {
    for (const ch of channels) {
        if (!ch.sid) continue;
        await loadMiniEPG(ch.sid, region);
    }
}

// ==========================
// Mini EPG Fetcher
// ==========================
async function loadMiniEPG(sid, region) {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const url = `https://awk.epgsky.com/hawk/linear/schedule/${dateStr}/${sid}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const events = data?.schedule?.[0]?.events || [];
        const container = document.getElementById(`epg-${sid}-${region}`);
        if (!container) return;

        if (!events.length) {
            container.innerHTML = `<em>No listings</em>`;
            return;
        }

        const now = Math.floor(Date.now() / 1000);
        const current = events.find(e => e.st <= now && now < e.st + e.d) || events[0];
        const next = events.find(e => e.st > now);

        const formatTime = ts => {
            const d = new Date(ts * 1000);
            return d.toISOString().substr(11, 5);
        };

        // const truncate40 = str => str && str.length > 40 ? str.slice(0, 40) + "\u2026" : str;

        // container.innerHTML = `
        //   <div class="epg-now">Now - ${formatTime(current.st)}: ${truncate40(current.t || "Click for listings...")}</div>
        //   ${next ? `<div class="epg-next">Next - ${formatTime(next.st)}: ${truncate40(next.t)}</div>` : ""}
        // `;

        container.innerHTML = `
          <div class="epg-now">Now - ${formatTime(current.st)}: ${(current.t || "Click for listings\u2026")}</div>
          ${next ? `<div class="epg-next">Next - ${formatTime(next.st)}: ${(next.t)}</div>` : ""}
        `;
    } catch (err) {
        const container = document.getElementById(`epg-${sid}-${region}`);
        if (container) container.innerHTML = `<em>Unavailable</em>`;
    }
}

// ==========================
// Load both UK and Ireland
// ==========================
async function loadBothRegions() {
    const [ukChannels, ieChannels] = await Promise.all([
        renderChannels("channels-uk.json", "channels-uk-list", "uk"),
        renderChannels("channels-ireland.json", "channels-ireland-list", "ie")
    ]);

    await Promise.all([
        loadEPGSequential(ukChannels, "uk"),
        loadEPGSequential(ieChannels, "ie")
    ]);
}

loadBothRegions();

// ==========================
// Search
// ==========================
function normalizeText(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const searchInput = document.getElementById("search-input");
const clearBtn = document.getElementById("clear-search");

searchInput.addEventListener("input", () => {
    const filter = normalizeText(searchInput.value.trim());
    clearBtn.style.display = filter ? "block" : "none";

    ["channels-uk-list", "channels-ireland-list"].forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const sections = container.querySelectorAll(".channel-category");
        let anyVisible = false;

        sections.forEach(section => {
            const items = section.querySelectorAll("li");
            let visibleCount = 0;

            items.forEach(li => {
                const text = normalizeText(li.textContent);
                const visible = !filter || text.includes(filter);
                li.style.display = visible ? "" : "none";
                if (visible) visibleCount++;
            });

            section.style.display = visibleCount ? "" : "none";
            if (visibleCount) anyVisible = true;
        });

        container.style.display = anyVisible ? "" : "none";
    });
});

clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.style.display = "none";
    searchInput.dispatchEvent(new Event("input"));
});

const scrollTopBtn = document.getElementById("scroll-top");

scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});