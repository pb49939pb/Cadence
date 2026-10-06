"use strict";

/* =========================================================
   Cadence — colorful to-do list with day / week / month / year
   cadences. Everything lives in localStorage on this device.
   ========================================================= */

const STORE_KEY = "cadence.v1";
const SCOPES = ["day", "week", "month", "year"];
const META = {
  day:   { tab: "Today", title: "Today",      once: "Today",      every: "Every day",   cadence: "Daily",   unit: "day",   colors: ["#FF2D87", "#FF8A00"], hist: 7,  icon: "sun",      clear: "Day crushed!" },
  week:  { tab: "Week",  title: "This week",  once: "This week",  every: "Every week",  cadence: "Weekly",  unit: "week",  colors: ["#00E5FF", "#2E6BFF"], hist: 8,  icon: "calendar", clear: "Week conquered!" },
  month: { tab: "Month", title: "This month", once: "This month", every: "Every month", cadence: "Monthly", unit: "month", colors: ["#A25CFF", "#FF4FD8"], hist: 12, icon: "moon",     clear: "Month mastered!" },
  year:  { tab: "Year",  title: "This year",  once: "This year",  every: "Every year",  cadence: "Yearly",  unit: "year",  colors: ["#B6FF3B", "#FFD60A"], hist: 5,  icon: "sparkles", clear: "Year won!" },
};
const HUES = ["#FF2D87", "#FF8A00", "#FFD60A", "#B6FF3B", "#00F5A0", "#00E5FF", "#4D7CFF", "#B45CFF"];
const CHEERS = ["Nice!", "Boom!", "Crushed it", "Yes!", "Done!", "Let's go", "Smooth", "Nailed it", "Easy", "+1"];
const WEEK_START = 0; // Sunday, like the iPhone calendar in the US

