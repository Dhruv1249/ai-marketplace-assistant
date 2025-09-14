   'use client';
import React, { useEffect, useRef, useState } from "react";
import { auth, db } from "@/app/login/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Trash2, Pencil, LogOut } from 'lucide-react';
import News from "./News";
async function getAISuggestion(reviewText) {
  return "Thank you for your feedback! We're glad you enjoyed our product.";
}
export default function Dashboard() {
  // ----- state (unchanged) -----
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const dashboardSectionRef = useRef(null);
  const dashboardRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [productStats, setProductStats] = useState({ created: 0, bought: 0 });
  const [createdProducts, setCreatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [aiSuggestions, setAISuggestions] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);

  // === Product Editing State ===
  const [editingProductId, setEditingProductId] = useState(null);
  const [productEditData, setProductEditData] = useState({});
  const [productModalOpen, setProductModalOpen] = useState(false);

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  // Section nav state for enabling all nav links
  const [activeSection, setActiveSection] = useState('overview');

  // Show right-side news panel on the overview (frontpage) by default
  const showNewsAside = activeSection === 'overview';

  // Theme state: 'light' (default) or 'dark'
  const [theme, setTheme] = useState('light');

  const fileInputRef = useRef();
  const avatarMenuRef = useRef();

  // Settings panel state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openProductMenuId, setOpenProductMenuId] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [expandedDesc, setExpandedDesc] = useState({});

  // full-screen was removed but JSX referenced it – keep false to avoid errors
  const fullScreen = false;

  // ----- helpers (unchanged) -----
 const fetchDashboardData = async (u) => {
    if (!u) return;

    // Load profile
    const profileRef = doc(db, "users", u.uid);
    const snap = await getDoc(profileRef);
    const profileData = snap.exists() ? snap.data() : {};
    setProfile(profileData);
    setEditData(profileData);

    // Load created products with robust owner detection
    const productsCol = collection(db, "products");
    const ownerRef = doc(db, "users", u.uid);

    // Try common owner fields: ownerId, sellerId, artisanId, createdBy.uid, ownerRef
    const productQueries = [
      query(productsCol, where("ownerId", "==", u.uid)),
      query(productsCol, where("sellerId", "==", u.uid)),
      query(productsCol, where("artisanId", "==", u.uid)),
      query(productsCol, where("createdBy.uid", "==", u.uid)),
      query(productsCol, where("ownerRef", "==", ownerRef)),
    ];

    const results = await Promise.allSettled(productQueries.map((q) => getDocs(q)));
    const seen = new Set();
    const createdList = [];
    for (const res of results) {
      if (res.status === "fulfilled") {
        for (const d of res.value.docs) {
          if (!seen.has(d.id)) {
            seen.add(d.id);
            createdList.push({ id: d.id, ...d.data() });
          }
        }
      } else if (process.env.NODE_ENV !== "production") {
        console.warn("Product query failed:", res.reason?.message || res.reason);
      }
    }
    setCreatedProducts(createdList);

    // Load bought stats
    const boughtSnap = await getDocs(
      query(collection(db, "orders"), where("buyerId", "==", u.uid))
    );

    setProductStats({
      created: createdList.length,
      bought: boughtSnap.size,
    });

    // Load reviews for this artisan/seller
    const reviewSnap = await getDocs(
      query(collection(db, "reviews"), where("artisanId", "==", u.uid))
    );
    const reviewsList = reviewSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setReviews(reviewsList);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchDashboardData(u);
      } else {
        setProfile(null);
        setEditData({});
        setProductStats({ created: 0, bought: 0 });
        setReviews([]);
      }
    });
    return unsub;
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!avatarMenuOpen) return;
    const handleClick = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setAvatarMenuOpen(false);
        setAvatarError(null);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setAvatarMenuOpen(false);
        setAvatarError(null);
      }
    };
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [avatarMenuOpen]);

  // GSAP animations on section change / mount (safe dynamic import)
  useEffect(() => {
    let ctx;
    (async () => {
      try {
        const gsap = (await import('gsap')).default;
        if (!dashboardSectionRef.current) return;
        ctx = gsap.context(() => {
          const children = Array.from(dashboardSectionRef.current.children || []);
          gsap.from(children, {
            opacity: 0,
            y: 18,
            duration: 0.5,
            stagger: 0.06,
            ease: 'power2.out',
            clearProps: 'transform,opacity'
          });
        }, dashboardSectionRef);
      } catch (e) {
        // If gsap is not available, silently skip animations
      }
    })();
    return () => {
      if (ctx) ctx.revert();
    };
  }, [activeSection]);

  // ----- handlers (unchanged) -----
  const handleEdit = () => {
    setEditData(profile || {});
    setEditing(true);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);
    if (!user || !user.uid) {
      setSaveError("No logged in user found!");
      setSaveLoading(false);
      return;
    }
    setSaveLoading(true);
    try {
      const profileRef = doc(db, "users", user.uid);
      await updateDoc(profileRef, {
        displayName: editData.displayName ?? "",
        businessName: editData.businessName ?? "",
        businessDesc: editData.businessDesc ?? "",
      });
      await fetchDashboardData(user);
      setEditing(false);
    } catch (err) {
      if (
        err.code === "not-found" ||
        (typeof err.message === "string" && err.message.includes("No document to update"))
      ) {
        try {
          const profileRef = doc(db, "users", user.uid);
          await setDoc(
            profileRef,
            {
              displayName: editData.displayName ?? "",
              businessName: editData.businessName ?? "",
              businessDesc: editData.businessDesc ?? "",
            },
            { merge: true }
          );
          await fetchDashboardData(user);
          setEditing(false);
        } catch (setErr) {
          setSaveError(
            "Could not create profile document. Error: " +
              (setErr?.message || JSON.stringify(setErr))
          );
        }
      } else {
        setSaveError("Could not save profile. Error: " + (err?.message || JSON.stringify(err)));
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAvatarButtonClick = () => {
    setAvatarMenuOpen((v) => !v);
    setAvatarError(null);
  };

  const handleRemoveAvatar = async () => {
    setAvatarError(null);
    setAvatarLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid), { photoURL: "" }, { merge: true });
      await fetchDashboardData(user);
      setAvatarMenuOpen(false);
    } catch (err) {
      setAvatarError("Failed to remove avatar: " + (err?.message || JSON.stringify(err)));
    }
    setAvatarLoading(false);
  };

  const handleChangeAvatar = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // reset
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    setAvatarError(null);
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select a valid image file.");
      return;
    }
    setAvatarLoading(true);
    const fakeUrl = URL.createObjectURL(file);
    try {
      await setDoc(doc(db, "users", user.uid), { photoURL: fakeUrl }, { merge: true });
      await fetchDashboardData(user);
      setAvatarMenuOpen(false);
    } catch (err) {
      setAvatarError("Failed to update avatar: " + (err?.message || JSON.stringify(err)));
    }
    setAvatarLoading(false);
  };

  const handleAISuggest = async (reviewId, reviewText) => {
    setAISuggestions((prev) => ({ ...prev, [reviewId]: "Generating..." }));
    const resp = await getAISuggestion(reviewText);
    setAISuggestions((prev) => ({ ...prev, [reviewId]: resp }));
  };

  // New: open edit modal for a product
  const openEditProduct = (prod) => {
    setEditingProductId(prod.id);
    setProductEditData({
      name: prod.name || prod.title || '',
      title: prod.title || prod.name || '',
      description: prod.description || '',
      metaDescription: prod.metaDescription || '',
      price: prod.price ?? '',
      imageUrl: prod.imageUrl || '',
      images: Array.isArray(prod.images) ? prod.images : (prod.images || ''),
      category: prod.category || '',
      tags: Array.isArray(prod.tags) ? prod.tags : (prod.tags || ''),
      benefits: prod.benefits || '',
      features: Array.isArray(prod.features) ? prod.features : (prod.features || ''),
      featureExplanations: prod.featureExplanations || {},
      specifications: prod.specifications ? (typeof prod.specifications === 'string' ? prod.specifications : JSON.stringify(prod.specifications, null, 2)) : '{}',
    });
    setProductModalOpen(true);
  };

  // New: delete product handler (Firestore + file-based assets)
  const handleDeleteProduct = async (productId) => {
    const confirmDelete = window.confirm('Delete this product permanently? This will remove it from your dashboard and marketplace.');
    if (!confirmDelete) return;
    try {
      setDeletingProductId(productId);
      // Delete from Firestore (main doc)
      await deleteDoc(doc(db, 'products', productId));
      // Best-effort: delete marketplace mirror if it exists
      try { await deleteDoc(doc(db, 'marketplace', productId)); } catch {}
      // Delete file-based assets via API (best-effort)
      try { await fetch(`/api/products/${productId}`, { method: 'DELETE' }); } catch {}
      // Refresh dashboard data
      await fetchDashboardData(user);
      setOpenProductMenuId(null);
    } catch (err) {
      alert('Failed to delete product: ' + (err?.message || JSON.stringify(err)));
    } finally {
      setDeletingProductId(null);
    }
  };

  // ----- render -----
  if (!user) return null;

  const photoURL = profile?.photoURL || user.photoURL || "";

  return (
    <div
      ref={dashboardRef}
      className={`min-h-screen w-full flex ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`}
      style={theme === 'dark'
        ? { minHeight: '100vh', backgroundColor: '#111', color: '#fff' }
        : { minHeight: '100vh', backgroundColor: '#fff', color: '#1a202c' }
      }
    >
      {/* Sidebar (static nav like YouTube Studio) */}
      <aside className={`hidden md:flex md:w-64 border-r flex-col py-6 ${theme === 'dark' ? 'bg-black border-gray-800' : 'bg-white border-gray-200'}`}>
        <h1 className={`px-6 text-lg font-semibold tracking-wide mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Dashboard
        </h1>
        <nav className="px-2 text-sm space-y-1">
          <button
            className={`block w-full text-left px-4 py-2 rounded-lg transition font-semibold ${activeSection === 'overview' ? (theme === 'dark' ? 'bg-gray-800 text-blue-300' : 'bg-gray-100 text-blue-700') : (theme === 'dark' ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900')}`}
            onClick={() => setActiveSection('overview')}
            type="button"
          >Overview</button>
          <button
            className={`block w-full text-left px-4 py-2 rounded-lg transition font-semibold ${activeSection === 'profile' ? (theme === 'dark' ? 'bg-gray-800 text-blue-300' : 'bg-gray-100 text-blue-700') : (theme === 'dark' ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900')}`}
            onClick={() => setActiveSection('profile')}
            type="button"
          >Profile</button>
          <button
            className={`block w-full text-left px-4 py-2 rounded-lg transition font-semibold ${activeSection === 'products' ? (theme === 'dark' ? 'bg-gray-800 text-blue-300' : 'bg-gray-100 text-blue-700') : (theme === 'dark' ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900')}`}
            onClick={() => setActiveSection('products')}
            type="button"
          >Products</button>
          <button
            className={`block w-full text-left px-4 py-2 rounded-lg transition font-semibold ${activeSection === 'reviews' ? (theme === 'dark' ? 'bg-gray-800 text-blue-300' : 'bg-gray-100 text-blue-700') : (theme === 'dark' ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900')}`}
            onClick={() => setActiveSection('reviews')}
            type="button"
          >Reviews</button>
          <button
            className={`block w-full text-left px-4 py-2 rounded-lg transition font-semibold ${activeSection === 'news' ? (theme === 'dark' ? 'bg-gray-800 text-blue-300' : 'bg-gray-100 text-blue-700') : (theme === 'dark' ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900')}`}
            onClick={() => setActiveSection('news')}
            type="button"
          >Latest News</button>
          {/* Settings nav item */}
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            className={`w-full text-left block px-4 py-2 rounded-lg mt-3 font-semibold ${theme === 'dark' ? 'text-blue-300 hover:bg-gray-800' : 'text-blue-700 hover:bg-gray-100'}`}
            aria-expanded={settingsOpen}
          >
            Settings
          </button>
        </nav>
        {/* Settings Modal */}
        {settingsOpen && (
          <div>
            {/* Modal Overlay */}
            <div
              className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
              style={{animation: 'fadeIn 0.18s'}}
              onClick={() => setSettingsOpen(false)}
            />
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center px-2 py-8`}
              aria-modal="true"
              role="dialog"
            >
              <div
                className={`relative w-full max-w-md rounded-2xl shadow-2xl border transition-all ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
                style={{animation: 'popModal 0.22s'}}
                onClick={e => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSettingsOpen(false)}
                  className={`absolute top-4 right-4 p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'} transition`}
                  aria-label="Close settings"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div className="px-7 py-8">
                  <div className={`mb-6 font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Settings</div>
                  {/* Actions Section */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
  <div
    onClick={async () => {
      if (typeof window !== 'undefined') {
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
        window.location.href = '/login';
      }
    }}
    style={{ display: 'flex', justifyContent: 'flex-start' }}
  >
    <Button variant="outline" size="sm" className="flex items-center gap-2">
      <LogOut size={16} />
      Logout
    </Button>
  </div>
  <div
    onClick={async () => {
      if (!user) return;
      const doit = window.confirm('Are you sure you want to remove your account and all associated data? This cannot be undone.');
      if (!doit) return;
      try {
        const userId = user.uid;
        await import('firebase/firestore').then(async firestore => {
          await firestore.deleteDoc(firestore.doc(db, "users", userId));
          const productsSnap = await firestore.getDocs(firestore.query(firestore.collection(db, "products"), firestore.where("ownerId", "==", userId)));
          await Promise.all(productsSnap.docs.map(d => firestore.deleteDoc(d.ref)));
          const ordersSnap = await firestore.getDocs(firestore.query(firestore.collection(db, "orders"), firestore.where("buyerId", "==", userId)));
          await Promise.all(ordersSnap.docs.map(d => firestore.deleteDoc(d.ref)));
          const reviewsSnap = await firestore.getDocs(firestore.query(firestore.collection(db, "reviews"), firestore.where("artisanId", "==", userId)));
          await Promise.all(reviewsSnap.docs.map(d => firestore.deleteDoc(d.ref)));
        });
        await import('firebase/auth').then(async authApi => {
          await authApi.deleteUser(auth.currentUser);
        });
        window.location.href = '/';
      } catch (err) {
        alert('Failed to remove account: ' + (err && err.message ? err.message : JSON.stringify(err)));
      }
    }}
    style={{ display: 'flex', justifyContent: 'flex-end' }}
  >
    <Button variant="outline" size="sm" className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50">
      <Trash2 size={16} />
      Delete Account
    </Button>
  </div>
</div>
                  </div>
                {/* Simple CSS for dialog fade/pop-in */}
                <style>{`
                  @keyframes fadeIn { from { opacity:0; } to {opacity:1;} }
                  @keyframes popModal {
                    0% { opacity:0; transform: scale(.96) translateY(32px); }
                    100% { opacity:1; transform: none; }
                  }
                `}</style>
              </div>
            </div>
          </div>
        )}
        
       <div className={`mt-auto px-6 pt-4 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
  © {new Date().getFullYear()}
</div>
      </aside>

      {/* Main + News content */}
      <main className={theme === 'dark' ? 'flex-1 bg-black flex flex-col' : 'flex-1 bg-white flex flex-col'}>
        {/* Top bar */}
        <div className={`sticky top-0 z-10 flex items-center justify-between md:justify-end px-4 sm:px-6 h-14 backdrop-blur border-b ${theme === 'dark' ? 'bg-black/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
          <div className={`md:hidden font-semibold ${theme === 'dark' ? 'text-white' : ''}`}>Dashboard</div>
                    <div className="ml-auto flex items-center gap-3">
            <span className={`text-sm hidden sm:block ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {user.email}
            </span>
            <div className={theme === 'dark' ? 'w-8 h-8 rounded-full overflow-hidden bg-gray-700' : 'w-8 h-8 rounded-full overflow-hidden bg-gray-200'}>
              {photoURL ? (
                <Image src={photoURL} alt="Profile" width={32} height={32} />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-xs ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page container */}
        <div className="flex flex-row w-full flex-1">
          <section
            ref={dashboardSectionRef}
            className={`px-20 sm:px-2 py-8 w-full ${showNewsAside ? '' : 'max-w-5xl mx-auto'} ${showNewsAside ? 'lg:pr-6 lg:-ml-2' : ''}`}
            style={{ flex: showNewsAside ? '3 1 0%' : '1 1 0%' }}
          >
          {/* Overview Section */}
  {activeSection === 'overview' && (
    <>
      <h2 className={`text-2xl font-bold mb-6 ml-2 sm:ml-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Dashboard</h2>
      {/* Profile card */}
      <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-10 mb-8`}>
        <div className="flex items-start gap-6">
          <div className="relative flex flex-col items-center">
            <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} w-24 h-24 rounded-full overflow-hidden mb-2`}>
              {photoURL ? (
                <Image src={photoURL} alt="Profile" width={96} height={96} />
              ) : (
                <div className={`flex items-center justify-center w-full h-full text-4xl ${theme === 'dark' ? 'text-blue-300' : 'text-blue-400'}`}>
                  {user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleAvatarButtonClick}
              className="mt-2 px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-full shadow transition-all focus:outline-none disabled:opacity-60"
              disabled={avatarLoading}
              tabIndex={0}
            >
              {avatarLoading ? "Updating..." : "Edit Avatar"}
            </button>
            {avatarMenuOpen && (
              <div
                ref={avatarMenuRef}
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 z-30 bg-[#fff7f7] rounded-lg shadow-xl border border-[#262626] py-2 flex flex-col items-stretch"
                tabIndex={-1}
              >
                <button
                  onClick={handleRemoveAvatar}
                  disabled={avatarLoading}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#d4cdcd] text-sm font-medium transition disabled:opacity-60"
                  type="button"
                >
                  Remove Profile
                </button>
                <button
                  onClick={handleChangeAvatar}
                  disabled={avatarLoading}
                  className="w-full px-4 py-2 text-left text-blue-300 hover:bg-[#dbdbdb] text-sm font-medium transition"
                  type="button"
                >
                  Change Profile
                </button>
                <button
                  onClick={() => setAvatarMenuOpen(false)}
                  className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#f0f0f0] text-sm font-medium transition"
                  type="button"
                >
                  Cancel
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={avatarLoading}
                />
                {avatarError && (
                  <div className="text-xs text-red-400 mt-2 px-2 text-center">
                    {avatarError}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {profile?.displayName || user.displayName || user.email}
            </div>
            <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>
              {profile?.businessName || profile?.shopName || "No business info yet"}
            </div>
            <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'} text-sm`}>Email: {user.email}</div>
            {profile?.businessDesc && (
              <div className={`mt-3 text-base font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>
                {profile.businessDesc}
              </div>
            )}
          </div>
        </div>
        {/* Edit Profile */}
        {!editing && (
          <div className="mt-6">
            <Button variant="outline" className={`${theme === 'dark' ? 'border-gray-500 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-100'}`} onClick={handleEdit}>
              Edit Profile/Shop Info
            </Button>
          </div>
        )}
        {editing && (
          <form onSubmit={handleEditSubmit} className={`mt-6 p-4 rounded-xl space-y-3 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Display Name</label>
              <input name="displayName" value={editData.displayName || ""} onChange={handleEditChange} className={`w-full rounded-lg px-3 py-2 outline-none focus:border-blue-400 ${theme === 'dark' ? 'bg-gray-900 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'} ${(fullScreen ? "text-lg py-3" : "")}`}/>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Business/Artisan Name</label>
              <input name="businessName" value={editData.businessName || ""} onChange={handleEditChange} className={`w-full rounded-lg px-3 py-2 outline-none focus:border-blue-400 ${theme === 'dark' ? 'bg-gray-900 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'} ${(fullScreen ? "text-lg py-3" : "")}`}/>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Business Description</label>
              <textarea name="businessDesc" value={editData.businessDesc || ""} onChange={handleEditChange} className={`w-full rounded-lg px-3 py-2 outline-none resize-y focus:border-blue-400 ${theme === 'dark' ? 'bg-gray-900 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'} ${(fullScreen ? "text-lg py-3 min-h-[80px]" : "")}`}/>
            </div>
            {saveError && <div className="text-red-400 text-sm">{saveError}</div>}
            <div className="flex gap-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={saveLoading}>{saveLoading ? "Saving..." : "Save"}</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)} type="button" disabled={saveLoading} className={`${theme === 'dark' ? 'border-gray-500 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-100'}`}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
        <div className={`p-5 border rounded-2xl text-center ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="text-3xl font-bold text-blue-400">{productStats.created}</div>
          <div className={theme === 'dark' ? 'text-gray-300 mt-1' : 'text-gray-700 mt-1'}>Products Created</div>
        </div>
        <div className={`p-5 border rounded-2xl text-center ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="text-3xl font-bold text-purple-400">{productStats.bought}</div>
          <div className={theme === 'dark' ? 'text-gray-300 mt-1' : 'text-gray-700 mt-1'}>Products Bought</div>
        </div>
      </div>
      {/* Products Created */}
      <div className="mb-8">
        <div className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Created Products</div>
        {createdProducts.length === 0 && (
          <div className="text-gray-400 italic">No products found.</div>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {createdProducts.map((prod) => (
            <div key={prod.id} className={`relative rounded-xl border transition shadow-sm flex flex-col gap-2 p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
              <button
                type="button"
                onClick={() => setOpenProductMenuId((prev) => prev === prod.id ? null : prod.id)}
                className={`absolute top-2 right-2 p-1.5 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
                aria-label="Product actions"
              >
                <MoreVertical size={18} color="#ffffff" />
              </button>
              {openProductMenuId === prod.id && (
                <div className={`absolute top-10 right-2 w-36 border rounded-md shadow-lg z-20 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <button
                    type="button"
                    onClick={() => { setOpenProductMenuId(null); openEditProduct(prod); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-50 text-gray-800'}`}
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(prod.id)}
                    disabled={deletingProductId === prod.id}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${theme === 'dark' ? 'hover:bg-gray-800 text-red-400' : 'hover:bg-gray-50 text-red-600'}`}
                  >
                    <Trash2 size={14} /> {deletingProductId === prod.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
              <>
                {prod.imageUrl && (
                  <img
                    src={prod.imageUrl}
                    alt={prod.name || "Product image"}
                    className="w-full h-40 object-cover rounded-lg mb-1"
                  />
                )}
                <div className={`font-semibold text-base truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {prod.name || prod.title || "(Unnamed Product)"}
                </div>
                {prod.description && (
                  <div className={theme === 'dark' ? 'text-gray-300 text-sm' : 'text-gray-700 text-sm'}>
                    {(
                      expandedDesc[prod.id] || String(prod.description).length <= 160
                    )
                      ? String(prod.description)
                      : String(prod.description).slice(0, 160) + '...'}
                    {String(prod.description).length > 160 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedDesc((prev) => ({ ...prev, [prod.id]: !prev[prod.id] }))
                        }
                        className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} ml-1 hover:underline text-xs`}
                      >
                        {expandedDesc[prod.id] ? 'Read less' : 'Read more'}
                      </button>
                    )}
                  </div>
                )}
                {typeof prod.price !== 'undefined' && (
                  <div className="font-semibold text-green-400 dark:text-green-400 text-green-600">Price: ₹{prod.price}</div>
                )}
                {prod.createdAt && (
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Created: {prod.createdAt.toDate?.().toLocaleString?.() || String(prod.createdAt)}
                  </div>
                )}
                <Button
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold mt-2"
                  onClick={() => {
                    setEditingProductId(prod.id);
                    setProductEditData({
                      name: prod.name || prod.title || '',
                      title: prod.title || prod.name || '',
                      description: prod.description || '',
                      metaDescription: prod.metaDescription || '',
                      price: prod.price ?? '',
                      imageUrl: prod.imageUrl || '',
                      images: Array.isArray(prod.images) ? prod.images : (prod.images || ''),
                      category: prod.category || '',
                      tags: Array.isArray(prod.tags) ? prod.tags : (prod.tags || ''),
                      benefits: prod.benefits || '',
                      features: Array.isArray(prod.features) ? prod.features : (prod.features || ''),
                      featureExplanations: prod.featureExplanations || {},
                      specifications: prod.specifications ? (typeof prod.specifications === 'string' ? prod.specifications : JSON.stringify(prod.specifications, null, 2)) : '{}',
                    });
                    setProductModalOpen(true);
                  }}
                >
                  Edit
                </Button>
              </>
            </div>
          ))}
        </div>
      </div>

      {productModalOpen && (
        <div>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            style={{ animation: 'fadeIn 0.18s' }}
            onClick={() => setProductModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-2 py-8" role="dialog" aria-modal="true">
            <div
              className={`relative w-full max-w-3xl rounded-2xl shadow-2xl border transition-all ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} max-h-[90vh] overflow-y-auto overscroll-contain`}
              style={{ animation: 'popModal 0.22s' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setProductModalOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'} transition`}
                aria-label="Close edit modal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <div className="px-7 py-6">
                <div className={`mb-5 font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Product</div>
                <form
               onSubmit={async (e) => {
  e.preventDefault();
  setSaveError(null);
  setSaveLoading(true);
  try {
    const prodRef = doc(db, 'products', editingProductId);

    // Normalize incoming form data
    let features = productEditData.features || [];
    if (typeof features === 'string') {
      features = features.split(',').map((s) => s.trim()).filter(Boolean);
    }
    let featureExplanationsObj = {};
    if (productEditData.featureExplanations && typeof productEditData.featureExplanations === 'object') {
      featureExplanationsObj = productEditData.featureExplanations;
    }
    let tags = productEditData.tags;
    if (typeof tags === 'string') tags = tags.split(',').map((s) => s.trim()).filter(Boolean);
    let specifications = productEditData.specifications || {};
    if (typeof specifications === 'string') {
      try {
        specifications = JSON.parse(specifications);
      } catch {
        specifications = {};
      }
    }
    let images = productEditData.images;
    if (typeof images === 'string') images = images.split(',').map((s) => s.trim()).filter(Boolean);

    // Payload for product update
    const updatePayload = {
      name: productEditData.name ?? '',
      title: productEditData.title ?? '',
      description: productEditData.description ?? '',
      metaDescription: productEditData.metaDescription ?? '',
      price: productEditData.price !== undefined ? Number(productEditData.price) : 0,
      imageUrl: productEditData.imageUrl ?? '',
      images: images ?? [],
      category: productEditData.category ?? '',
      tags: tags ?? [],
      features,
      featureExplanations: featureExplanationsObj,
      benefits: productEditData.benefits ?? '',
      specifications: specifications ?? {},
      updatedAt: new Date()
    };

    // Update the product document
    await updateDoc(prodRef, updatePayload);

    // Mirror the changes to marketplace/{productId} if it exists
    try {
      const marketRef = doc(db, 'marketplace', editingProductId);
      const marketSnap = await getDoc(marketRef);
      if (marketSnap.exists()) {
        const mirrorPayload = {
          ...updatePayload,
          // Ensure both name and title are populated for downstream readers
          name: updatePayload.name || updatePayload.title,
          title: updatePayload.title || updatePayload.name,
          // Provide a thumbnail commonly used by listings
          thumbnail: updatePayload.imageUrl || (Array.isArray(updatePayload.images) ? updatePayload.images[0] : ''),
        };
        await setDoc(marketRef, mirrorPayload, { merge: true });
      }
    } catch (mirrorErr) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Marketplace mirror update skipped/failed:', mirrorErr);
      }
    }

    setProductModalOpen(false);
    setEditingProductId(null);
    setProductEditData({});
    await fetchDashboardData(user);
  } catch (err) {
    setSaveError('Failed to update product: ' + (err && err.message ? err.message : JSON.stringify(err)));
  }
  setSaveLoading(false);
}}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Product Name/Title</label>
                      <input
                        name="name"
                        value={productEditData.name || productEditData.title || ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, name: e.target.value, title: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={productEditData.description || ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, description: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Meta Description</label>
                      <textarea
                        name="metaDescription"
                        value={productEditData.metaDescription || ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, metaDescription: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Price</label>
                      <input
                        name="price"
                        type="number"
                        value={productEditData.price !== undefined ? productEditData.price : ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, price: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Category</label>
                      <input
                        name="category"
                        value={productEditData.category || ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, category: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Main Image URL</label>
                      <input
                        name="imageUrl"
                        value={productEditData.imageUrl || ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, imageUrl: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Gallery Images (comma separated URLs)</label>
                      <input
                        name="images"
                        value={Array.isArray(productEditData.images) ? productEditData.images.join(', ') : productEditData.images || ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, images: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tags (comma separated)</label>
                      <input
                        name="tags"
                        value={Array.isArray(productEditData.tags) ? productEditData.tags.join(', ') : productEditData.tags || ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, tags: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Benefits</label>
                      <textarea
                        name="benefits"
                        value={productEditData.benefits || ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, benefits: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-2">Features & Explanations</label>
                      <div className={`hidden md:grid grid-cols-12 gap-3 text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="col-span-5">Feature</div>
                        <div className="col-span-6">Explanation</div>
                        <div className="col-span-1"></div>
                      </div>
                      {(Array.isArray(productEditData.features) ? productEditData.features : typeof productEditData.features === 'string' ? productEditData.features.split(',').map((f) => f.trim()) : []).map((feature, i) => (
                        <div key={i} className="grid grid-cols-12 gap-3 mb-2">
                          <input
                            type="text"
                            value={feature || ''}
                            onChange={(e) => {
                              const fs = [...(Array.isArray(productEditData.features) ? productEditData.features : typeof productEditData.features === 'string' ? productEditData.features.split(',').map((f) => f.trim()) : [])];
                              const old = fs[i];
                              fs[i] = e.target.value;
                              let fe = { ...(productEditData.featureExplanations || {}) };
                              if (old && fe[old] !== undefined && old !== e.target.value) {
                                fe[e.target.value] = fe[old];
                                delete fe[old];
                              }
                              setProductEditData((d) => ({ ...d, features: fs, featureExplanations: fe }));
                            }}
                            className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} col-span-12 md:col-span-5 rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                            placeholder="Feature"
                          />
                          <input
                            type="text"
                            value={(productEditData.featureExplanations && productEditData.featureExplanations[feature]) || ''}
                            onChange={(e) => {
                              setProductEditData((d) => ({
                                ...d,
                                featureExplanations: { ...(d.featureExplanations || {}), [feature]: e.target.value },
                              }));
                            }}
                            className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} col-span-11 md:col-span-6 rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                            placeholder="Explanation"
                          />
                          <div className="col-span-1 flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              type="button"
                              onClick={() => {
                                const fs = [...(Array.isArray(productEditData.features) ? productEditData.features : typeof productEditData.features === 'string' ? productEditData.features.split(',').map((f) => f.trim()) : [])];
                                const feat = fs[i];
                                fs.splice(i, 1);
                                let fe = { ...(productEditData.featureExplanations || {}) };
                                if (feat) delete fe[feat];
                                setProductEditData((d) => ({ ...d, features: fs, featureExplanations: fe }));
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        className="mt-1"
                        onClick={() => {
                          const fs = [...(Array.isArray(productEditData.features) ? productEditData.features : typeof productEditData.features === 'string' ? productEditData.features.split(',').map((f) => f.trim()) : [])];
                          fs.push('');
                          setProductEditData((d) => ({ ...d, features: fs }));
                        }}
                      >
                        Add Feature
                      </Button>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Specifications (key-value JSON)</label>
                      <textarea
                        name="specifications"
                        value={typeof productEditData.specifications === 'string' ? productEditData.specifications : JSON.stringify(productEditData.specifications || {}, null, 2)}
                        onChange={(e) => setProductEditData((d) => ({ ...d, specifications: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400 font-mono text-xs`}
                        placeholder='{"Weight":"1.2kg","Color":"Red"}'
                      />
                    </div>
                  </div>

                  {saveError && (
                    <div className="text-red-400 text-sm mt-2">{saveError}</div>
                  )}
                  <div className="h-2" />
                  <div className={`${theme === 'dark' ? 'bg-gray-900/95 border-gray-700' : 'bg-white/90 border-gray-200'} sticky bottom-0 -mx-7 px-7 py-3 border-t backdrop-blur flex gap-2 justify-end`}>
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      disabled={saveLoading}
                      className={theme === 'dark' ? 'border-gray-500 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-100'}
                      onClick={() => {
                        setProductModalOpen(false);
                        setEditingProductId(null);
                        setProductEditData({});
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={saveLoading}>
                      {saveLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity:0; } to {opacity:1;} }
            @keyframes popModal {
              0% { opacity:0; transform: scale(.96) translateY(32px); }
              100% { opacity:1; transform: none; }
            }
          `}</style>
        </div>
      )}

      {/* Reviews */}
      <div className={`mb-3 font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Customer Reviews</div>
      <div className="space-y-4">
        {reviews.length === 0 && (
          <div className="text-gray-400 italic">No reviews yet.</div>
        )}
        {reviews.map((r) => (
          <div key={r.id} className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>{r.content || r.text}</div>
            <div className={theme === 'dark' ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>
              By: {r.customerName || r.reviewer || "Customer"}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <Button size="sm" onClick={() => handleAISuggest(r.id, r.content || r.text)}>
                AI Suggest Response
              </Button>
              {aiSuggestions[r.id] && (
                <span className={`border px-2 py-1 rounded ${theme === 'dark' ? 'text-blue-300 bg-gray-900 border-gray-700' : 'text-blue-600 bg-blue-50 border-blue-200'}`}>
                  {aiSuggestions[r.id]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )}
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <>
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Profile</h2>
              {/* Profile card and edit form (copied from original) */}
              <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 mb-8`}>
                <div className="flex items-start gap-6">
                  <div className="relative flex flex-col items-center">
                    <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} w-24 h-24 rounded-full overflow-hidden mb-2`}>
                      {photoURL ? (
                        <Image src={photoURL} alt="Profile" width={96} height={96} />
                      ) : (
                        <div className={`flex items-center justify-center w-full h-full text-4xl ${theme === 'dark' ? 'text-blue-300' : 'text-blue-400'}`}>
                          {user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleAvatarButtonClick}
                      className="mt-2 px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-full shadow transition-all focus:outline-none disabled:opacity-60"
                      disabled={avatarLoading}
                      tabIndex={0}
                    >
                      {avatarLoading ? "Updating..." : "Edit Avatar"}
                    </button>
                    {avatarMenuOpen && (
                      <div
                        ref={avatarMenuRef}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 z-30 bg-[#ffffff] rounded-lg shadow-xl border border-[#e4e4e4] py-2 flex flex-col items-stretch"
                        tabIndex={-1}
                      >
                        <button onClick={handleRemoveAvatar} disabled={avatarLoading} className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#221818] text-sm font-medium transition disabled:opacity-60" type="button">Remove Profile</button>
                        <button onClick={handleChangeAvatar} disabled={avatarLoading} className="w-full px-4 py-2 text-left text-white-300 hover:bg-[#1e2636] text-sm font-medium transition" type="button">Change Profile</button>
                        <button onClick={() => setAvatarMenuOpen(false)} className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#ffffff] text-sm font-medium transition" type="button">Cancel</button>
                        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleAvatarChange} disabled={avatarLoading} />
                        {avatarError && (<div className="text-xs text-red-400 mt-2 px-2 text-center">{avatarError}</div>)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{profile?.displayName || user.displayName || user.email}</div>
                    <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>{profile?.businessName || profile?.shopName || "No business info yet"}</div>
                    <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'} text-sm`}>Email: {user.email}</div>
                    {profile?.businessDesc && (<div className={`mt-3 text-base font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>{profile.businessDesc}</div>)}
                  </div>
                </div>
                {/* Edit Profile */}
                {!editing && (
                  <div className="mt-6">
                    <Button variant="outline" className={`${theme === 'dark' ? 'border-gray-500 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-100'}`} onClick={handleEdit}>
                      Edit Profile/Shop Info
                    </Button>
                  </div>
                )}
                {editing && (
                  <form onSubmit={handleEditSubmit} className={`mt-6 p-4 rounded-xl space-y-3 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Display Name</label>
                      <input name="displayName" value={editData.displayName || ""} onChange={handleEditChange} className={`w-full rounded-lg px-3 py-2 outline-none focus:border-blue-400 ${theme === 'dark' ? 'bg-gray-900 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'} ${(fullScreen ? "text-lg py-3" : "")}`}/>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Business/Artisan Name</label>
                      <input name="businessName" value={editData.businessName || ""} onChange={handleEditChange} className={`w-full rounded-lg px-3 py-2 outline-none focus:border-blue-400 ${theme === 'dark' ? 'bg-gray-900 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'} ${(fullScreen ? "text-lg py-3" : "")}`}/>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Business Description</label>
                      <textarea name="businessDesc" value={editData.businessDesc || ""} onChange={handleEditChange} className={`w-full rounded-lg px-3 py-2 outline-none resize-y focus:border-blue-400 ${theme === 'dark' ? 'bg-gray-900 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'} ${(fullScreen ? "text-lg py-3 min-h-[80px]" : "")}`}/>
                    </div>
                    {saveError && <div className="text-red-400 text-sm">{saveError}</div>}
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={saveLoading}>{saveLoading ? "Saving..." : "Save"}</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)} type="button" disabled={saveLoading} className={`${theme === 'dark' ? 'border-gray-500 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-100'}`}>Cancel</Button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
          {/* Products Section */}
          {activeSection === 'products' && (
            <>
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Products</h2>
              <div className="mb-8">
                {createdProducts.length === 0 && (
                  <div className="text-gray-400 italic">No products created yet.</div>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {createdProducts.map((prod) => (
                    <div key={prod.id} className={`relative rounded-xl border transition shadow-sm flex flex-col gap-2 p-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                      <button
                        type="button"
                        onClick={() => setOpenProductMenuId((prev) => prev === prod.id ? null : prod.id)}
                        className={`absolute top-2 right-2 p-1.5 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
                        aria-label="Product actions"
                      >
                        <MoreVertical size={18} color="#ffffff" />
                      </button>
                      {openProductMenuId === prod.id && (
                        <div className={`absolute top-10 right-2 w-36 border rounded-md shadow-lg z-20 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                          <button
                            type="button"
                            onClick={() => { setOpenProductMenuId(null); openEditProduct(prod); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-50 text-gray-800'}`}
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id)}
                            disabled={deletingProductId === prod.id}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${theme === 'dark' ? 'hover:bg-gray-800 text-red-400' : 'hover:bg-gray-50 text-red-600'}`}
                          >
                            <Trash2 size={14} /> {deletingProductId === prod.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      )}
                      {prod.imageUrl && (<img src={prod.imageUrl} alt={prod.name || "Product image"} className="w-full h-40 object-cover rounded-lg mb-1" />)}
                      <div className={`font-semibold text-base truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{prod.name || prod.title || "(Unnamed Product)"}</div>
                      {prod.description && (
                        <div className={theme === 'dark' ? 'text-gray-300 text-sm' : 'text-gray-700 text-sm'}>
                          {(
                            expandedDesc[prod.id] || String(prod.description).length <= 160
                          )
                            ? String(prod.description)
                            : String(prod.description).slice(0, 160) + '...'}
                          {String(prod.description).length > 160 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedDesc((prev) => ({ ...prev, [prod.id]: !prev[prod.id] }))
                              }
                              className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} ml-1 hover:underline text-xs`}
                            >
                              {expandedDesc[prod.id] ? 'Read less' : 'Read more'}
                            </button>
                          )}
                        </div>
                      )}
                      {typeof prod.price !== "undefined" && (<div className="font-semibold text-green-400 dark:text-green-400 text-green-600">Price: ₹{prod.price}</div>)}
                      {prod.createdAt && (<div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Created: {prod.createdAt.toDate?.().toLocaleString?.() || String(prod.createdAt)}</div>)}
                      <Button
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold mt-2"
                        onClick={() => {
                          setEditingProductId(prod.id);
                          setProductEditData({
                            name: prod.name || prod.title || '',
                            title: prod.title || prod.name || '',
                            description: prod.description || '',
                            metaDescription: prod.metaDescription || '',
                            price: prod.price ?? '',
                            imageUrl: prod.imageUrl || '',
                            images: Array.isArray(prod.images) ? prod.images : (prod.images || ''),
                            category: prod.category || '',
                            tags: Array.isArray(prod.tags) ? prod.tags : (prod.tags || ''),
                            benefits: prod.benefits || '',
                            features: Array.isArray(prod.features) ? prod.features : (prod.features || ''),
                            featureExplanations: prod.featureExplanations || {},
                            specifications: prod.specifications ? (typeof prod.specifications === 'string' ? prod.specifications : JSON.stringify(prod.specifications, null, 2)) : '{}',
                          });
                          setProductModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {/* Reviews Section */}
          {activeSection === 'reviews' && (
            <>
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Customer Reviews</h2>
              <div className="space-y-4">
                {reviews.length === 0 && (<div className="text-gray-400 italic">No reviews yet.</div>)}
                {reviews.map((r) => (
                  <div key={r.id} className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>                  <div className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>{r.content || r.text}</div>
                    <div className={theme === 'dark' ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>By: {r.customerName || r.reviewer || "Customer"}</div>
                    <div className="flex items-center gap-3 mt-3">
                      <Button size="sm" onClick={() => handleAISuggest(r.id, r.content || r.text)}>AI Suggest Response</Button>
                      {aiSuggestions[r.id] && (<span className={`border px-2 py-1 rounded ${theme === 'dark' ? 'text-blue-300 bg-gray-900 border-gray-700' : 'text-blue-600 bg-blue-50 border-blue-200'}`}>{aiSuggestions[r.id]}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* News Section */}
          {activeSection === 'news' && (
            <>
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Latest News</h2>
              <News fullPage={true} />
            </>
          )}
          </section>

          {activeSection !== 'overview' && productModalOpen && (
        <div>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            style={{ animation: 'fadeIn 0.18s' }}
            onClick={() => setProductModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-2 py-8" role="dialog" aria-modal="true">
            <div
              className={`relative w-full max-w-3xl rounded-2xl shadow-2xl border transition-all ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} max-h-[90vh] overflow-y-auto overscroll-contain`}
              style={{ animation: 'popModal 0.22s' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setProductModalOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'} transition`}
                aria-label="Close edit modal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <div className="px-7 py-6">
                <div className={`mb-5 font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Product</div>
                <form
               onSubmit={async (e) => {
  e.preventDefault();
  setSaveError(null);
  setSaveLoading(true);
  try {
    const prodRef = doc(db, 'products', editingProductId);

    // Normalize incoming form data
    let features = productEditData.features || [];
    if (typeof features === 'string') {
      features = features.split(',').map((s) => s.trim()).filter(Boolean);
    }
    let featureExplanationsObj = {};
    if (productEditData.featureExplanations && typeof productEditData.featureExplanations === 'object') {
      featureExplanationsObj = productEditData.featureExplanations;
    }
    let tags = productEditData.tags;
    if (typeof tags === 'string') tags = tags.split(',').map((s) => s.trim()).filter(Boolean);
    let specifications = productEditData.specifications || {};
    if (typeof specifications === 'string') {
      try {
        specifications = JSON.parse(specifications);
      } catch {
        specifications = {};
      }
    }
    let images = productEditData.images;
    if (typeof images === 'string') images = images.split(',').map((s) => s.trim()).filter(Boolean);

    // Payload for product update
    const updatePayload = {
      name: productEditData.name ?? '',
      title: productEditData.title ?? '',
      description: productEditData.description ?? '',
      metaDescription: productEditData.metaDescription ?? '',
      price: productEditData.price !== undefined ? Number(productEditData.price) : 0,
      imageUrl: productEditData.imageUrl ?? '',
      images: images ?? [],
      category: productEditData.category ?? '',
      tags: tags ?? [],
      features,
      featureExplanations: featureExplanationsObj,
      benefits: productEditData.benefits ?? '',
      specifications: specifications ?? {},
      updatedAt: new Date()
    };

    // Update the product document
    await updateDoc(prodRef, updatePayload);

    // Mirror the changes to marketplace/{productId} if it exists
    try {
      const marketRef = doc(db, 'marketplace', editingProductId);
      const marketSnap = await getDoc(marketRef);
      if (marketSnap.exists()) {
        const mirrorPayload = {
          ...updatePayload,
          name: updatePayload.name || updatePayload.title,
          title: updatePayload.title || updatePayload.name,
          thumbnail: updatePayload.imageUrl || (Array.isArray(updatePayload.images) ? updatePayload.images[0] : ''),
        };
        await setDoc(marketRef, mirrorPayload, { merge: true });
      }
    } catch (mirrorErr) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Marketplace mirror update skipped/failed:', mirrorErr);
      }
    }

    setProductModalOpen(false);
    setEditingProductId(null);
    setProductEditData({});
    await fetchDashboardData(user);
  } catch (err) {
    setSaveError('Failed to update product: ' + (err && err.message ? err.message : JSON.stringify(err)));
  }
  setSaveLoading(false);
}}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Product Name/Title</label>
                      <input
                        name="name"
                        value={productEditData.name || productEditData.title || ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, name: e.target.value, title: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={productEditData.description || ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, description: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Meta Description</label>
                      <textarea
                        name="metaDescription"
                        value={productEditData.metaDescription || ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, metaDescription: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Price</label>
                      <input
                        name="price"
                        type="number"
                        value={productEditData.price !== undefined ? productEditData.price : ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, price: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Category</label>
                      <input
                        name="category"
                        value={productEditData.category || ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, category: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Main Image URL</label>
                      <input
                        name="imageUrl"
                        value={productEditData.imageUrl || ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, imageUrl: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Gallery Images (comma separated URLs)</label>
                      <input
                        name="images"
                        value={Array.isArray(productEditData.images) ? productEditData.images.join(', ') : productEditData.images || ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, images: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Tags (comma separated)</label>
                      <input
                        name="tags"
                        value={Array.isArray(productEditData.tags) ? productEditData.tags.join(', ') : productEditData.tags || ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, tags: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Benefits</label>
                      <textarea
                        name="benefits"
                        value={productEditData.benefits || ''}
                        onChange={(e) => setProductEditData((d) => ({ ...d, benefits: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-2">Features & Explanations</label>
                      <div className={`hidden md:grid grid-cols-12 gap-3 text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="col-span-5">Feature</div>
                        <div className="col-span-6">Explanation</div>
                        <div className="col-span-1"></div>
                      </div>
                      {(Array.isArray(productEditData.features) ? productEditData.features : typeof productEditData.features === 'string' ? productEditData.features.split(',').map((f) => f.trim()) : []).map((feature, i) => (
                        <div key={i} className="grid grid-cols-12 gap-3 mb-2">
                          <input
                            type="text"
                            value={feature || ''}
                            onChange={(e) => {
                              const fs = [...(Array.isArray(productEditData.features) ? productEditData.features : typeof productEditData.features === 'string' ? productEditData.features.split(',').map((f) => f.trim()) : [])];
                              const old = fs[i];
                              fs[i] = e.target.value;
                              let fe = { ...(productEditData.featureExplanations || {}) };
                              if (old && fe[old] !== undefined && old !== e.target.value) {
                                fe[e.target.value] = fe[old];
                                delete fe[old];
                              }
                              setProductEditData((d) => ({ ...d, features: fs, featureExplanations: fe }));
                            }}
                            className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} col-span-12 md:col-span-5 rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                            placeholder="Feature"
                          />
                          <input
                            type="text"
                            value={(productEditData.featureExplanations && productEditData.featureExplanations[feature]) || ''}
                            onChange={(e) => {
                              setProductEditData((d) => ({
                                ...d,
                                featureExplanations: { ...(d.featureExplanations || {}), [feature]: e.target.value },
                              }));
                            }}
                            className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} col-span-11 md:col-span-6 rounded-lg px-3 py-2 outline-none border focus:border-blue-400`}
                            placeholder="Explanation"
                          />
                          <div className="col-span-1 flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              type="button"
                              onClick={() => {
                                const fs = [...(Array.isArray(productEditData.features) ? productEditData.features : typeof productEditData.features === 'string' ? productEditData.features.split(',').map((f) => f.trim()) : [])];
                                const feat = fs[i];
                                fs.splice(i, 1);
                                let fe = { ...(productEditData.featureExplanations || {}) };
                                if (feat) delete fe[feat];
                                setProductEditData((d) => ({ ...d, features: fs, featureExplanations: fe }));
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        className="mt-1"
                        onClick={() => {
                          const fs = [...(Array.isArray(productEditData.features) ? productEditData.features : typeof productEditData.features === 'string' ? productEditData.features.split(',').map((f) => f.trim()) : [])];
                          fs.push('');
                          setProductEditData((d) => ({ ...d, features: fs }));
                        }}
                      >
                        Add Feature
                      </Button>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Specifications (key-value JSON)</label>
                      <textarea
                        name="specifications"
                        value={typeof productEditData.specifications === 'string' ? productEditData.specifications : JSON.stringify(productEditData.specifications || {}, null, 2)}
                        onChange={(e) => setProductEditData((d) => ({ ...d, specifications: e.target.value }))}
                        className={`${theme === 'dark' ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-400 font-mono text-xs`}
                        placeholder='{"Weight":"1.2kg","Color":"Red"}'
                      />
                    </div>
                  </div>

                  {saveError && (
                    <div className="text-red-400 text-sm mt-2">{saveError}</div>
                  )}
                  <div className="h-2" />
                  <div className={`${theme === 'dark' ? 'bg-gray-900/95 border-gray-700' : 'bg-white/90 border-gray-200'} sticky bottom-0 -mx-7 px-7 py-3 border-t backdrop-blur flex gap-2 justify-end`}>
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      disabled={saveLoading}
                      className={theme === 'dark' ? 'border-gray-500 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-100'}
                      onClick={() => {
                        setProductModalOpen(false);
                        setEditingProductId(null);
                        setProductEditData({});
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={saveLoading}>
                      {saveLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity:0; } to {opacity:1;} }
            @keyframes popModal {
              0% { opacity:0; transform: scale(.96) translateY(32px); }
              100% { opacity:1; transform: none; }
            }
          `}</style>
        </div>
      )}

          {showNewsAside && (
            <aside className="hidden lg:block flex-none max-w-xs w-full self-start px-2 pt-8 pb-8">
              <News />
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
