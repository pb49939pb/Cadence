// Firebase: sign-in and Firestore sync. Exposes window.CadenceCloud for app.js.
// The web config below is meant to be public; access is controlled by Firestore rules (firestore.rules).
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection, doc, onSnapshot, writeBatch, getDocs, getDocsFromServer, getDocFromServer, setDoc,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// On Firebase Hosting, sign-in runs on the same domain as the app, which iPhone Safari needs for redirects.
// (also the custom domain patrickbald.win, which points at the same Firebase Hosting site)
const onFirebaseHosting = /(\.web\.app|\.firebaseapp\.com|(^|\.)patrickbald\.win)$/.test(location.hostname);

const app = initializeApp({
  apiKey: "AIzaSyBAP3xb635f-N567ABep2RmziXoF-pj-QY",
  authDomain: onFirebaseHosting ? location.hostname : "pat-dashboard-eb494.firebaseapp.com",
  projectId: "pat-dashboard-eb494",
  storageBucket: "pat-dashboard-eb494.firebasestorage.app",
  messagingSenderId: "240315603553",
  appId: "1:240315603553:web:04cef610f10a5b55366820",
});

const auth = getAuth(app);
let db;
try {
  db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
} catch {
  db = initializeFirestore(app, {}); // no IndexedDB (e.g. private browsing): memory cache only
}

const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
// One Firebase project serves several personal apps: every app keeps its data under apps/{app}/users/{uid}.
const APP = "cadence";
const base = (uid) => ["apps", APP, "users", uid];
const tasksCol = (uid, space) => collection(db, ...base(uid), space === "work" ? "workTasks" : "tasks");
const settingsDoc = (uid) => doc(db, ...base(uid), "meta", "settings");
const summaryDoc = (uid) => doc(db, ...base(uid), "meta", "summary"); // read by the dashboard at /

/** Run set/delete operations in batches of 450 and wait for the server. */
function runBatches(ops) {
  const commits = [];
  for (let i = 0; i < ops.length; i += 450) {
    const b = writeBatch(db);
    ops.slice(i, i + 450).forEach((op) => op(b));
    commits.push(b.commit());
  }
  return Promise.all(commits);
}

window.CadenceCloud = {
  onUser: (cb) => onAuthStateChanged(auth, cb),
  google() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    // A Home Screen app can't use popups; a redirect only works when sign-in shares the app's domain.
    return standalone && onFirebaseHosting ? signInWithRedirect(auth, provider) : signInWithPopup(auth, provider);
  },
  emailSignIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
  emailSignUp: (email, password) => createUserWithEmailAndPassword(auth, email, password),
  resetPassword: (email) => sendPasswordResetEmail(auth, email),
  signOut: () => signOut(auth),

  watchTasks: (uid, space, next, error) =>
    onSnapshot(tasksCol(uid, space), (snap) => next(snap.docs.map((d) => d.data()), snap.metadata), error),
  watchSettings: (uid, next) =>
    onSnapshot(settingsDoc(uid), (snap) => next(snap.exists() ? snap.data() : null), () => {}),
  fetchTasks: async (uid, space) => (await getDocs(tasksCol(uid, space))).docs.map((d) => d.data()),

  /** Write changed tasks, delete removed ones, optionally replace settings. Batches of up to 450. */
  async commit(uid, space, sets, deletes, settings) {
    const ops = [
      ...sets.map((t) => (b) => b.set(doc(tasksCol(uid, space), t.id), t)),
      ...deletes.map((id) => (b) => b.delete(doc(tasksCol(uid, space), id))),
      ...(settings ? [(b) => b.set(settingsDoc(uid), settings)] : []),
    ];
    return runBatches(ops);
  },

  /** Short status for the dashboard, one entry per list (personal / work). */
  writeSummary: (uid, space, data) => setDoc(summaryDoc(uid), { [space]: data, updatedAt: Date.now() }, { merge: true }),

  /**
   * One-time move from the original layout (users/{uid}/tasks, workTasks, meta/settings) to apps/cadence/....
   * Reads from the server only, copies, confirms every copied doc is there, then deletes the originals.
   * Safe to run on every sign-in: once the old docs are gone it does nothing. Returns how many tasks moved.
   */
  async migrateLegacy(uid) {
    let moved = 0;
    for (const name of ["tasks", "workTasks"]) {
      const old = await getDocsFromServer(collection(db, "users", uid, name));
      if (old.empty) continue;
      const dest = collection(db, ...base(uid), name);
      await runBatches(old.docs.map((d) => (b) => b.set(doc(dest, d.id), d.data())));
      const now = await getDocsFromServer(dest);
      const have = new Set(now.docs.map((d) => d.id));
      if (!old.docs.every((d) => have.has(d.id))) throw new Error("Copy incomplete; originals kept");
      await runBatches(old.docs.map((d) => (b) => b.delete(d.ref)));
      moved += old.size;
    }
    const oldSettings = await getDocFromServer(doc(db, "users", uid, "meta", "settings"));
    if (oldSettings.exists()) {
      const cur = await getDocFromServer(settingsDoc(uid));
      if (!cur.exists()) await setDoc(settingsDoc(uid), oldSettings.data());
      await runBatches([(b) => b.delete(oldSettings.ref)]);
    }
    return moved;
  },
};

getRedirectResult(auth).catch((e) => dispatchEvent(new CustomEvent("cloud-auth-error", { detail: e })));
dispatchEvent(new Event("cloud-ready"));
