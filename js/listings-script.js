const startYear = 2025;
const currentYear = new Date().getFullYear();
const yearText = currentYear === startYear ? `${startYear}` : `${startYear}-${currentYear}`;
document.getElementById('footer-year').textContent = yearText;

function lastSunday(year, month) {
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    const dayOfWeek = lastDay.getUTCDay();
    const lastSundayDate = new Date(Date.UTC(year, month + 1, 0 - dayOfWeek, 1, 0, 0));
    return lastSundayDate.getTime();
}

const dstEnd = lastSunday(2025, 9);
const dstStart = lastSunday(2026, 2);

function formatTimeWithDST(unixTs) {
    const tsDate = new Date(unixTs * 1000);
    let offset = 0;
    if (unixTs * 1000 < dstEnd || unixTs * 1000 >= dstStart) offset = 1;
    tsDate.setUTCHours(tsDate.getUTCHours() + offset);
    return tsDate.toISOString().substr(11, 5);
}



const params = new URLSearchParams(window.location.search);
const sid = params.get('sid');
if (!sid) {
    document.getElementById('loading').textContent = 'No channel selected.';
    throw new Error('Missing sid parameter.');
}

const TV_DAYS_TO_SHOW = 7;
let allSchedules = [];
let currentDayIndex = 0;

function addDays(date, days) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
}

function formatDate(date) {
    return date.toISOString().split('T')[0].replace(/-/g, '');
}

async function fetchSchedule(dateStr) {
    const url = `https://awk.epgsky.com/hawk/linear/schedule/${dateStr}/${sid}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data?.schedule?.[0]?.events) || [];
}

function dedupeEvents(events) {
    const map = new Map();
    for (const e of events) {
        const key = e.eid ? e.eid : `${e.st}-${e.t}`;
        if (!map.has(key)) map.set(key, e);
    }
    return Array.from(map.values());
}

async function loadChannelHeader() {
    try {
        const [resIre, resUK] = await Promise.all([
            fetch('channels-ireland.json'),
            fetch('channels-uk.json')
        ]);
        const [channelsIre, channelsUK] = await Promise.all([resIre.json(), resUK.json()]);
        const all = [...channelsIre, ...channelsUK];
        const channel = all.find(c => c.sid.toString() === sid);
        const header = document.getElementById('channel-name');

        if (!channel) {
            header.textContent = 'Channel Listings';
            document.title = 'Sky TV Guide - Listings';
            return;
        }

        document.title = `Sky TV Guide - ${channel.name} listings`;

        const logoEl = document.getElementById('channel-logo');
        const nameEl = document.getElementById('channel-name');

        if (channel.logo) {
            logoEl.innerHTML = '';
            const container = document.createElement('div');
            container.className = 'logo-container';
            const img = document.createElement('img');
            img.className = 'logo';
            img.src = channel.logo;
            img.alt = channel.name;

            img.style.maxWidth = '300px'; // won't exceed 300px
            img.style.height = 'auto';    // keeps aspect ratio
            img.style.display = 'block';
            img.style.margin = '0 auto';  // centre it

            container.appendChild(img);
            logoEl.appendChild(container);
            nameEl.textContent = channel.name;
        }

        return channel.logo || null;

    } catch (err) {
        console.error('Header load error', err);
        document.getElementById('channel-name').textContent = 'Channel Listings';
        document.title = 'Sky TV Guide - Listings';
        return null;
    }
}

let customImages = {};
let patternMappings = [];

/**
 * Load JSON mappings once and reuse them.
 */
async function loadMappings() {
    if (patternMappings.length && Object.keys(customImages).length) return; // already loaded

    const [imagesRes, patternsRes] = await Promise.all([
        fetch('/json/custom-images.json'),
        fetch('/json/pattern-mapping.json')
    ]);

    customImages = await imagesRes.json();
    const rawPatterns = await patternsRes.json();

    // Rebuild regex patterns from plain text
    patternMappings = rawPatterns.map(entry => ({
        regex: new RegExp(entry.pattern, entry.flags || ''),
        url: entry.url
    }));
}

/**
 * Cleans programme titles for better matching.
 */
function cleanProgrammeTitle(title) {
    return title
        .replace(/^New:\s*/i, '')
        .replace(/^Classic\s*/i, '')
        .replace(/^\*\*Visually Signed\*\*\s*/i, '')
        .replace(/\b(followed by|including)\b.*/i, '')
        .replace(/ Omnibus\s*/i, '')
        .replace(/ \(BSL\)\s*/i, '')
        .replace(/:?\s*Part \d+/i, '')
        .trim();
}

/**
 * Cache for TVMaze results.
 */
const tvMazeCache = new Map();

/**
 * Query TVMaze API and cache results.
 */
async function fetchFromTvMaze(title) {
    if (tvMazeCache.has(title)) return tvMazeCache.get(title);

    const encoded = encodeURIComponent(title);
    const res = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encoded}`);
    if (!res.ok) return null;

    const data = await res.json();
    const image = data?.image?.medium || data?.image?.original || null;
    tvMazeCache.set(title, image);
    return image;
}

/**
 * Main image fetcher.
 */
async function fetchProgrammeImage(title, channelLogo) {
    try {
        await loadMappings();

        let cleanTitle = cleanProgrammeTitle(title);

        if (/^ITV News/i.test(cleanTitle)) cleanTitle = 'ITV News';

        for (const { regex, url } of patternMappings) {
            if (regex.test(cleanTitle)) return url;
        }

        if (customImages.hasOwnProperty(cleanTitle)) {
            return customImages[cleanTitle] || channelLogo;
        }

        if (/^(the|a|an)$/i.test(cleanTitle) || cleanTitle.length < 3) {
            return channelLogo;
        }

        return (await fetchFromTvMaze(cleanTitle)) || channelLogo;
    } catch (err) {
        console.warn('TVMaze image fetch failed for', title, err);
        return channelLogo;
    }
}