/* ---------- Icons (inline SVG, stroke = currentColor) ---------- */
const ICON = {
  sun: '<circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none"/><path d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><rect x="7" y="13" width="4" height="3.5" rx="1" fill="currentColor" stroke="none"/>',
  moon: '<path d="M19.5 14.8A8 8 0 0 1 9.2 4.5a8 8 0 1 0 10.3 10.3z" fill="currentColor" stroke="none"/><path d="M17 3.5v3M15.5 5h3" />',
  sparkles: '<path d="M10 3l1.8 5.2L17 10l-5.2 1.8L10 17l-1.8-5.2L3 10l5.2-1.8z" fill="currentColor" stroke="none"/><path d="M18 14.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" fill="currentColor" stroke="none"/>',
  plus: '<path d="M12 5v14M5 12h14" stroke-width="3.2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5" stroke-width="3.6"/>',
  flame: '<path d="M12 22c4 0 7-2.8 7-6.8 0-3.6-2.5-6-4.3-8.7-.5 2.3-1.7 3.7-3 4.3.3-3.4-1.4-6.4-4-8.8.2 3.5-2.7 6.2-2.7 10.4C5 19.2 8 22 12 22z" fill="currentColor" stroke="none"/>',
  repeat: '<path d="M17 2.5l3 3-3 3"/><path d="M4 11.5v-1a5 5 0 0 1 5-5h11"/><path d="M7 21.5l-3-3 3-3"/><path d="M20 12.5v1a5 5 0 0 1-5 5H4"/>',
  carry: '<path d="M4 18v-3a6 6 0 0 1 6-6h10"/><path d="M16 5l4 4-4 4"/>',
  dashed: '<circle cx="12" cy="12" r="8" stroke-dasharray="3.2 3"/>',
  seal: '<path d="M12 2.5l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 21.5l-2.4-1.8-3 .2-.9-2.9-2.5-1.7 1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2z" fill="currentColor" stroke="none"/><path d="M8.5 12.2l2.3 2.3 4.7-4.7" stroke="#07060D" stroke-width="2.4"/>',
  hourglass: '<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>',
  gear: '<circle cx="12" cy="12" r="3.3"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.5 7.5 0 0 0 7 6.5l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.5 7.5 0 0 0 2.6-1.5l2.4 1 2-3.4z"/>',
  close: '<path d="M6 6l12 12M18 6L6 18" stroke-width="3"/>',
  pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
  trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="currentColor" stroke="none"/><path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v4M8 21h8M9.5 18h5"/>',
  pulse: '<path d="M2.5 12h4l2-5 4 11 3-8 1.5 2h4.5"/>',
  pie: '<path d="M12 3a9 9 0 1 0 9 9h-9z" fill="currentColor" stroke="none" opacity=".55"/><path d="M14 2.5a8 8 0 0 1 7.5 7.5H14z" fill="currentColor" stroke="none"/>',
  bars: '<path d="M5 20V12M10 20V6M15 20v-9M20 20V4" stroke-width="3"/>',
  rings: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/>',
  speed: '<path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l4-6" stroke-width="2.6"/>',
  line: '<path d="M3 17l5-5 4 3 8-9"/><path d="M3 21h18"/>',
  hare: '<path d="M4 17c0-4 3-7 7-7h2l3-5c1 0 1.5 1 1 2l-1.5 3.5c2.5.8 4.5 3 4.5 5.5v1H4z" fill="currentColor" stroke="none"/>',
  tortoise: '<path d="M3 16c0-4.4 3.6-8 8-8s8 3.6 8 8z" fill="currentColor" stroke="none"/><path d="M19 13h2.5M6 16v3M15 16v3"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
  upload: '<path d="M12 21V9M7 14l5-5 5 5M4 4h16"/>',
  sound: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none"/><path d="M16 9a4.5 4.5 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
  buzz: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M3 9v6M21 9v6"/>',
  alert: '<path d="M12 3.2L22 20.5H2z" fill="currentColor" stroke="none"/><path d="M12 9.5v5M12 17.3v.2" stroke="#07060D" stroke-width="2.6"/>',
  chev: '<path d="M9 5l7 7-7 7" stroke-width="2.6"/>',
  zzz: '<path d="M4 5h6l-6 7h6M13 12h7l-7 8h7" stroke-width="2.4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.5l3.5 2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5" stroke-width="2.6"/>',
};
const icon = (name, extra = "") =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${ICON[name]}</svg>`;

/* ---------- Dates & periods ---------- */
const pad = (n) => String(n).padStart(2, "0");
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };

function startOf(scope, date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (scope === "week") d.setDate(d.getDate() - ((d.getDay() - WEEK_START + 7) % 7));
  if (scope === "month") d.setDate(1);
  if (scope === "year") d.setMonth(0, 1);
  return d;
}
function addPeriods(scope, date, n) {
  const d = new Date(date);
  if (scope === "day") d.setDate(d.getDate() + n);
  else if (scope === "week") d.setDate(d.getDate() + 7 * n);
  else if (scope === "month") d.setMonth(d.getMonth() + n);
  else d.setFullYear(d.getFullYear() + n);
  return d;
}
const periodKey = (scope, date = now()) => keyOf(startOf(scope, date));
const periodKeyOffset = (scope, offset, date = now()) => keyOf(addPeriods(scope, startOf(scope, date), offset));

function periodTitle(scope, key) {
  const d = parseKey(key);
  const md = (x) => x.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (scope === "day") return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  if (scope === "week") { const e = new Date(d); e.setDate(e.getDate() + 6); return `${md(d)} – ${md(e)}`; }
  if (scope === "month") return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return String(d.getFullYear());
}
function shortLabel(scope, key) {
  const d = parseKey(key);
  if (scope === "day") return d.toLocaleDateString(undefined, { weekday: "narrow" });
  if (scope === "week") return `${d.getMonth() + 1}/${d.getDate()}`;
  if (scope === "month") return d.toLocaleDateString(undefined, { month: "narrow" });
  return "'" + String(d.getFullYear()).slice(2);
}
const hourLabel = (h) => (h % 12 === 0 ? 12 : h % 12) + (h < 12 ? "a" : "p");

let clockOverride = null; // for testing only
const now = () => (clockOverride ? new Date(clockOverride) : new Date());

/* ---------- State ---------- */
let state = load();

function blankState() {
  return { tasks: [], settings: { sound: true, haptics: true } };
}
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return blankState();
    const s = JSON.parse(raw);
    return { ...blankState(), ...s, settings: { ...blankState().settings, ...(s.settings || {}) } };
  } catch {
    return blankState();
  }
}
function saveLocal() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    toast("Couldn't save. Your phone may be out of storage.");
  }
}
function save() {
  saveLocal();
  pushToCloud();
}

/* ---------- Cloud sync (Firebase) ----------
   The local copy keeps the app instant and usable offline; Firestore is the source of truth once signed in.
   save() diffs tasks against what the cloud last had and writes only what changed. */
const OWNER_KEY = "cadence.owner";        // which account the local copy belongs to
let cloud = null, user = null, unsubTasks = null, unsubSettings = null;
let cloudTasks = new Map();               // id -> JSON of the cloud's version
let cloudSettings = "";

const clean = (o) => JSON.parse(JSON.stringify(o)); // Firestore rejects undefined fields

function pushToCloud() {
  if (!cloud || !user) return;
  const sets = [], seen = new Set();
  for (const t of state.tasks) {
    seen.add(t.id);
    const j = JSON.stringify(t);
    if (cloudTasks.get(t.id) !== j) { sets.push(clean(t)); cloudTasks.set(t.id, j); }
  }
  const deletes = [...cloudTasks.keys()].filter((id) => !seen.has(id));
  deletes.forEach((id) => cloudTasks.delete(id));
  const sj = JSON.stringify(state.settings);
  const settings = sj !== cloudSettings ? (cloudSettings = sj, clean(state.settings)) : null;
  if (!sets.length && !deletes.length && !settings) return;
  setSync("saving");
  cloud.commit(user.uid, sets, deletes, settings)
    .then(() => setSync("ok"))
    .catch((e) => { setSync("error"); console.warn("Sync failed", e); toast("Couldn't sync that change. It will retry when you're online."); });
}

function setSync(s) { document.documentElement.dataset.sync = s; }

/** First sign-in on a device: upload tasks that were only saved here (the pre-sync app). */
async function migrateLocal(uid) {
  let owner = null;
  try { owner = localStorage.getItem(OWNER_KEY); } catch {}
  if (owner) return; // local copy already belongs to an account
  const local = load().tasks;
  if (local.length) {
    const existing = await cloud.fetchTasks(uid);
    const ids = new Set(existing.map((t) => t.id));
    const same = new Set(existing.map((t) => `${t.scope}|${t.title}`));
    const fresh = local.filter((t) => !ids.has(t.id) && !(t.completions.length === 0 && same.has(`${t.scope}|${t.title}`)));
    if (fresh.length) {
      await cloud.commit(uid, fresh.map(clean), [], existing.length ? null : clean(load().settings));
      toast(`Moved ${fresh.length} task${fresh.length === 1 ? "" : "s"} from this device to your account`);
    }
  }
  try { localStorage.setItem(OWNER_KEY, uid); } catch {}
}

function startCloud() {
  cloud = window.CadenceCloud;
  cloud.onUser(async (u) => {
    if (unsubTasks) { unsubTasks(); unsubTasks = null; }
    if (unsubSettings) { unsubSettings(); unsubSettings = null; }
    user = u;
    if (!u) { cloudTasks = new Map(); cloudSettings = ""; setSync("off"); openAuth(); return; }
    if (authOpen) closeSheet();
    setSync("saving");
    try { await migrateLocal(u.uid); } catch (e) { console.warn("Migration failed", e); toast("Couldn't move this device's tasks yet. Reopen the app to try again."); }
    unsubSettings = cloud.watchSettings(u.uid, (s) => {
      if (!s) return;
      cloudSettings = JSON.stringify(s);
      state.settings = { ...blankState().settings, ...s };
      saveLocal();
    });
    unsubTasks = cloud.watchTasks(u.uid, (tasks, meta) => {
      cloudTasks = new Map(tasks.map((t) => [t.id, JSON.stringify(t)]));
      state.tasks = tasks.sort((a, b) => a.createdAt - b.createdAt);
      saveLocal();
      if (!meta.hasPendingWrites) setSync(meta.fromCache ? "offline" : "ok");
      renderAll();
    }, (e) => { setSync("error"); console.warn("Listen failed", e); });
  });
}

/* ---------- Sign-in ---------- */
let authOpen = false;
const AUTH_ERRORS = {
  "auth/invalid-credential": "That email and password don't match.",
  "auth/wrong-password": "That email and password don't match.",
  "auth/user-not-found": "No account with that email. Tap Create account.",
  "auth/email-already-in-use": "That email already has an account. Tap Sign in.",
  "auth/weak-password": "Use at least 6 characters for the password.",
  "auth/invalid-email": "That doesn't look like an email address.",
  "auth/popup-closed-by-user": "Sign-in was closed before it finished.",
  "auth/network-request-failed": "No connection. Check your internet and try again.",
  "auth/too-many-requests": "Too many tries. Wait a minute and try again.",
  "auth/operation-not-allowed": "This sign-in method isn't turned on in Firebase yet.",
  "auth/unauthorized-domain": "This web address isn't allowed to sign in yet (Firebase → Authentication → Settings → Authorized domains).",
};
const authMessage = (e) => AUTH_ERRORS[e && e.code] || (e && e.message) || "Something went wrong. Try again.";

function openAuth(message) {
  authOpen = true;
  openSheet(`
    <div class="sheet-head"><h2>Sign in</h2></div>
    <p class="note auth-lede">Sign in to keep your tasks in sync between your iPhone and Mac. Tasks already on this device come with you.</p>
    <button class="google-btn" data-google>${GOOGLE_LOGO}Continue with Google</button>
    <div class="or"><span>or use email</span></div>
    <form class="auth-form" novalidate>
      <input class="field auth-field" id="authEmail" type="email" autocomplete="email" inputmode="email" placeholder="Email" required>
      <input class="field auth-field" id="authPass" type="password" autocomplete="current-password" placeholder="Password" required minlength="6">
      <p class="auth-error" role="alert" ${message ? "" : "hidden"}>${message ? esc(message) : ""}</p>
      <button class="cta" type="submit" data-mode="in">Sign in</button>
      <div class="auth-links"><button type="button" data-signup>Create account</button><button type="button" data-reset>Forgot password?</button></div>
    </form>`, "day", (sheet) => {
    $("#backdrop").onclick = null; // signing in isn't optional
    const err = $(".auth-error", sheet), email = $("#authEmail", sheet), pass = $("#authPass", sheet);
    const show = (m, ok) => { err.hidden = !m; err.textContent = m || ""; err.classList.toggle("ok", !!ok); };
    const busy = (on) => sheet.querySelectorAll("button").forEach((b) => (b.disabled = on));
    const run = async (fn) => {
      show("");
      busy(true);
      try { await fn(); } catch (e) { show(authMessage(e)); } finally { busy(false); }
    };
    $("[data-google]", sheet).onclick = () => run(() => cloud.google());
    $(".auth-form", sheet).onsubmit = (e) => { e.preventDefault(); run(() => cloud.emailSignIn(email.value.trim(), pass.value)); };
    $("[data-signup]", sheet).onclick = () => {
      if (!email.value.trim() || pass.value.length < 6) { show("Enter your email and a password of 6+ characters, then tap Create account."); return; }
      run(() => cloud.emailSignUp(email.value.trim(), pass.value));
    };
    $("[data-reset]", sheet).onclick = () => {
      if (!email.value.trim()) { show("Enter your email first."); return; }
      run(async () => { await cloud.resetPassword(email.value.trim()); show("Check your email for a reset link.", true); });
    };
    return () => { authOpen = false; };
  });
}
const GOOGLE_LOGO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>';
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function makeTask(title, scope, repeats, hue) {
  return { id: uid(), title, scope, repeats, start: periodKey(scope), createdAt: Date.now(), hue, completions: [] };
}


/* ---------- Stats ---------- */
const effective = (t) => (t.completions[0] ? t.completions[0].p : t.start);
const isDone = (t, p) => (t.repeats ? t.completions.some((c) => c.p === p) : t.completions.length > 0);
const isCarried = (t, p) => !t.repeats && t.completions.length === 0 && t.start < p;

function visible(scope, p) {
  return state.tasks.filter((t) => {
    if (t.scope !== scope) return false;
    if (t.repeats) return t.start <= p;
    if (t.completions.length === 0) return t.start <= p;
    return effective(t) === p;
  });
}
/* ---------- Scheduled tasks ("every Saturday", "the 4th of every month") ----------
   Stored with scope "dated" and sched = {type:"weekly", days:[6]} | {type:"monthly", day:4}
   | {type:"yearly", month:2, day:15}. Each due date is its own check-off (completion p = that day). */
const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const daysIn = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const ordinal = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th");

function dueOn(t, d) {
  const sc = t.sched;
  if (sc.type === "weekly") return sc.days.includes(d.getDay());
  if (sc.type === "monthly") return d.getDate() === Math.min(sc.day, daysIn(d));
  return d.getMonth() === sc.month && d.getDate() === Math.min(sc.day, daysIn(d));
}
/** Most recent due date on or before `key` (and not before the task existed). */
function lastDue(t, key) {
  let d = parseKey(key);
  for (let i = 0; i < 370; i++, d = addDays(d, -1)) {
    const k = keyOf(d);
    if (k < t.start) return null;
    if (dueOn(t, d)) return k;
  }
  return null;
}
function dueBetween(t, from, to) { // [from, to)
  const out = [];
  for (let d = new Date(from); d < to; d = addDays(d, 1)) {
    const k = keyOf(d);
    if (k >= t.start && dueOn(t, d)) out.push(k);
  }
  return out;
}
function schedLabel(sc) {
  if (sc.type === "weekly") {
    if (sc.days.length === 7) return "Every day";
    const sorted = [...sc.days].sort((a, b) => a - b);
    if (sorted.join() === "1,2,3,4,5") return "Weekdays";
    if (sorted.join() === "0,6") return "Weekends";
    return "Every " + sorted.map((i) => (sc.days.length === 1 ? DOW[i] : DOW[i].slice(0, 3))).join(", ");
  }
  if (sc.type === "monthly") return `The ${ordinal(sc.day)} of every month`;
  return "Every " + new Date(2000, sc.month, sc.day).toLocaleDateString(undefined, { month: "long", day: "numeric" });
}
const dueLabel = (k) => parseKey(k).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

/** Rows for scheduled tasks on the Today or Week page. */
function datedItems(scope, p) {
  const today = keyOf(now());
  const out = [];
  for (const t of state.tasks) {
    if (!t.sched) continue;
    if (scope === "day") {
      const k = lastDue(t, today);
      if (k && (k === today || !isDone(t, k))) out.push({ t, p: k, key: `${t.id}@${k}` });
    } else if (showsOn(t, scope)) {
      const ws = parseKey(p);
      const inPeriod = dueBetween(t, ws, addPeriods(scope, ws, 1));
      const prev = lastDue(t, keyOf(addDays(ws, -1)));
      // An overdue one carries into this period until it's done or the next due date arrives.
      if (prev && !isDone(t, prev) && !inPeriod.some((k) => k <= today)) out.push({ t, p: prev, key: `${t.id}@${prev}` });
      for (const k of inPeriod) out.push({ t, p: k, key: `${t.id}@${k}` });
    }
  }
  return out;
}
/** Weekly schedules show on Today and Week; monthly also on Month; yearly on every page. */
const RANK = { day: 0, week: 1, month: 2, year: 3, weekly: 1, monthly: 2, yearly: 3 };
const showsOn = (t, scope) => RANK[scope] <= RANK[t.sched.type];

/* ---------- Snooze ----------
   One-off tasks: hideUntil (and start moves to the period containing that day).
   Repeating/scheduled tasks: snooze = {p, until} hides just that one period or due date. */
function snoozedUntil(item) {
  const { t, p } = item;
  if (!t.repeats) return t.hideUntil || null;
  return t.snooze && t.snooze.p === p ? t.snooze.until : null;
}
const isSnoozed = (item) => { const u = snoozedUntil(item); return !!u && u > keyOf(now()) && !isDone(item.t, item.p); };

function snoozeTask(t, p, until) {
  const before = { start: t.start, hideUntil: t.hideUntil, snooze: t.snooze };
  if (!t.repeats) {
    t.hideUntil = until;
    const np = periodKey(t.scope, parseKey(until));
    if (np > t.start) t.start = np;
  } else {
    t.snooze = { p, until };
  }
  return () => { // undo
    t.start = before.start;
    if (before.hideUntil) t.hideUntil = before.hideUntil; else delete t.hideUntil;
    if (before.snooze) t.snooze = before.snooze; else delete t.snooze;
  };
}
function unsnoozeTask(t) {
  if (!t.repeats && t.hideUntil) {
    delete t.hideUntil;
    const cur = periodKey(t.scope);
    if (t.start > cur) t.start = cur;
  }
  delete t.snooze;
}

/** The day a row was due, if it's past due and not done. */
function overdueSince(item) {
  const { t, p } = item;
  if (isDone(t, p)) return null;
  const today = keyOf(now());
  if (t.sched) {
    const u = snoozedUntil(item);
    const due = u && u > p ? u : p;
    return due < today ? due : null;
  }
  if (t.repeats || t.completions.length || t.start >= periodKey(t.scope)) return null;
  return keyOf(addDays(addPeriods(t.scope, parseKey(t.start), 1), -1)); // last day of its period
}
function lateText(dueKey) {
  const days = Math.round((startOf("day", now()) - parseKey(dueKey)) / 864e5);
  if (days < 14) return `${days} day${days === 1 ? "" : "s"} late`;
  if (days < 60) return `${Math.floor(days / 7)} weeks late`;
  return `${Math.floor(days / 30)} months late`;
}

function allItems(scope, p = periodKey(scope)) {
  return visible(scope, p).map((t) => ({ t, p, key: t.id })).concat(datedItems(scope, p));
}
const items = (scope, p) => allItems(scope, p).filter((i) => !isSnoozed(i));
function snoozedItems(scope, p = periodKey(scope)) {
  const out = allItems(scope, p).filter(isSnoozed);
  // One-off tasks snoozed into a later period aren't in this period's list, but belong in its Snoozed section.
  const today = keyOf(now());
  for (const t of state.tasks) {
    if (t.scope === scope && !t.repeats && !t.completions.length && t.hideUntil > today && t.start > p) out.push({ t, p, key: t.id });
  }
  return out;
}
const taskIdOf = (key) => key.split("@")[0];
const colorScope = (t) => (t.sched ? "day" : t.scope);

function progress(scope, p = periodKey(scope)) {
  const v = items(scope, p);
  const done = v.filter((i) => isDone(i.t, i.p)).length;
  return { done, total: v.length, frac: v.length ? done / v.length : 0 };
}
function pastProgress(scope, p) {
  const end = addPeriods(scope, parseKey(p), 1).getTime();
  let done = 0, total = 0;
  for (const t of state.tasks) {
    if (t.scope !== scope) continue;
    if (t.repeats) {
      if (t.start > p || t.createdAt >= end) continue;
      total++;
      if (t.completions.some((c) => c.p === p)) done++;
    } else if (effective(t) === p) {
      total++;
      if (t.completions.length) done++;
    }
  }
  {
    const from = parseKey(p);
    for (const t of state.tasks) {
      if (!t.sched || t.createdAt >= end || (scope !== "day" && !showsOn(t, scope))) continue;
      for (const k of dueBetween(t, from, new Date(end))) {
        total++;
        if (isDone(t, k)) done++;
      }
    }
  }
  return { done, total, frac: total ? done / total : 0 };
}
function history(scope) {
  const cur = periodKey(scope);
  const out = [];
  for (let back = META[scope].hist - 1; back >= 0; back--) {
    const p = periodKeyOffset(scope, -back);
    out.push({ p, cur: p === cur, prog: p === cur ? progress(scope, p) : pastProgress(scope, p) });
  }
  return out;
}
function dayStreak() {
  let streak = progress("day").done === progress("day").total && progress("day").total > 0 ? 1 : 0;
  for (let back = 1; back <= 365; back++) {
    const pr = pastProgress("day", periodKeyOffset("day", -back));
    if (pr.total === 0) continue;
    if (pr.done >= pr.total) streak++; else break;
  }
  return streak;
}
function taskStreak(t) {
  if (t.sched) {
    const today = keyOf(now());
    let k = lastDue(t, today), streak = 0;
    if (k === today && !isDone(t, k)) k = lastDue(t, keyOf(addDays(parseKey(k), -1)));
    while (k && isDone(t, k) && streak < 400) {
      streak++;
      k = lastDue(t, keyOf(addDays(parseKey(k), -1)));
    }
    return streak;
  }
  if (!t.repeats) return 0;
  const done = new Set(t.completions.map((c) => c.p));
  let streak = done.has(periodKey(t.scope)) ? 1 : 0;
  for (let back = 1; back < 400; back++) {
    const p = periodKeyOffset(t.scope, -back);
    if (p < t.start || !done.has(p)) break;
    streak++;
  }
  return streak;
}
function todayByHour() {
  const today = keyOf(now());
  const counts = {};
  for (const t of state.tasks) for (const c of t.completions) {
    const d = new Date(c.at);
    if (keyOf(d) !== today) continue;
    const h = d.getHours();
    counts[h] = counts[h] || { day: 0, week: 0, month: 0, year: 0 };
    counts[h][colorScope(t)]++;
  }
  return counts;
}
/** Which cadence a task's check-offs count toward (scheduled tasks by their repeat type). */
const cadenceOf = (t) => (t.sched ? { weekly: "week", monthly: "month", yearly: "year" }[t.sched.type] : t.scope);

/** Every check-off ever, newest first. */
function completionEvents() {
  const out = [];
  for (const t of state.tasks) for (const c of t.completions) out.push({ t, at: c.at, cad: cadenceOf(t) });
  return out.sort((a, b) => b.at - a.at);
}
const emptyBy = () => ({ day: 0, week: 0, month: 0, year: 0 });

/** Check-offs in each of the last n periods, split by cadence. */
function bucketsFor(scope, n) {
  const cur = startOf(scope, now());
  const out = [];
  for (let back = n - 1; back >= 0; back--) {
    const s = addPeriods(scope, cur, -back);
    out.push({ s, e: addPeriods(scope, s, 1), cur: back === 0, by: emptyBy(), total: 0, label: back === 0 ? "Now" : shortLabel(scope, keyOf(s)) });
  }
  return fill(out);
}
/** Check-offs inside the current period: by day (week, month) or by month (year). */
function insideBuckets(scope) {
  const s0 = startOf(scope, now()), end = addPeriods(scope, s0, 1);
  const sub = scope === "year" ? "month" : "day";
  const today = startOf(sub, now()).getTime();
  const out = [];
  for (let s = s0; s < end; s = addPeriods(sub, s, 1)) {
    const label = scope === "week" ? s.toLocaleDateString(undefined, { weekday: "short" })
      : scope === "month" ? String(s.getDate()) : s.toLocaleDateString(undefined, { month: "narrow" });
    out.push({ s, e: addPeriods(sub, s, 1), cur: s.getTime() === today, future: s.getTime() > today, by: emptyBy(), total: 0, label });
  }
  return fill(out);
}
function fill(buckets) {
  const first = buckets[0].s.getTime(), last = buckets[buckets.length - 1].e.getTime();
  for (const ev of completionEvents()) {
    if (ev.at < first || ev.at >= last) continue;
    const b = buckets.find((b) => ev.at >= b.s.getTime() && ev.at < b.e.getTime());
    if (b) { b.by[ev.cad]++; b.total++; }
  }
  return buckets;
}
const doneSince = (date) => completionEvents().filter((e) => e.at >= date.getTime()).length;

function elapsed(scope) {
  const s = startOf(scope, now()), e = addPeriods(scope, s, 1);
  return Math.min(1, Math.max(0, (now() - s) / (e - s)));
}

/* ---------- Feedback: haptics & sound ---------- */
const Feel = (() => {
  // iOS Safari gives a light haptic tick when a switch checkbox toggles.
  let label = null;
  function ensure() {
    if (label) return;
    label = document.createElement("label");
    label.style.display = "none";
    label.setAttribute("aria-hidden", "true");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    label.appendChild(input);
    document.body.appendChild(label);
  }
  function tick() {
    if (!state.settings.haptics) return;
    if (navigator.vibrate) { navigator.vibrate(12); return; }
    ensure();
    label.click();
  }
  function pattern(times) { times.forEach((t) => setTimeout(tick, t)); }

  let ctx = null;
  function audio() {
    if (!state.settings.sound) return null;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch { return null; }
  }
  function note(a, freq, t, dur, type = "sine", gain = 0.18) {
    const o = a.createOscillator(), g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, a.currentTime + t);
    g.gain.setValueAtTime(0, a.currentTime + t);
    g.gain.linearRampToValueAtTime(gain, a.currentTime + t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, a.currentTime + t + dur);
    o.connect(g).connect(a.destination);
    o.start(a.currentTime + t);
    o.stop(a.currentTime + t + dur + 0.05);
  }
  function pop(a, t) {
    const len = a.sampleRate * 0.06, buf = a.createBuffer(1, len, a.sampleRate), data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    src.buffer = buf; f.type = "bandpass"; f.frequency.value = 2200; g.gain.value = 0.5;
    src.connect(f).connect(g).connect(a.destination);
    src.start(a.currentTime + t);
  }

  return {
    tap() { tick(); },
    complete() {
      pattern([0, 55, 110, 170]);
      const a = audio(); if (!a) return;
      pop(a, 0);
      const base = 1046.5 * Math.pow(2, (Math.floor(Math.random() * 3)) / 12);
      [1, 1.26, 1.5, 2].forEach((m, i) => note(a, base * m, 0.03 + i * 0.055, 0.35, "triangle", 0.12));
      note(a, base * 2, 0.25, 0.6, "sine", 0.06);
    },
    undo() {
      tick();
      const a = audio(); if (!a) return;
      note(a, 520, 0, 0.12, "sine", 0.08); note(a, 390, 0.06, 0.16, "sine", 0.08);
    },
    allClear() {
      pattern([0, 40, 80, 120, 160, 200, 240, 280, 320, 400, 850, 1000, 1100, 1300, 1380, 1600, 1750]);
      const a = audio(); if (!a) return;
      const fan = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568, 2093];
      fan.forEach((f, i) => note(a, f, i * 0.07, 0.5, "triangle", 0.11));
      [523.25, 659.25, 783.99, 1046.5].forEach((f) => note(a, f, 0.55, 1.4, "sine", 0.07));
      [0.85, 1.0, 1.1, 1.3, 1.38, 1.6, 1.75].forEach((t) => pop(a, t));
    },
  };
})();

/* ---------- Confetti ---------- */
const Confetti = (() => {
  const canvas = document.getElementById("confetti");
  const g = canvas.getContext("2d");
  let parts = [], running = false, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
  }
  addEventListener("resize", resize);
  resize();
  const COLORS = [...HUES, "#ffffff"];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const rnd = (a, b) => a + Math.random() * (b - a);
  function add(p) { parts.push({ born: performance.now() + (p.delay || 0) * 1000, ...p }); }
  function loop(t) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => (t - p.born) / 1000 < p.life);
    for (const p of parts) {
      const s = (t - p.born) / 1000;
      if (s < 0) continue;
      const k = 1.6, drag = (1 - Math.exp(-k * s)) / k;
      const x = p.x + p.vx * drag, y = p.y + p.vy * drag + 0.5 * p.grav * s * s * 0.55;
      g.save();
      g.globalAlpha = Math.min(1, (p.life - s) / 0.45);
      g.translate(x, y);
      g.rotate(p.spin * s);
      g.scale(Math.cos(p.flutter * s), 1);
      g.fillStyle = p.color;
      const z = p.size;
      if (p.shape === 0) g.fillRect(-z / 2, -z / 3, z, z * 0.66);
      else if (p.shape === 1) { g.beginPath(); g.arc(0, 0, z / 2.5, 0, 7); g.fill(); }
      else if (p.shape === 2) g.fillRect(-z / 6, -z, z / 3, z * 2);
      else {
        g.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 ? z * 0.3 : z * 0.7, a = (i * Math.PI) / 5 - Math.PI / 2;
          i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        g.fill();
      }
      g.restore();
    }
    if (parts.length) requestAnimationFrame(loop);
    else { running = false; g.clearRect(0, 0, innerWidth, innerHeight); }
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(loop); } }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  return {
    burst(x, y, colors) {
      const n = reduced ? 14 : 46;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, sp = rnd(180, 620);
        add({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 260, life: rnd(1, 1.7), color: pick([...colors, ...COLORS]), size: rnd(5, 11), spin: rnd(-12, 12), flutter: rnd(6, 16), shape: Math.floor(Math.random() * 4), grav: 900 });
      }
      kick();
    },
    cannons() {
      const W = innerWidth, H = innerHeight;
      for (const side of [0, 1]) for (let i = 0; i < (reduced ? 20 : 90); i++) {
        const a = side === 0 ? rnd(-1.45, -0.75) : rnd(-Math.PI + 0.75, -Math.PI + 1.45), sp = rnd(700, 1300) * Math.min(1, H / 850);
        add({ x: side * W, y: H + 10, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, delay: rnd(0, 0.25), life: rnd(2.2, 3.2), color: pick(COLORS), size: rnd(6, 13), spin: rnd(-10, 10), flutter: rnd(5, 14), shape: Math.floor(Math.random() * 4), grav: 700 });
      }
      for (let i = 0; i < (reduced ? 10 : 70); i++) {
        add({ x: rnd(0, W), y: -20, vx: rnd(-60, 60), vy: rnd(40, 160), delay: rnd(0.5, 1.4), life: 3, color: pick(COLORS), size: rnd(6, 12), spin: rnd(-8, 8), flutter: rnd(4, 10), shape: Math.random() < 0.5 ? 0 : 2, grav: 220 });
      }
      kick();
    },
  };
})();

/* ---------- DOM helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const scopeVars = (s) => `--a:${META[s].colors[0]};--b:${META[s].colors[1]}`;
function setScopeColors(s) {
  document.documentElement.style.setProperty("--c1", META[s].colors[0]);
  document.documentElement.style.setProperty("--c2", META[s].colors[1]);
  document.querySelector('meta[name="theme-color"]').setAttribute("content", "#07060D");
}
let toastTimer;
function toast(msg, action) {
  const t = $("#toast");
  t.textContent = msg;
  if (action) {
    const b = document.createElement("button");
    b.className = "toast-action";
    b.textContent = action.label;
    b.onclick = () => { t.hidden = true; action.run(); };
    t.appendChild(b);
  }
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), action ? 5000 : 2600);
}
function flash(color) {
  const f = $("#flash");
  f.style.setProperty("--flash", color);
  f.animate([{ opacity: 0 }, { opacity: 0.35, offset: 0.15 }, { opacity: 0 }], { duration: 650, easing: "ease-out" });
}

/* ---------- Layout ---------- */
let selected = "day";
const pages = {};
const cards = { day: new Map(), week: new Map(), month: new Map(), year: new Map() };
const settling = new Set();
const chartSig = {};

function buildPages() {
  const pager = $("#pager");
  for (const s of SCOPES) {
    const m = META[s];
    const sec = document.createElement("section");
    sec.className = "page";
    sec.dataset.scope = s;
    sec.style.cssText = scopeVars(s);
    sec.setAttribute("aria-label", m.tab);
    sec.innerHTML = `
      <div class="page-inner">
        <header class="hero">
          <div class="hero-text">
            <h1>${m.title}</h1>
            <div class="sub" data-sub></div>
            <div class="headline" data-headline></div>
            ${s === "day" ? '<div class="legend" data-legend></div>' : ""}
          </div>
          <div class="ring-wrap">
            ${ringsSvg(s)}
            <div class="ring-center"><div class="pct" data-pct>0%</div>${s === "day" ? "" : '<div class="lbl">done</div>'}</div>
          </div>
        </header>
        <div class="chips" data-chips></div>
        <button class="history-btn" data-history>${icon("clock")}<span class="h-label">Past tasks</span><span class="h-sub" data-history-sub></span>${icon("chev", 'class="h-chev"')}</button>
        <div class="overdue-strip" data-overdue hidden></div>
        <div class="list" data-list></div>
        <div class="snoozed" data-snoozed hidden>
          <button class="snoozed-toggle" data-snooze-toggle aria-expanded="false">${icon("zzz")}<span></span>${icon("chev", 'class="snz-chev"')}</button>
          <div class="snoozed-list" hidden></div>
        </div>
        <div class="card empty" data-empty hidden>
          ${icon(m.icon)}
          <h3>${s === "day" ? "Nothing due today" : `Nothing set for this ${m.unit}`}</h3>
          <p>Tap + to add a task, once or on a ${m.cadence.toLowerCase()} cadence.</p>
        </div>
        <div class="charts" data-charts></div>
        ${s === "day" ? `<button class="settings-btn" data-settings>${icon("gear")}Settings &amp; backup</button>` : ""}
      </div>`;
    pager.appendChild(sec);
    pages[s] = sec;
    $("[data-history]", sec).addEventListener("click", () => { Feel.tap(); openHistory(); });
    $("[data-snoozed]", sec).addEventListener("click", (e) => {
      const row = e.target.closest("[data-open]");
      if (row) { Feel.tap(); openTaskSheet(row.dataset.open); return; }
      if (e.target.closest("[data-snooze-toggle]")) {
        snoozeOpen.has(s) ? snoozeOpen.delete(s) : snoozeOpen.add(s);
        Feel.tap();
        renderSnoozed(s, periodKey(s));
      }
    });
  }

  const bar = $("#tabbar");
  for (const s of SCOPES) {
    const b = document.createElement("button");
    b.className = "tab";
    b.dataset.tab = s;
    b.style.cssText = scopeVars(s);
    b.innerHTML = `${icon(META[s].icon)}<span>${META[s].tab}</span><b class="count" hidden></b>`;
    b.addEventListener("click", () => goTo(s, true));
    bar.appendChild(b);
  }
  const add = document.createElement("button");
  add.className = "add-btn";
  add.setAttribute("aria-label", "Add task");
  add.innerHTML = icon("plus");
  add.addEventListener("click", () => { Feel.tap(); openAdd(); });
  bar.appendChild(add);

  pager.addEventListener("scroll", () => {
    const i = Math.round(pager.scrollLeft / pager.clientWidth);
    const s = SCOPES[Math.max(0, Math.min(3, i))];
    if (s !== selected) { selected = s; Feel.tap(); updateTabs(); }
  }, { passive: true });
  addEventListener("resize", () => { pager.scrollLeft = SCOPES.indexOf(selected) * pager.clientWidth; updateTabs(); });
}

function ringsSvg(s) {
  const rings = s === "day" ? SCOPES : [s];
  const width = s === "day" ? 9 : 18;
  let defs = "", body = "";
  rings.forEach((r, i) => {
    const rad = 50 - width / 2 - i * (width + 2.5);
    const c = 2 * Math.PI * rad;
    defs += `<linearGradient id="g-${s}-${r}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${META[r].colors[0]}"/><stop offset="1" stop-color="${META[r].colors[1]}"/></linearGradient>`;
    body += `<circle class="ring-track" cx="50" cy="50" r="${rad}" stroke="${META[r].colors[0]}" stroke-opacity=".17" stroke-width="${width}"/>
      <circle class="ring-bar" data-ring="${r}" data-c="${c}" cx="50" cy="50" r="${rad}" stroke="url(#g-${s}-${r})" stroke-width="${width}"
        stroke-dasharray="${c}" stroke-dashoffset="${c}" transform="rotate(-90 50 50)" style="filter:drop-shadow(0 0 3px ${META[r].colors[1]})" opacity="0"/>`;
  });
  return `<svg viewBox="0 0 100 100"><defs>${defs}</defs>${body}</svg>`;
}

function goTo(s, smooth) {
  const pager = $("#pager");
  selected = s;
  pager.scrollTo({ left: SCOPES.indexOf(s) * pager.clientWidth, behavior: smooth ? "smooth" : "instant" });
  if (smooth) Feel.tap();
  updateTabs();
}

function updateTabs() {
  setScopeColors(selected);
  const bar = $("#tabbar");
  const ind = $("#tabIndicator");
  for (const b of bar.querySelectorAll(".tab")) {
    const s = b.dataset.tab;
    b.classList.toggle("on", s === selected);
    const p = progress(s);
    const left = p.total - p.done;
    const c = b.querySelector(".count");
    c.hidden = left === 0;
    c.textContent = left;
    c.classList.toggle("late", items(s).some(overdueSince));
    b.setAttribute("aria-label", `${META[s].tab}, ${left} left`);
    if (s === selected) {
      ind.style.width = b.offsetWidth + "px";
      ind.style.transform = `translateX(${b.offsetLeft}px)`;
    }
  }
}

/* ---------- Rendering ---------- */
function renderAll() {
  for (const s of SCOPES) renderPage(s);
  updateTabs();
}

function renderPage(s) {
  const page = pages[s];
  const p = periodKey(s);
  const pr = progress(s, p);
  const left = pr.total - pr.done;

  $("[data-sub]", page).textContent = periodTitle(s, p);
  const late = items(s, p).map(overdueSince).filter(Boolean).sort();
  const strip = $("[data-overdue]", page);
  strip.hidden = late.length === 0;
  if (late.length) strip.innerHTML = `${icon("alert")}<b>${late.length} overdue</b><span>Oldest ${lateText(late[0])}</span>`;
  $("[data-headline]", page).textContent =
    late.length ? `${late.length} overdue. Knock those out first.` :
    pr.total === 0 ? "A clean slate." :
    left === 0 ? "All clear. Legendary." :
    pr.done === 0 ? `${left} to go. First one's the hardest.` :
    `${left} to go. Keep the streak hot.`;
  setText($("[data-pct]", page), Math.round(pr.frac * 100) + "%");

  for (const ring of page.querySelectorAll("[data-ring]")) {
    const r = ring.dataset.ring;
    const f = progress(r).frac;
    const c = Number(ring.dataset.c);
    ring.setAttribute("stroke-dashoffset", c * (1 - f));
    ring.setAttribute("opacity", f > 0 ? 1 : 0);
  }

  const legend = $("[data-legend]", page);
  if (legend) {
    legend.innerHTML = SCOPES.map((x) => {
      const q = progress(x);
      return `<span style="${scopeVars(x)}"><i class="dot"></i>${x === "day" ? "Day" : META[x].tab} <b>${q.done}/${q.total}</b></span>`;
    }).join("");
  }

  const chips = [
    { v: left, l: "left", i: "dashed", col: META[s].colors[0] },
    { v: pr.done, l: "done", i: "seal", col: "#00F5A0" },
    s === "day"
      ? { v: dayStreak(), l: "day streak", i: "flame", col: "#FF8A00" }
      : { v: Math.round(elapsed(s) * 100) + "%", l: `of ${META[s].unit} gone`, i: "hourglass", col: META[s].colors[1] },
  ];
  const chipBox = $("[data-chips]", page);
  if (!chipBox.children.length) {
    chipBox.innerHTML = chips.map((c) => `<div class="chip" style="--col:${c.col}"><div class="v">${icon(c.i)}<span></span></div><div class="l"></div></div>`).join("");
  }
  chips.forEach((c, i) => {
    const el = chipBox.children[i];
    setText($(".v span", el), String(c.v));
    $(".l", el).textContent = c.l;
  });

  renderList(s, p);
  renderSnoozed(s, p);
  const n = doneSince(startOf(s, now()));
  $("[data-history-sub]", page).textContent = `${n} done ${s === "day" ? "today" : `this ${META[s].unit}`}`;
  renderCharts(s, p, pr);
}

