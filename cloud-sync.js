/* ════════ PONT CLOUD (Firebase) ════════
   Sauvegarde et synchronisation multi-appareils. La config ci-dessous n'est
   pas un secret : c'est un identifiant public, la sécurité repose sur les
   règles Firestore (firestore.rules) + l'authentification. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, onSnapshot, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAkSPWQd-QgpjAYVdfoZ0ot4Q1rYN6Q0nQ",
  authDomain: "appli-sport-4c094.firebaseapp.com",
  projectId: "appli-sport-4c094",
  storageBucket: "appli-sport-4c094.firebasestorage.app",
  messagingSenderId: "173689511100",
  appId: "1:173689511100:web:21e43450dc92686fe384b9"
};

if (firebaseConfig.apiKey === "REMPLACER") {
  console.warn("[Cloud] firebaseConfig non renseignée — synchro cloud désactivée (app 100% fonctionnelle en local).");
  window.Cloud = {
    signIn(){ alert("⚠️ Synchro cloud non configurée.\nColle ta config Firebase dans cloud-sync.js (objet firebaseConfig)."); },
    signOut(){}, push(){}, deleteRemote(){ return Promise.resolve(); }, isSignedIn(){ return false; }
  };
} else {
  const app  = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  // Cache persistant = données conservées hors-ligne.
  const db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
  const provider = new GoogleAuthProvider();

  const notify = (u, s) => { try { window.__onAuthChange && window.__onAuthChange(u, s); } catch(e){} };
  const ref = () => doc(db, 'users', uid);

  let uid = null, unsub = null, first = true, pushTimer = null;

  getRedirectResult(auth).catch(()=>{});

  async function doSignIn(){
    try { await signInWithPopup(auth, provider); }
    catch(e){
      const code = (e && (e.code || e.message)) || '';
      if (/popup|blocked|cancelled|operation-not-supported/i.test(code)) {
        try { await signInWithRedirect(auth, provider); }   // repli mobile si popup bloqué
        catch(_){ notify(auth.currentUser, 'error'); }
      } else { notify(auth.currentUser, 'error'); }
    }
  }

  function pushNow(data){
    if (!uid) return;
    notify(auth.currentUser, 'saving');
    const u = auth.currentUser;
    setDoc(ref(), { payloadJSON: JSON.stringify(data), by: (data && data.name) || 'ATHLETE', email: (u && u.email) || null, photoURL: (u && u.photoURL) || null, updatedAt: serverTimestamp() })
      .then(()  => notify(auth.currentUser, 'synced'))
      .catch(() => notify(auth.currentUser, 'error'));
  }

  onAuthStateChanged(auth, (user) => {
    if (unsub) { unsub(); unsub = null; }
    if (!user) { uid = null; first = true; notify(null, 'offline'); return; }
    uid = user.uid; first = true; notify(user, 'saving');
    unsub = onSnapshot(ref(), (snap) => {
      if (snap.metadata.hasPendingWrites) return;             // ignore l'écho de nos écritures
      if (!snap.exists()) {                                   // cloud vide → migration montante
        if (first) { first = false; pushNow(window.__getLocalData ? window.__getLocalData() : {}); }
        return;
      }
      const _d = snap.data();
      try { if (_d.updatedAt && window.__onSyncMeta) window.__onSyncMeta(_d.by || '', _d.updatedAt.toDate ? _d.updatedAt.toDate().getTime() : Date.now()); } catch(_){}
      let cloud = null;
      try { cloud = JSON.parse(_d.payloadJSON); } catch(_){}
      if (!cloud) { notify(user, 'synced'); return; }
      if (first) {                                            // 1re connexion : fusion sûre
        first = false;
        const merged = window.__mergeData ? window.__mergeData(cloud) : cloud;
        window.__applyCloudData && window.__applyCloudData(merged);
        if (JSON.stringify(merged) !== JSON.stringify(cloud)) pushNow(merged);
        else notify(user, 'synced');
        return;
      }
      window.__applyCloudData && window.__applyCloudData(cloud);   // maj d'un autre appareil
      notify(user, 'synced');
    }, () => notify(auth.currentUser, 'error'));
  });

  // API exposée à l'app. push = setDoc débouncé.
  window.Cloud = {
    signIn: doSignIn,
    signOut: () => signOut(auth),
    push: (data) => { if (!uid) return; clearTimeout(pushTimer); pushTimer = setTimeout(() => pushNow(data || (window.__getLocalData && window.__getLocalData())), 1200); },
    deleteRemote: () => { if (!uid) return Promise.resolve(); return deleteDoc(ref()).catch(()=>{}); },
    isSignedIn: () => !!uid
  };
}