async function loadSchedules() {
    const now = Math.floor(Date.now() / 1000);
    const baseDate = new Date();
    const todayStr = formatDate(baseDate);

    const channelLogo = await loadChannelHeader();

    const dateList = [];
    for (let i = 0; i <= TV_DAYS_TO_SHOW; i++) {
        dateList.push(addDays(baseDate, i));
    }

    document.getElementById('loading').textContent = 'Loading listings...';

    const allDates = [addDays(baseDate, -1), ...dateList];
    const dateStrs = allDates.map(d => formatDate(d));

    let results = [];
    try {
        results = await Promise.all(dateStrs.map(ds => fetchSchedule(ds)));
    } catch (err) {
        console.error('Fetch error', err);
        document.getElementById('loading').textContent = 'Error loading schedule.';
        return;
    }

    const allEvents = results.flat();
    const deduped = dedupeEvents(allEvents).sort((a, b) => a.st - b.st);

    allSchedules = [];

    for (const day of dateList) {
        const dayCopy = new Date(day);
        const startOfDay = Math.floor(new Date(dayCopy.setHours(0, 0, 0, 0)).getTime() / 1000);
        const endOfDay = startOfDay + 86400;

        let dayEvents = deduped.filter(e => e.st >= startOfDay && e.st < endOfDay);
        const yesterdayLast = deduped.filter(e => e.st < startOfDay).pop();
        if (yesterdayLast) dayEvents.unshift(yesterdayLast);

        const formattedDate = new Intl.DateTimeFormat('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        }).format(day);

        const dayDiv = document.createElement('div');
        dayDiv.innerHTML = `<h2>${formattedDate}</h2>`;
        const ul = document.createElement('ul');

        if (dayEvents.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No listings available.';
            ul.appendChild(li);
        } else {
            const isToday = formatDate(day) === todayStr;
            for (const event of dayEvents) {
                const li = document.createElement('li');

                const imgEl = document.createElement('img');
                imgEl.className = 'programme-img';
                li.appendChild(imgEl);

                const textDiv = document.createElement('div');
                textDiv.className = 'programme-text';

                const titleDiv = document.createElement('div');
                titleDiv.className = 'title';
                titleDiv.textContent = `${formatTimeWithDST(event.st)} - ${event.t || ''}`;

                const synopsisDiv = document.createElement('div');
                synopsisDiv.className = 'synopsis';
                synopsisDiv.textContent = event.sy || '';

                textDiv.appendChild(titleDiv);
                textDiv.appendChild(synopsisDiv);
                li.appendChild(textDiv);

                const eventStart = event.st;
                const eventDur = event.d || 0;
                const eventEnd = eventStart + eventDur;

                li.dataset.start = eventStart;
                li.dataset.end = eventEnd;

                if (eventEnd < now) {
                    li.classList.add('past');
                    titleDiv.classList.add('past');
                    synopsisDiv.classList.add('past');
                }

                // Fetch image
                fetchProgrammeImage(event.t, channelLogo).then(url => {
                    if (url) imgEl.src = url;
                });

                ul.appendChild(li);
            }

            if (isToday) {
                function updateNowNext() {
                    const now = Math.floor(Date.now() / 1000);
                    const lis = ul.querySelectorAll('li');
                    let nextFlagSet = false;

                    lis.forEach(li => {
                        li.classList.remove('on-now', 'on-next');
                        const titleDiv = li.querySelector('.title');
                        titleDiv.textContent = titleDiv.textContent.replace(/^NOW: |^NEXT: /, '');

                        let start = parseInt(li.dataset.start);
                        let end = parseInt(li.dataset.end);

                        if (start < startOfDay && end > startOfDay) start = startOfDay;

                        if (start <= now && now < end) {
                            li.classList.add('on-now');
                            titleDiv.textContent = `NOW: ${titleDiv.textContent}`;
                        } else if (!nextFlagSet && start > now) {
                            li.classList.add('on-next');
                            titleDiv.textContent = `NEXT: ${titleDiv.textContent}`;
                            nextFlagSet = true;
                        }
                    });
                }

                updateNowNext();
                setInterval(updateNowNext, 30000);
            }
        }

        dayDiv.appendChild(ul);
        allSchedules.push({ date: day, element: dayDiv });
    }

    document.getElementById('loading').style.display = 'none';
}

function renderDay(index) {
    const scheduleContainer = document.getElementById('schedule');
    scheduleContainer.innerHTML = '';
    scheduleContainer.appendChild(allSchedules[index].element);

    const prevBtn = document.getElementById('prev-day');
    const nextBtn = document.getElementById('next-day');

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === allSchedules.length - 1;

    prevBtn.classList.toggle('active', !prevBtn.disabled);
    nextBtn.classList.toggle('active', !nextBtn.disabled);
}

async function init() {
    await loadSchedules();

    document.getElementById('prev-day').addEventListener('click', () => {
        if (currentDayIndex > 0) {
            currentDayIndex--;
            renderDay(currentDayIndex);
        }
    });

    document.getElementById('next-day').addEventListener('click', () => {
        if (currentDayIndex < allSchedules.length - 1) {
            currentDayIndex++;
            renderDay(currentDayIndex);
        }
    });

    renderDay(0);
}

init().catch(err => {
    console.error('Startup error', err);
    document.getElementById('loading').textContent = 'Error loading.';
});