function setText(el, text) {
  if (el.textContent === text) return;
  const first = el.textContent !== "";
  el.textContent = text;
  if (first) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
}

function ordered(s, p) {
  return items(s, p).sort((a, b) => {
    const ad = isDone(a.t, a.p) && !settling.has(a.key), bd = isDone(b.t, b.p) && !settling.has(b.key);
    if (ad !== bd) return ad ? 1 : -1;
    const ao = overdueSince(a), bo = overdueSince(b);
    if (!!ao !== !!bo) return ao ? -1 : 1;
    if (ao && bo && ao !== bo) return ao < bo ? -1 : 1;
    if (a.p !== b.p) return a.p < b.p ? -1 : 1;
    return a.t.createdAt - b.t.createdAt;
  });
}

function renderList(s, p) {
  const page = pages[s];
  const list = $("[data-list]", page);
  const rows = ordered(s, p);
  $("[data-empty]", page).hidden = rows.length > 0;

  const before = new Map();
  for (const el of list.children) before.set(el.dataset.id, el.getBoundingClientRect().top);

  const keep = new Set(rows.map((r) => r.key));
  for (const [key, el] of cards[s]) {
    if (!keep.has(key)) {
      cards[s].delete(key);
      el.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(.6)" }], { duration: 250, easing: "ease-in" })
        .finished.then(() => el.remove(), () => el.remove());
    }
  }
  for (const r of rows) {
    let el = cards[s].get(r.key);
    if (!el) { el = createCard(r.key); cards[s].set(r.key, el); }
    updateCard(el, r, s, p);
    list.appendChild(el);
  }
  for (const r of rows) {
    const el = cards[s].get(r.key);
    const top = el.getBoundingClientRect().top;
    if (!before.has(r.key)) {
      el.animate([{ opacity: 0, transform: "scale(.85)" }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(.34,1.5,.64,1)" });
    } else {
      const dy = before.get(r.key) - top;
      if (Math.abs(dy) > 1) el.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: 520, easing: "cubic-bezier(.3,1.25,.5,1)" });
    }
  }
}

