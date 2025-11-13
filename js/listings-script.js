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

const customImages = {
    "Big Brother": "https://static.tvmaze.com/uploads/images/medium_portrait/589/1474564.jpg",
    "Wheel of Fortune": "https://static.tvmaze.com/uploads/images/medium_portrait/561/1403762.jpg",
    "Who Wants to Be a...": "https://static.tvmaze.com/uploads/images/medium_portrait/561/1403759.jpg",
    "Peppa Muc": "https://static.tvmaze.com/uploads/images/medium_portrait/569/1423757.jpg",
    "Tomás agus a Chairde": "https://static.tvmaze.com/uploads/images/medium_portrait/24/61753.jpg",
    "Dónall Dána": "https://static.tvmaze.com/uploads/images/medium_portrait/44/110411.jpg",
    "Puffin Rock (As Gaeilge)": "https://static.tvmaze.com/uploads/images/medium_portrait/49/124002.jpg",
    "Angry Birds - Scléip an tSamhraidh": "https://static.tvmaze.com/uploads/images/medium_portrait/393/982734.jpg",
    "DIY SOS: The Big Build": "https://static.tvmaze.com/uploads/images/medium_portrait/20/51614.jpg",
    "Countdown": "https://static.tvmaze.com/uploads/images/medium_portrait/23/58814.jpg",
    "Come & Play with Pip and Posy": "https://static.tvmaze.com/uploads/images/medium_portrait/484/1211179.jpg",
    "Nuacht RTÉ": "images/Nuacht_RTÉ.png",
    "South Park: Post COVID Special": "https://static.tvmaze.com/uploads/images/medium_portrait/594/1485766.jpg",
    "Born and Bred": "https://static.tvmaze.com/uploads/images/medium_portrait/82/205473.jpg",
    "Would I Lie To You At Christmas": "https://static.tvmaze.com/uploads/images/medium_portrait/16/40370.jpg",
    "BBC News and Weather": "https://static.tvmaze.com/uploads/images/medium_portrait/34/86217.jpg",
    "The Great British Bake-Off": "https://static.tvmaze.com/uploads/images/medium_portrait/585/1464906.jpg",
    "The Jonathan Ross Show: Special Guests": "https://static.tvmaze.com/uploads/images/medium_portrait/510/1277472.jpg",
    "Teleshopping": "images/Teleshopping.png",
    "Shop on TV": "images/Teleshopping.png",
    "Night Vision": "images/Night_Vision.png",
    "Deal or No Deal": "https://static.tvmaze.com/uploads/images/medium_portrait/29/73004.jpg",
    "Entertainment News on 5": "images/Entertainment_News_on_5.png",
    "7Lá": "images/7Lá.jpg",
    "Seacht Lá": "images/7Lá.jpg",
    "7 Lá": "images/7Lá.jpg",
    "EuroNews": "images/EU_flag_long.png",
    "Euronews": "images/EU_flag_long.png",
    "PlayOJO Live Casino Show": "images/Play-ojo.png",
    "UTV Live": "images/UTV_Live.png",
    "BBC Sport": "images/BBC_Sport_Studio.png",
    "Sky Sports News": "images/Sky_Sports_News_Studio.png",
    "Sky Sports Breakfast": "images/Sky_Sports_News_Studio.png",
    "SSN @ 10": "images/Sky_Sports_News_Studio.png",
    "The European Debrief": "https://tv.assets.pressassociation.io/cc783093-59e5-53da-bac5-02fc10ae90f0.jpg",
    "Wake Up Europe": "https://tv.assets.pressassociation.io/c6b2ff07-cecc-502f-9bc7-d9edac013ad8.jpg",
    "Euronews Now": "https://tv.assets.pressassociation.io/8bb49cae-0d79-5b15-9283-9dace28115d3.jpg",
    "Tom and Jerry": "https://static.tvmaze.com/uploads/images/medium_portrait/483/1209807.jpg",
    "Tom & Jerry: Best of Tom": "https://static.tvmaze.com/uploads/images/medium_portrait/483/1209807.jpg",
    "Tom & Jerry: Best of Jerry": "https://static.tvmaze.com/uploads/images/medium_portrait/483/1209807.jpg",
    "Tom & Jerry: Best of Quacker": "https://static.tvmaze.com/uploads/images/medium_portrait/483/1209807.jpg",
    "France 24": "images/France24.png",
    "Cúla4": "images/Cúla4.png",
    "RTÉ News with Signing": "https://static.tvmaze.com/uploads/images/medium_portrait/552/1380965.jpg",
    "TheTonight Show": "https://static.tvmaze.com/uploads/images/medium_portrait/532/1331211.jpg",
    "60s & 70s Music Live!": "images/Music_Live.png",
    "60s Rock Around the Clock": "images/Music_Live.png",
    "Rock Royalty": "images/Music_Live.png",
    "Rock Solid!": "images/Music_Live.png",
    "Monsters Of Rock!": "images/Music_Live.png",
    "Good News from GREAT! Extra": "images/Good_News.png",
    "Dáil Éireann": "images/Dáil_Éireann.png",
    "Newyddion S4C": "images/Newyddion_S4C.png",
    "Happy Hour!": null,
    "Newscast": null,
    "News": null,
    "Off Air": null,
    "Unwind": null,
    "Dee Dee": null,
    "Am Abú": null,
    "The Wee Littles": null,
    "Miraculous": null,
    "Shortcut": null,
    "The Match": null,
    "All the Goals": null,
    "In The Frame": null,
    "On This Day": null,
    "Dáil Na nÓg": null,
    "New & Now!": null,
    "The BFG": null,
    "Anfa": null,
    "Sky Intro": null,
    "Sky Intro HD": null,
    "Valentino": null,
    "Dreamy Nights": null,
    "Moon and Stars": null,
    "Sweet Dreams": null,
    "hei hanes!": null,
};

