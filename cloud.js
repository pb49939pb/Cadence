// Firebase: sign-in and Firestore sync. Exposes window.CadenceCloud for app.js.
// The web config below is meant to be public; access is controlled by Firestore rules (firestore.rules).
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection, doc, onSnapshot, writeBatch, getDocs,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// On Firebase Hosting, sign-in runs on the same domain as the app, which iPhone Safari needs for redirects.
const onFirebaseHosting = /\.(web\.app|firebaseapp\.com)$/.test(location.hostname);

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
// Personal tasks keep the original path; Work tasks live alongside in their own collection.
const tasksCol = (uid, space) => collection(db, "users", uid, space === "work" ? "workTasks" : "tasks");
const settingsDoc = (uid) => doc(db, "users", uid, "meta", "settings");

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
    const commits = [];
    for (let i = 0; i < ops.length; i += 450) {
      const b = writeBatch(db);
      ops.slice(i, i + 450).forEach((op) => op(b));
      commits.push(b.commit());
    }
    return Promise.all(commits);
  },
};

getRedirectResult(auth).catch((e) => dispatchEvent(new CustomEvent("cloud-auth-error", { detail: e })));
dispatchEvent(new Event("cloud-ready"));