const snoozeOpen = new Set();
function renderSnoozed(s, p) {
  const box = $("[data-snoozed]", pages[s]);
  const rows = snoozedItems(s, p).sort((a, b) => (snoozedUntil(a) < snoozedUntil(b) ? -1 : 1));
  box.hidden = rows.length === 0;
  if (!rows.length) return;
  const open = snoozeOpen.has(s);
  const btn = $("[data-snooze-toggle]", box);
  btn.setAttribute("aria-expanded", String(open));
  btn.classList.toggle("open", open);
  $("span", btn).textContent = `${rows.length} snoozed`;
  const list = $(".snoozed-list", box);
  list.hidden = !open;
  list.innerHTML = rows.map((r) => `
    <button class="snoozed-row" data-open="${esc(r.key)}" style="--hue:${HUES[r.t.hue % HUES.length]}">
      <i class="snz-dot"></i><span class="snz-title">${esc(r.t.title)}</span>
      <small>Until ${esc(dueLabel(snoozedUntil(r)))}</small>
    </button>`).join("");
}

function createCard(key) {
  const row = document.createElement("div");
  row.className = "swipe-row";
  row.dataset.id = key;
  row.innerHTML = `
    <button class="swipe-del" tabindex="-1" aria-hidden="true">${icon("trash")}<span>Delete</span></button>
    <div class="task" data-id="${esc(key)}" tabindex="0" role="group">
      <div class="sweep"></div>
      <button class="orb-hit" type="button"><span class="orb">${icon("check")}<i class="wave"></i></span></button>
      <div class="task-body"><div class="task-title"></div><div class="badges"></div></div>
      <span class="chev" aria-hidden="true">${icon("chev")}</span>
      <div class="cheer"></div>
    </div>`;
  attachPress($(".task", row), row);
  return row;
}