async function fetchProgrammeImage(title, channelLogo) {
    try {
        // Clean the title first
        let cleanTitle = title
            .replace(/^New:\s*/i, '')
            .replace(/^Classic\s*/i, '')
            .replace(/^\*\*Visually Signed\*\*\s*/i, '')   // remove "**Visually Signed**"
            .trim();

        // Only split at 'followed by' or 'including' if it exists
        if (/\b(followed by|including)\b/i.test(cleanTitle)) {
            cleanTitle = cleanTitle.split(/\b(?:followed by|including)\b/i)[0].trim();
        }

        // Remove trailing "Omnibus" and similar suffixes
        cleanTitle = cleanTitle.split(/ Omnibus\s*/i)[0].trim();
        cleanTitle = cleanTitle.split(/ \(BSL\)\s*/i)[0].trim();

        // Remove "Part X" if present
        cleanTitle = cleanTitle.replace(/:?\s*Part \d+/i, '').trim();

        // ITV News grouping
        if (/^ITV News/i.test(cleanTitle)) {
            cleanTitle = "ITV News";
        }

        // BBC News variants
        if (/^BBC .*News$/i.test(cleanTitle)) {
            return "https://static.tvmaze.com/uploads/images/medium_portrait/34/86217.jpg";
        }

        // STV News variants (e.g. "STV News", "STV News at One", "STV News at Six")
        if (/^STV News/i.test(cleanTitle)) {
            return "https://static.tvmaze.com/uploads/images/medium_portrait/111/279632.jpg";
        }

        if (/^Shop:.+/i.test(cleanTitle)) {
            return "images/Teleshopping.png";
        }

        if (/^SuperKitties.+/i.test(cleanTitle)) {
            return "https://static.tvmaze.com/uploads/images/medium_portrait/435/1089109.jpg";
        }

        if (/^That's 80s.+/i.test(cleanTitle)) {
            return "images/That's_80s_block.png";
        }

        if (/^That's 60s.+/i.test(cleanTitle)) {
            return "images/That's_60s_block.png";
        }

        if (/^That's Rock.+/i.test(cleanTitle)) {
            return "images/Music_Live.png";
        }

        if (/^That's Oldies:.+/i.test(cleanTitle)) {
            return "images/Classic_Music_Hits.png";
        }

        if ((/^London News at.+/i.test(cleanTitle)) || (/^London News Replay$/i.test(cleanTitle))) {
            return "images/London_News.png";
        }

        if (/^Dáil Éireann.+/i.test(cleanTitle)) {
            return "images/Dáil_Éireann.png";
        }

        // Check custom images first (exact matches only)
        if (customImages.hasOwnProperty(cleanTitle)) {
            return customImages[cleanTitle] || channelLogo;
        }

        // Skip TVMaze search for too-generic titles
        if (/^(the|a|an)$/i.test(cleanTitle) || cleanTitle.length < 3) {
            return channelLogo;
        }

        // Fallback to TVMaze
        const encoded = encodeURIComponent(cleanTitle);
        const apiUrl = `https://api.tvmaze.com/singlesearch/shows?q=${encoded}`;
        const res = await fetch(apiUrl);
        if (!res.ok) return channelLogo;
        const data = await res.json();
        return data?.image?.medium || data?.image?.original || channelLogo;

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