function updateCard(row, item, s, p) {
  const { t } = item;
  const el = $(".task", row);
  const done = isDone(t, item.p);
  el.style.setProperty("--hue", HUES[t.hue % HUES.length]);
  el.classList.toggle("done", done);
  const hit = $(".orb-hit", el);
  hit.setAttribute("aria-pressed", String(done));
  hit.setAttribute("aria-label", done ? `Mark “${t.title}” not done` : `Complete “${t.title}”`);
  el.setAttribute("aria-label", `${t.title}${done ? ", done" : ""}. Open to edit or snooze.`);
  $(".task-title", el).textContent = t.title;
  const badges = [];
  const st = taskStreak(t);
  const late = overdueSince(item);
  el.classList.toggle("overdue", !!late);
  if (late) badges.push(badge(`${lateText(late)} · due ${dueLabel(late)}`, "alert", "#FF5A5F", "late"));
  if (t.sched) {
    const today = keyOf(now());
    badges.push(badge(schedLabel(t.sched), "calendar", META.week.colors[0]));
    if (!late && s !== "day") badges.push(badge(item.p === today ? "Today" : dueLabel(item.p), "sun", item.p === today ? META.day.colors[0] : "rgba(255,255,255,.75)"));
    if (st > 1) badges.push(badge(`${st} in a row`, "flame", "#FF8A00"));
  } else {
    if (t.repeats) badges.push(badge(META[t.scope].cadence, "repeat", META[t.scope].colors[0]));
    if (st > 1) badges.push(badge(`${st} ${META[t.scope].unit} streak`, "flame", "#FF8A00"));
  }
  $(".badges", el).innerHTML = badges.join("");
}
const badge = (text, i, col, cls = "") => `<span class="badge ${cls}" style="--col:${col}">${icon(i)}${esc(text)}</span>`;

/* The circle completes a task; tapping anywhere else on the card opens it. Swipe left deletes. */
const OPEN_X = -96;      // resting offset when the Delete button is showing
let openRow = null;      // { row, close } for the one row swiped open

function attachPress(el, row) {
  const del = $(".swipe-del", row);
  let startX = 0, startY = 0;
  let mode = null;       // null until we know if this is a tap, a scroll or a swipe
  let base = 0, offset = 0, armed = false, swallowClick = false;

  const setOffset = (x, animate) => {
    offset = x;
    el.style.transition = animate ? "transform .32s cubic-bezier(.2,1.1,.3,1)" : "none";
    el.style.transform = x ? `translateX(${x}px)` : "";
    del.style.transition = animate ? "opacity .32s" : "none";
    del.style.opacity = Math.min(1, -x / 60);
  };
  const close = () => { setOffset(0, true); base = 0; if (openRow && openRow.row === row) openRow = null; };

  el.addEventListener("pointerdown", (e) => {
    if (openRow && openRow.row !== row) openRow.close();
    mode = null; armed = false;
    startX = e.clientX; startY = e.clientY;
    base = offset;
    if (!e.target.closest(".orb-hit")) el.classList.add("pressing");
  });
  el.addEventListener("pointermove", (e) => {
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (!mode) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        mode = "swipe";
        el.classList.remove("pressing");
        try { el.setPointerCapture(e.pointerId); } catch {}
      } else if (Math.abs(dy) > 8) {
        mode = "scroll";
        el.classList.remove("pressing");
      }
    }
    if (mode !== "swipe") return;
    let x = base + dx;
    if (x > 0) x = x / 4; // resist swiping right
    setOffset(x, false);
    const nowArmed = -x > el.offsetWidth * 0.45;
    if (nowArmed !== armed) {
      armed = nowArmed;
      row.classList.toggle("armed", armed);
      if (armed) Feel.tap();
    }
  });
  const end = () => {
    el.classList.remove("pressing");
    if (mode !== "swipe") return;
    swallowClick = true;
    row.classList.remove("armed");
    if (armed) { deleteWithSwipe(el.dataset.id, row, el); return; }
    if (offset < OPEN_X / 1.4) {
      setOffset(OPEN_X, true);
      base = OPEN_X;
      openRow = { row, close };
    } else close();
  };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", () => { el.classList.remove("pressing"); if (mode === "swipe") close(); });
  el.addEventListener("pointerleave", () => { if (mode !== "swipe") el.classList.remove("pressing"); });
  el.addEventListener("contextmenu", (e) => e.preventDefault());
  el.addEventListener("click", (e) => {
    if (swallowClick) { swallowClick = false; return; }
    if (offset !== 0) { close(); return; }
    if (e.target.closest(".orb-hit")) { toggle(el.dataset.id, el); return; }
    Feel.tap();
    openTaskSheet(el.dataset.id);
  });
  el.addEventListener("keydown", (e) => {
    if (e.target !== el) return;
    if (e.key === "Enter") { e.preventDefault(); openTaskSheet(el.dataset.id); }
    if (e.key === " ") { e.preventDefault(); toggle(el.dataset.id, el); }
    if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); deleteWithSwipe(el.dataset.id, row, el); }
  });
  del.addEventListener("click", () => deleteWithSwipe(el.dataset.id, row, el));
}

/* Slide the card off, fold the row away, then delete with an Undo option. */
function deleteWithSwipe(id, row, el) {
  if (openRow && openRow.row === row) openRow = null;
  Feel.undo();
  el.style.transition = "transform .22s ease-in";
  el.style.transform = `translateX(-${el.offsetWidth + 40}px)`;
  const h = row.offsetHeight;
  row.animate([{ height: h + "px", marginBottom: "0px" }, { height: "0px", marginBottom: "-10px" }], { duration: 260, delay: 160, easing: "ease-in-out", fill: "forwards" })
    .finished.then(() => {
      for (const s of SCOPES) cards[s].delete(id);
      row.remove();
      deleteTask(taskIdOf(id));
    });
}

function deleteTask(key) {
  const id = taskIdOf(key);
  const i = state.tasks.findIndex((x) => x.id === id);
  if (i < 0) return;
  const [removed] = state.tasks.splice(i, 1);
  save();
  renderAll();
  toast(`Deleted “${removed.title.length > 28 ? removed.title.slice(0, 27) + "…" : removed.title}”`, {
    label: "Undo",
    run: () => {
      state.tasks.splice(Math.min(i, state.tasks.length), 0, removed);
      save();
      Feel.tap();
      renderAll();
    },
  });
}

/* ---------- Actions ---------- */
function toggle(key, el) {
  const t = state.tasks.find((x) => x.id === taskIdOf(key));
  if (!t) return;
  const page = el.closest(".page");
  const s = page ? page.dataset.scope : colorScope(t);
  const p = key.includes("@") ? key.split("@")[1] : periodKey(t.scope);
  if (isDone(t, p)) {
    t.completions = t.repeats ? t.completions.filter((c) => c.p !== p) : [];
    Feel.undo();
    save();
    renderAll();
    return;
  }
  const pr = progress(s);
  const finishes = pr.total - pr.done === 1;
  t.completions.push({ p, at: Date.now() });
  save();

  const hue = HUES[t.hue % HUES.length];
  Feel.complete();
  const orb = $(".orb", el).getBoundingClientRect();
  Confetti.burst(orb.left + orb.width / 2, orb.top + orb.height / 2, [hue, ...META[s].colors]);
  flash(hue);
  el.animate([{ transform: "scale(1)", boxShadow: `0 0 0 ${hue}` }, { transform: "scale(1.035)", boxShadow: `0 0 26px ${hue}`, offset: 0.35 }, { transform: "scale(1)", boxShadow: `0 0 0 ${hue}` }], { duration: 650, easing: "cubic-bezier(.34,1.6,.64,1)" });
  $(".orb", el).animate([{ transform: "scale(1)" }, { transform: "scale(1.4)", offset: 0.35 }, { transform: "scale(1)" }], { duration: 600, easing: "cubic-bezier(.34,1.8,.64,1)" });
  $(".wave", el).animate([{ transform: "scale(1)", opacity: 0.9, borderWidth: "6px" }, { transform: "scale(2.8)", opacity: 0, borderWidth: "1px" }], { duration: 700, easing: "ease-out" });
  $(".sweep", el).animate([{ transform: "translateX(-70%)", opacity: 1 }, { transform: `translateX(${el.offsetWidth * 1.1}px)`, opacity: 1 }], { duration: 650, easing: "ease-in-out" });
  const cheer = $(".cheer", el);
  cheer.textContent = CHEERS[Math.floor(Math.random() * CHEERS.length)];
  cheer.animate([
    { opacity: 0, transform: "scale(.2)" },
    { opacity: 1, transform: "scale(1.15)", offset: 0.2 },
    { opacity: 1, transform: "scale(1)", offset: 0.65 },
    { opacity: 0, transform: "translateY(-26px)" },
  ], { duration: 1200, easing: "ease-out" });

  settling.add(key);
  renderAll();
  setTimeout(() => { settling.delete(key); renderAll(); }, 950);

  if (finishes) setTimeout(() => celebrate(s), 400);
}

function celebrate(s) {
  Feel.allClear();
  Confetti.cannons();
  const wrap = $("#bannerWrap");
  wrap.innerHTML = `<div class="banner" style="${scopeVars(s)}">${icon("trophy")}<h2>${META[s].clear}</h2><p>Every ${META[s].unit} task done</p></div>`;
  const b = wrap.firstElementChild;
  setTimeout(() => b.classList.add("out"), 2600);
  setTimeout(() => { if (wrap.firstElementChild === b) wrap.innerHTML = ""; }, 3000);
}

/* ---------- Sheets ---------- */
let sheetCleanup = null, sheetToken = 0;
function openSheet(html, scope, onMount) {
  // Swap in a fresh element so listeners from earlier sheets can't fire on this one.
  const old = $("#sheet"), sheet = old.cloneNode(false), back = $("#backdrop");
  old.replaceWith(sheet);
  sheetToken++; // cancels a pending close
  sheet.style.cssText = scopeVars(scope);
  sheet.innerHTML = html;
  sheet.hidden = false;
  back.hidden = false;
  sheet.classList.remove("closing");
  back.onclick = closeSheet;
  sheet.querySelectorAll("[data-close]").forEach((b) => (b.onclick = closeSheet));
  sheetCleanup = onMount ? onMount(sheet) : null;
}
function closeSheet() {
  const sheet = $("#sheet"), back = $("#backdrop");
  if (sheet.hidden) return;
  sheet.classList.add("closing");
  back.hidden = true;
  if (document.activeElement) document.activeElement.blur();
  const token = ++sheetToken;
  setTimeout(() => { if (token === sheetToken) { sheet.hidden = true; sheet.innerHTML = ""; } }, 240);
  if (sheetCleanup) sheetCleanup();
  sheetCleanup = null;
}
addEventListener("keydown", (e) => { if (e.key === "Escape" && !authOpen) closeSheet(); });
const sheetHead = (title) => `<div class="sheet-head"><h2>${title}</h2><button class="close" data-close aria-label="Close">${icon("close")}</button></div>`;

const openAdd = () => openTaskSheet(null);

/** New task (key = null) or open an existing one: edit everything, snooze, delete. */
function openTaskSheet(key) {
  const today = now();
  let t = key ? state.tasks.find((x) => x.id === taskIdOf(key)) : null;
  if (key && !t) return;
  // Data may be reloaded while the sheet is open (app switch, another tab); always act on the live copy.
  const live = () => { if (t) t = state.tasks.find((x) => x.id === t.id) || t; return t; };
  const itemP = key && key.includes("@") ? key.split("@")[1] : t ? periodKey(t.scope) : null;
  const item = t ? { t, p: itemP, key } : null;

  let mode = t ? (t.sched ? "sched" : t.repeats ? "every" : "once") : "once";
  let scope = t && !t.sched ? t.scope : selected;
  let hue = t ? t.hue : Math.floor(Math.random() * HUES.length);
  const sc0 = t && t.sched;
  let schedType = sc0 ? sc0.type : "weekly";
  let days = sc0 && sc0.type === "weekly" ? [...sc0.days] : [today.getDay()];
  let mday = sc0 && sc0.type === "monthly" ? sc0.day : today.getDate();
  let yearly = sc0 && sc0.type === "yearly" ? keyOf(new Date(today.getFullYear(), sc0.month, sc0.day)) : keyOf(today);

  const snoozeChoices = () => {
    const d = (n) => keyOf(addDays(today, n));
    const sat = (6 - today.getDay() + 7) % 7 || 7;
    const out = [["Tomorrow", d(1)]];
    if (sat > 1) out.push(["This weekend", d(sat)]);
    out.push(["Next week", periodKeyOffset("week", 1)]);
    out.push(["Next month", periodKeyOffset("month", 1)]);
    return out;
  };
  const snoozedNow = item && isSnoozed(item) ? snoozedUntil(item) : null;

  openSheet(`
    ${sheetHead(t ? "Task" : "New task")}
    <textarea class="field" id="taskTitle" rows="1" placeholder="What needs doing?" enterkeyhint="done" maxlength="120"></textarea>
    ${t ? `<div class="snooze-box">
      <div class="section-label">${icon("zzz", 'class="lbl-ic"')}Snooze</div>
      ${snoozedNow ? `<div class="snoozed-note">Snoozed until <b>${esc(dueLabel(snoozedNow))}</b><button class="pill mini" data-unsnooze>Wake it up</button></div>` : ""}
      <div class="pills">${snoozeChoices().map(([l, k]) => `<button class="pill snz" data-snooze="${k}"><span>${l}</span><small>${esc(dueLabel(k))}</small></button>`).join("")}</div>
      <label class="pick-date">${icon("calendar")}<span>Pick a date</span><input type="date" id="snoozeDate" min="${keyOf(addDays(today, 1))}"></label>
    </div>` : ""}
    <div><div class="section-label">How often</div><div class="pills" data-often></div><p class="hint" data-hint></p></div>
    <div data-when-wrap><div class="section-label">When</div><div class="pills" data-when></div></div>
    <div data-sched-wrap hidden><div class="section-label">Repeats</div><div class="pills three" data-stype></div><div class="sched-pick" data-spick></div></div>
    <div><div class="section-label">Color</div><div class="swatches" data-swatches></div></div>
    <button class="cta" id="taskGo" disabled>${t ? icon("check") + "Save changes" : icon("plus") + "Add task"}</button>
    ${t ? `<button class="menu-item red center" data-delete>${icon("trash")}Delete task</button>` : ""}`, scope, (sheet) => {
    const field = $("#taskTitle", sheet), go = $("#taskGo", sheet);
    field.value = t ? t.title : "";
    const sched = () => schedType === "weekly" ? { type: "weekly", days: [...days].sort() }
      : schedType === "monthly" ? { type: "monthly", day: mday }
      : { type: "yearly", month: parseKey(yearly).getMonth(), day: parseKey(yearly).getDate() };
    const valid = () => field.value.trim() && !(mode === "sched" && schedType === "weekly" && days.length === 0);
    const cadenceChanged = () => t && (
      mode !== (t.sched ? "sched" : t.repeats ? "every" : "once") ||
      (mode !== "sched" && scope !== t.scope) ||
      (mode === "sched" && JSON.stringify(sched()) !== JSON.stringify(t.sched)));
    const paint = () => {
      const look = mode === "sched" ? "week" : scope;
      const pv = (x) => `--pa:${META[x].colors[0]};--pb:${META[x].colors[1]}`;
      sheet.style.cssText = scopeVars(look) + `;--hue:${HUES[hue]}`;
      $("[data-often]", sheet).innerHTML =
        `<button class="pill ${mode === "once" ? "on" : ""}" data-mode="once" style="${pv(look)}">${icon("check")}Just once</button>
         <button class="pill ${mode === "every" ? "on" : ""}" data-mode="every" style="${pv(look)}">${icon("repeat")}${mode === "sched" ? "Every day/week…" : META[scope].every}</button>
         <button class="pill span2 ${mode === "sched" ? "on" : ""}" data-mode="sched" style="${pv(look)}">${icon("calendar")}On specific days</button>`;
      $("[data-when-wrap]", sheet).hidden = mode === "sched";
      $("[data-sched-wrap]", sheet).hidden = mode !== "sched";
      $("[data-when]", sheet).innerHTML = SCOPES.map((x) =>
        `<button class="pill ${x === scope ? "on" : ""}" data-s="${x}" style="${pv(x)}">${icon(META[x].icon)}${mode === "every" ? META[x].every : META[x].once}</button>`).join("");
      if (mode === "sched") {
        $("[data-stype]", sheet).innerHTML = [["weekly", "Weekly"], ["monthly", "Monthly"], ["yearly", "Yearly"]].map(([k, l]) =>
          `<button class="pill ${schedType === k ? "on" : ""}" data-stype="${k}" style="${pv("week")}">${l}</button>`).join("");
        const pick = $("[data-spick]", sheet);
        if (schedType === "weekly") {
          pick.innerHTML = `<div class="dow">${DOW.map((d, i) => `<button class="dow-btn ${days.includes(i) ? "on" : ""}" data-dow="${i}" aria-label="${d}" aria-pressed="${days.includes(i)}">${d[0]}</button>`).join("")}</div>`;
        } else if (schedType === "monthly") {
          pick.innerHTML = `<div class="mdays">${Array.from({ length: 31 }, (_, i) => `<button class="mday ${mday === i + 1 ? "on" : ""}" data-mday="${i + 1}">${i + 1}</button>`).join("")}</div>`;
        } else if (!$("#yearDate", pick)) {
          pick.innerHTML = `<input type="date" class="field date-field" id="yearDate" value="${yearly}" aria-label="Date each year">`;
          $("#yearDate", pick).addEventListener("change", (e) => { if (e.target.value) { yearly = e.target.value; paint(); } });
        }
      }
      const sc = sched();
      let hint =
        mode === "sched"
          ? (schedType === "weekly" && days.length === 0 ? "Pick at least one day." :
            `${schedLabel(sc)}. Shows on Today when it's due and on the Week page that week.` +
            (schedType !== "weekly" && sc.day > 28 ? " In shorter months it's due on the last day." : ""))
          : mode === "every"
            ? `Shows up on the ${META[scope].tab} page every ${META[scope].unit}. Check it off each time.`
            : scope === "day" ? "Shows up today. If you don't finish, it carries over to tomorrow." : `Shows up on the ${META[scope].tab} page until you finish it.`;
      if (cadenceChanged() && t.completions.length) hint += " Changing how often starts its streak and history over.";
      $("[data-hint]", sheet).textContent = hint;
      $("[data-swatches]", sheet).innerHTML = HUES.map((h, i) => `<button class="swatch ${i === hue ? "on" : ""}" data-h="${i}" style="--sw:${h}" aria-label="Color ${i + 1}"></button>`).join("");
      go.disabled = !valid();
    };
    paint();

    const finishSnooze = (until) => {
      const undo = snoozeTask(live(), itemP, until);
      save();
      Feel.tap();
      closeSheet();
      renderAll();
      toast(`Snoozed until ${dueLabel(until)}`, { label: "Undo", run: () => { undo(); save(); renderAll(); } });
    };

    sheet.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const d = b.dataset;
      if (d.snooze) { finishSnooze(d.snooze); return; }
      if ("unsnooze" in d) { unsnoozeTask(live()); save(); Feel.tap(); closeSheet(); renderAll(); toast("Back on your list"); return; }
      if ("delete" in d) {
        b.outerHTML = `<button class="cta danger" data-delete-confirm>${icon("trash")}Yes, delete “${esc(t.title.length > 22 ? t.title.slice(0, 21) + "…" : t.title)}”</button>`;
        return;
      }
      if ("deleteConfirm" in d) { Feel.undo(); closeSheet(); deleteTask(live().id); return; }
      if (d.s) scope = d.s;
      else if (d.mode) mode = d.mode;
      else if (d.stype) { schedType = d.stype; $("[data-spick]", sheet).innerHTML = ""; }
      else if (d.dow) { const i = Number(d.dow); days = days.includes(i) ? days.filter((x) => x !== i) : [...days, i]; }
      else if (d.mday) mday = Number(d.mday);
      else if (d.h) hue = Number(d.h);
      else return;
      Feel.tap();
      paint();
    });
    const dateIn = $("#snoozeDate", sheet);
    if (dateIn) dateIn.addEventListener("change", () => { if (dateIn.value) finishSnooze(dateIn.value); });

    const submit = () => {
      const title = field.value.replace(/\s+/g, " ").trim();
      if (!valid()) return;
      live();
      let dest = mode === "sched" ? null : scope;
      if (!t) {
        if (mode === "sched") {
          const n = makeTask(title, "dated", true, hue);
          n.start = keyOf(now());
          n.sched = sched();
          state.tasks.push(n);
          dest = dueOn(n, now()) ? "day" : n.sched.type === "weekly" ? "week" : n.sched.type === "monthly" ? "month" : "year";
        } else {
          state.tasks.push(makeTask(title, scope, mode === "every", hue));
        }
      } else {
        const changed = cadenceChanged();
        t.title = title;
        t.hue = hue;
        if (changed) {
          t.completions = [];
          delete t.snooze;
          delete t.hideUntil;
          if (mode === "sched") {
            t.scope = "dated"; t.repeats = true; t.sched = sched(); t.start = keyOf(now());
          } else {
            delete t.sched; t.scope = scope; t.repeats = mode === "every"; t.start = periodKey(scope);
          }
        }
        dest = changed ? (mode === "sched" ? (dueOn(t, now()) ? "day" : null) : scope) : null;
      }
      save();
      Feel.tap();
      closeSheet();
      if (dest && dest !== selected) goTo(dest, true);
      renderAll();
      if (t) toast("Saved");
    };
    field.addEventListener("input", () => {
      if (field.value.includes("\n")) { field.value = field.value.replace(/\n/g, ""); submit(); return; }
      go.disabled = !valid();
      field.style.height = "auto";
      field.style.height = field.scrollHeight + 3 + "px";
    });
    go.addEventListener("click", submit);
    if (!t) setTimeout(() => field.focus(), 60);
    else requestAnimationFrame(() => { field.style.height = "auto"; field.style.height = field.scrollHeight + 3 + "px"; });
  });
}

function openSettings() {
  openSheet(`
    ${sheetHead("Settings")}
    <div class="menu">
      ${user ? `<div class="menu-item account">${icon("info")}<span>Signed in<span class="sub">${esc(user.email || user.displayName || "Your account")}</span></span><button class="pill mini" data-set="signout">Sign out</button></div>` : ""}
      <button class="menu-item" data-set="sound">${icon("sound")}<span>Sounds<span class="sub">Chimes when you finish tasks</span></span><i class="switch ${state.settings.sound ? "on" : ""}"></i></button>
      <button class="menu-item" data-set="haptics">${icon("buzz")}<span>Haptics<span class="sub">Taps on supported phones</span></span><i class="switch ${state.settings.haptics ? "on" : ""}"></i></button>
      <button class="menu-item" data-set="export">${icon("download")}<span>Save a backup<span class="sub">Download your tasks as a file</span></span></button>
      <label class="menu-item">${icon("upload")}<span>Restore a backup<span class="sub">Replaces everything here</span></span><input type="file" accept="application/json,.json" data-import hidden></label>
      <button class="menu-item red" data-set="erase">${icon("trash")}<span>Erase everything<span class="sub">Every task and its history</span></span></button>
    </div>
    <p class="note">${icon("info", 'style="width:14px;height:14px;display:inline;vertical-align:-2px"')} ${user ? "Your tasks sync to your account and work offline. Changes made offline sync when you reconnect." : "Sign in to sync your tasks."}</p>`, "day", (sheet) => {
    sheet.addEventListener("click", (e) => {
      const b = e.target.closest("[data-set]");
      if (!b) return;
      const k = b.dataset.set;
      if (k === "signout") {
        closeSheet();
        cloud.signOut().then(() => {
          state = blankState();
          saveLocal();
          for (const s of SCOPES) { cards[s].clear(); $("[data-list]", pages[s]).innerHTML = ""; }
          renderAll();
        });
        return;
      }
      if (k === "sound" || k === "haptics") {
        state.settings[k] = !state.settings[k];
        $(".switch", b).classList.toggle("on", state.settings[k]);
        save();
        Feel.tap();
      }
      if (k === "export") {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `cadence-backup-${keyOf(now())}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        toast("Backup saved");
      }
      if (k === "erase") {
        b.outerHTML = `<button class="cta danger" data-set="erase-confirm">${icon("trash")}Yes, erase everything</button>`;
      }
      if (k === "erase-confirm") {
        state = { ...blankState(), settings: state.settings };
        save();
        closeSheet();
        for (const s of SCOPES) { cards[s].clear(); $("[data-list]", pages[s]).innerHTML = ""; }
        renderAll();
        toast("Everything erased");
      }
    });
    $("[data-import]", sheet).addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (!Array.isArray(data.tasks)) throw new Error("bad");
        state = { ...blankState(), ...data };
        save();
        closeSheet();
        for (const s of SCOPES) { cards[s].clear(); $("[data-list]", pages[s]).innerHTML = ""; }
        renderAll();
        toast(`Restored ${state.tasks.length} tasks`);
      } catch {
        toast("That file isn't a Cadence backup.");
      }
    });
  });
}

/* ---------- History (past tasks) ---------- */
function openHistory() {
  const evs = completionEvents();
  const today = startOf("day", now());
  const byDay = new Map();
  for (const ev of evs) {
    const k = keyOf(new Date(ev.at));
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k).push(ev);
  }
  // Stats
  let best = null;
  for (const [k, list] of byDay) if (!best || list.length > best.n) best = { k, n: list.length };
  let streak = 0;
  for (let d = byDay.has(keyOf(today)) ? today : addDays(today, -1); byDay.has(keyOf(d)); d = addDays(d, -1)) streak++;
  const weekN = doneSince(startOf("week", now()));

  // Calendar grid: last 18 weeks, one column per week
  const WEEKS = 18;
  const gridStart = addDays(startOf("week", now()), -7 * (WEEKS - 1));
  const level = (n) => (n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : 4);
  let cells = "", months = "";
  for (let w = 0; w < WEEKS; w++) {
    const colStart = addDays(gridStart, w * 7);
    // Label a column when a month starts in it.
    const first = [0, 1, 2, 3, 4, 5, 6].map((d) => addDays(colStart, d)).find((d) => d.getDate() === 1);
    months += `<span style="grid-column:${w + 1}">${first ? first.toLocaleDateString(undefined, { month: "short" }) : ""}</span>`;
    for (let d = 0; d < 7; d++) {
      const day = addDays(colStart, d), k = keyOf(day);
      if (day > today) { cells += `<i class="hm-cell future" style="grid-column:${w + 1};grid-row:${d + 1}"></i>`; continue; }
      const n = (byDay.get(k) || []).length;
      cells += `<button class="hm-cell l${level(n)} ${k === keyOf(today) ? "today" : ""}" style="grid-column:${w + 1};grid-row:${d + 1}" data-day="${k}" aria-label="${dueLabel(k)}: ${n} done"></button>`;
    }
  }

  const dayTitle = (k) => k === keyOf(today) ? "Today" : k === keyOf(addDays(today, -1)) ? "Yesterday" : dueLabel(k);
  const kindLabel = (t) => t.sched ? schedLabel(t.sched) : t.repeats ? META[t.scope].cadence : META[t.scope].once;
  const days = [...byDay.keys()].sort().reverse();
  const group = (k) => {
    const list = byDay.get(k);
    return `<section class="tl-group" id="tl-${k}">
      <div class="tl-day"><b>${esc(dayTitle(k))}</b><span>${list.length} done</span><i class="tl-bar" style="width:${Math.min(100, list.length * 12)}%"></i></div>
      ${list.map((ev) => `<div class="tl-item" style="--hue:${HUES[ev.t.hue % HUES.length]};${scopeVars(ev.cad)}">
        <i class="tl-dot">${icon("check")}</i>
        <div class="tl-text"><div class="tl-title">${esc(ev.t.title)}</div><div class="tl-kind"><i class="dot"></i>${esc(kindLabel(ev.t))}</div></div>
        <time>${new Date(ev.at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</time>
      </div>`).join("")}
    </section>`;
  };
  let shown = 0;
  const PAGE = 21;

  openSheet(`
    ${sheetHead("Past tasks")}
    <div class="h-stats">
      <div class="h-stat" style="--col:#00F5A0"><b>${evs.length}</b><span>all time</span></div>
      <div class="h-stat" style="--col:${META.week.colors[0]}"><b>${weekN}</b><span>this week</span></div>
      <div class="h-stat" style="--col:#FF8A00"><b>${streak}</b><span>day streak</span></div>
      <div class="h-stat" style="--col:${META.year.colors[1]}"><b>${best ? best.n : 0}</b><span>best day</span>${best ? `<small>${esc(parseKey(best.k).toLocaleDateString(undefined, { month: "short", day: "numeric" }))}</small>` : ""}</div>
    </div>
    <div class="heatmap-wrap">
      <div class="hm-months" style="grid-template-columns:repeat(${WEEKS},1fr)">${months}</div>
      <div class="heatmap" style="grid-template-columns:repeat(${WEEKS},1fr)">${cells}</div>
      <div class="hm-legend"><span>Less</span><i class="hm-cell l0"></i><i class="hm-cell l1"></i><i class="hm-cell l2"></i><i class="hm-cell l3"></i><i class="hm-cell l4"></i><span>More</span></div>
    </div>
    <div class="timeline" data-timeline>${evs.length ? "" : `<div class="chart-empty">Nothing checked off yet. Finish a task and it shows up here.</div>`}</div>
    <button class="menu-item center" data-more hidden>Show earlier days</button>`, "day", (sheet) => {
    const tl = $("[data-timeline]", sheet), more = $("[data-more]", sheet);
    const showMore = (upTo) => {
      const next = Math.max(shown + PAGE, upTo || 0);
      tl.insertAdjacentHTML("beforeend", days.slice(shown, next).map(group).join(""));
      shown = Math.min(next, days.length);
      more.hidden = shown >= days.length;
    };
    showMore();
    more.onclick = () => showMore();
    sheet.addEventListener("click", (e) => {
      const c = e.target.closest("[data-day]");
      if (!c) return;
      Feel.tap();
      const k = c.dataset.day, i = days.indexOf(k);
      if (i < 0) { toast(`Nothing checked off on ${dueLabel(k)}`); return; }
      if (i >= shown) showMore(i + 1);
      const g = $(`#tl-${k}`, sheet);
      g.scrollIntoView({ behavior: "smooth", block: "start" });
      g.classList.remove("flash-row"); void g.offsetWidth; g.classList.add("flash-row");
    });
  });
}

/* ---------- Charts (SVG) ---------- */
function card(title, sub, ic, col, inner) {
  return `<div class="card"><div class="card-head" style="--col:${col}">${icon(ic)}<h2>${title}</h2>${sub ? `<small>${sub}</small>` : ""}</div>${inner}</div>`;
}

function renderCharts(s, p, pr) {
  const box = $("[data-charts]", pages[s]);
  const hist = history(s);
  const evs = completionEvents();
  const sig = JSON.stringify([s, p, keyOf(now()), pr, hist.map((h) => h.prog), s === "day" ? todayByHour() : null, evs.length, evs[0] && evs[0].at, SCOPES.map((x) => progress(x)), Math.round(elapsed(s) * 100)]);
  if (chartSig[s] === sig) return;
  chartSig[s] = sig;
  const m = META[s];
  if (s === "day") {
    const hours = todayByHour();
    box.innerHTML =
      card("Today's rhythm", "check-offs by hour", "pulse", m.colors[0], Object.keys(hours).length ? hourChart(hours) : `<div class="chart-empty">Your first check-off today lights this up.</div>`) +
      `<div class="row2">${card("Split", "", "pie", m.colors[1], donut(pr, s))}${card("Cadences", "", "rings", META.month.colors[0], cadenceBars())}</div>` +
      card("Last 7 days", "% of daily tasks done", "bars", m.colors[0], historyChart(s, hist));
  } else {
    const el = elapsed(s);
    const diff = Math.round((pr.frac - el) * 100);
    box.innerHTML =
      card("Pace", periodTitle(s, p), "speed", m.colors[0], `
        <div class="pace">${donut(pr, s)}
          <div class="pace-bars">
            ${paceRow("Time gone", el, "rgba(255,255,255,.35)")}
            ${paceRow("Done", pr.frac, `linear-gradient(90deg, ${m.colors[0]}, ${m.colors[1]})`)}
            <div class="pace-verdict" style="color:${diff >= 0 ? m.colors[0] : "rgba(255,255,255,.7)"}">${pr.total === 0 ? `${icon("info")}Nothing scheduled yet` : `${icon(diff >= 0 ? "hare" : "tortoise")}${diff >= 0 ? `${diff} points ahead of pace` : `${-diff} points behind pace`}`}</div>
          </div>
        </div>`) +
      card(s === "year" ? "This year, month by month" : `This ${m.unit}, day by day`, "tasks done", "bars", m.colors[1], stackedChart(`in-${s}`, insideBuckets(s), s === "month" ? 5 : 1)) +
      card(`Completed per ${m.unit}`, `last ${PER_COUNT[s]}`, "bars", m.colors[0], stackedChart(`per-${s}`, bucketsFor(s, PER_COUNT[s]), 1, true)) +
      card(`Last ${m.hist} ${m.unit}s`, "% of tasks done", "bars", m.colors[0], historyChart(s, hist));
  }
}

const PER_COUNT = { week: 12, month: 12, year: 5 };
const cadenceLegend = () => `<div class="legend-row">${SCOPES.map((x) => `<span style="${scopeVars(x)}"><i class="dot"></i>${META[x].cadence}</span>`).join("")}</div>`;

/** Bars stacked by cadence with the total on top. labelEvery thins x labels; avg draws an average line. */
function stackedChart(id, buckets, labelEvery = 1, avg = false) {
  const W = 320, H = 176, top = 20, bottom = 22, n = buckets.length;
  const slot = W / n, bw = Math.min(28, slot * 0.66);
  const max = Math.max(3, ...buckets.map((b) => b.total));
  const y = (v) => (v / max) * (H - top - bottom);
  const order = ["year", "month", "week", "day"]; // bottom to top
  let defs = "", out = "";
  const past = buckets.filter((b) => !b.future);
  if (avg && past.length > 1) {
    const a = past.reduce((n, b) => n + b.total, 0) / past.length;
    const ay = H - bottom - y(a);
    out += `<line x1="0" x2="${W}" y1="${ay}" y2="${ay}" stroke="rgba(255,255,255,.35)" stroke-dasharray="4 4"/>
      <text x="0" y="${ay - 5}" font-size="10">avg ${a < 10 ? a.toFixed(1) : Math.round(a)}</text>`;
  }
  buckets.forEach((b, i) => {
    const x = i * slot + (slot - bw) / 2, h = y(b.total);
    if (b.total) {
      defs += `<clipPath id="${id}-c${i}"><rect x="${x}" y="${H - bottom - h}" width="${bw}" height="${h}" rx="${Math.min(7, bw / 2)}"/></clipPath>`;
      let yy = H - bottom, segs = "";
      for (const c of order) {
        if (!b.by[c]) continue;
        const sh = y(b.by[c]);
        yy -= sh;
        segs += `<rect x="${x}" y="${yy}" width="${bw}" height="${sh}" fill="url(#${id}-g-${c})"/>`;
      }
      out += `<g class="grow" style="animation-delay:${Math.min(i * 30, 600)}ms" clip-path="url(#${id}-c${i})" opacity="${b.cur || !buckets.some((x) => x.cur) ? 1 : 0.8}">${segs}</g>`;
      out += `<text class="${b.cur ? "val" : ""} fade-in" x="${x + bw / 2}" y="${H - bottom - h - 5}" font-size="${n > 20 ? 8 : 11}" text-anchor="middle">${b.total}</text>`;
    } else if (!b.future) {
      out += `<rect x="${x}" y="${H - bottom - 2}" width="${bw}" height="2" rx="1" fill="rgba(255,255,255,.18)"/>`;
    }
    if (b.cur) out += `<rect x="${x - 2}" y="${top - 6}" width="${bw + 4}" height="${H - top - bottom + 6}" rx="8" fill="none" stroke="rgba(255,255,255,.22)" stroke-dasharray="3 3"/>`;
    if (i % labelEvery === 0 || i === n - 1 || b.cur) out += `<text class="${b.cur ? "val" : ""}" x="${x + bw / 2}" y="${H - 5}" font-size="${n > 20 ? 9 : 11}" text-anchor="middle">${esc(b.label)}</text>`;
  });
  for (const c of SCOPES) defs += `<linearGradient id="${id}-g-${c}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${META[c].colors[0]}"/><stop offset="1" stop-color="${META[c].colors[1]}"/></linearGradient>`;
  const total = buckets.reduce((n, b) => n + b.total, 0);
  if (!total) return `<div class="chart-empty">Nothing checked off yet. Finished tasks stack up here.</div>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${out}</svg>${cadenceLegend()}`;
}

function paceRow(label, v, fill) {
  return `<div class="pace-row"><div class="top"><span>${label}</span><b>${Math.round(v * 100)}%</b></div><div class="pace-track"><div class="pace-fill" style="width:${Math.max(4, v * 100)}%;background:${fill}"></div></div></div>`;
}

function donut(pr, s) {
  const r = 40, c = 2 * Math.PI * r, f = pr.total ? pr.done / pr.total : 0;
  return `<div class="donut-wrap"><svg viewBox="0 0 100 100">
      <defs><linearGradient id="dg-${s}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${META[s].colors[0]}"/><stop offset="1" stop-color="${META[s].colors[1]}"/></linearGradient></defs>
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="14"/>
      <circle class="donut-arc" cx="50" cy="50" r="${r}" fill="none" stroke="url(#dg-${s})" stroke-width="14" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - f)}" transform="rotate(-90 50 50)" opacity="${f > 0 ? 1 : 0}"/>
    </svg><div class="center"><b>${pr.done}</b><span>of ${pr.total}</span></div></div>`;
}

function cadenceBars() {
  return `<div class="cad-bars">${SCOPES.map((x) => {
    const f = progress(x).frac;
    return `<div class="cad-bar" style="${scopeVars(x)}"><div class="cad-track"><div class="cad-fill" style="height:${Math.max(8, f * 100)}%"></div></div><small>${META[x].tab[0]}</small></div>`;
  }).join("")}</div>`;
}

function historyChart(s, pts) {
  const W = 320, H = 150, top = 18, bottom = 22, n = pts.length;
  const slot = W / n, bw = Math.min(26, slot * 0.62);
  const [a, b] = META[s].colors;
  let bars = "";
  pts.forEach((pt, i) => {
    const x = i * slot + (slot - bw) / 2;
    const f = pt.prog.total ? pt.prog.frac : 0;
    const h = Math.max(pt.prog.total ? 4 : 2, f * (H - top - bottom));
    const y = H - bottom - h;
    bars += `<rect class="grow" style="animation-delay:${i * 40}ms" x="${x}" y="${y}" width="${bw}" height="${h}" rx="${Math.min(7, bw / 2)}" fill="url(#hg-${s}${pt.cur ? "" : "-dim"})"/>`;
    if (pt.prog.total) bars += `<text class="${pt.cur ? "val" : ""} fade-in" x="${x + bw / 2}" y="${y - 5}" font-size="10" text-anchor="middle">${Math.round(f * 100)}</text>`;
    bars += `<text x="${x + bw / 2}" y="${H - 5}" font-size="11" text-anchor="middle">${pt.cur ? "Now" : esc(shortLabel(s, pt.p))}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="hg-${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
      <linearGradient id="hg-${s}-dim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}" stop-opacity=".45"/><stop offset="1" stop-color="${b}" stop-opacity=".3"/></linearGradient>
    </defs>${bars}</svg>`;
}

function hourChart(hours) {
  const W = 320, H = 160, top = 10, bottom = 22, left = 4, right = 22;
  const hs = Object.keys(hours).map(Number);
  const nowH = now().getHours();
  const first = Math.min(8, ...hs) - 1, last = Math.max(20, nowH, ...hs) + 1;
  const span = last - first;
  const x = (h) => left + ((h - first) / span) * (W - left - right);
  const max = Math.max(2, ...hs.map((h) => SCOPES.reduce((n, s) => n + hours[h][s], 0)));
  const yScale = (H - top - bottom) / max;
  let out = "";
  for (let g = 1; g <= max; g++) if (g === max || g === Math.round(max / 2)) {
    const y = H - bottom - g * yScale;
    out += `<line x1="${left}" x2="${W - right}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,.08)"/><text x="${W - right + 4}" y="${y + 4}" font-size="10">${g}</text>`;
  }
  const nx = x(nowH + now().getMinutes() / 60);
  out += `<line x1="${nx}" x2="${nx}" y1="${top}" y2="${H - bottom}" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 3"/>`;
  hs.forEach((h, i) => {
    let y = H - bottom;
    for (const s of SCOPES) {
      const n = hours[h][s];
      if (!n) continue;
      const hh = n * yScale;
      y -= hh;
      out += `<rect class="grow" style="animation-delay:${i * 50}ms" x="${x(h) + 0.5 - 5}" y="${y}" width="10" height="${hh - 1}" rx="4" fill="${META[s].colors[0]}"/>`;
    }
  });
  for (let h = Math.ceil(first / 4) * 4; h <= last; h += 4) {
    if (h < 0 || h > 23) continue;
    out += `<text x="${x(h)}" y="${H - 5}" font-size="11" text-anchor="middle">${hourLabel(h)}</text>`;
  }
  const legend = `<div class="legend-row">${SCOPES.map((s) => `<span style="${scopeVars(s)}"><i class="dot"></i>${META[s].tab}</span>`).join("")}</div>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${out}</svg>${legend}`;
}


/* ---------- Boot ---------- */
function boot() {
  buildPages();
  setScopeColors(selected);
  renderAll();
  requestAnimationFrame(updateTabs);

  pages.day.querySelector("[data-settings]").addEventListener("click", () => { Feel.tap(); openSettings(); });

  // Another tab or window changed the data: pick it up.
  addEventListener("storage", (e) => {
    if (e.key !== STORE_KEY || user) return;
    state = load();
    renderAll();
  });

  // Roll over to a new day/week/month/year while the app stays open.
  let lastDay = keyOf(now());
  const refresh = () => {
    const d = keyOf(now());
    if (d !== lastDay) lastDay = d;
    renderAll();
  };
  setInterval(refresh, 30000);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    let raw = null;
    try { raw = localStorage.getItem(STORE_KEY); } catch {}
    if (!user && raw && raw !== JSON.stringify(state)) state = load();
    refresh();
  });

  if (window.CadenceCloud) startCloud();
  else addEventListener("cloud-ready", startCloud, { once: true });
  addEventListener("cloud-auth-error", (e) => { if (!user) openAuth(authMessage(e.detail)); });

  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}
boot();
