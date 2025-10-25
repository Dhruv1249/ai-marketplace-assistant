   'use client';

export const dynamic = 'force-dynamic';

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
import { MoreVertical, Trash2, Pencil, LogOut, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import News from "./News";
import LogoutButton from '@/components/animated icon/logout.jsx';
import ComfermationDelet from '@/components/animated icon/ComfermationDelet.jsx';
import EditAvatar from '@/components/animated icon/EditAvatar.jsx';
import CommingSoon from '@/components/animated icon/CommingSoon.jsx';
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
  // Seller analytics state
  const [salesOrders, setSalesOrders] = useState([]);
  const [salesStats, setSalesStats] = useState({ units: 0, revenue: 0, avgOrder: 0 });
  const [aiAnalyticsText, setAiAnalyticsText] = useState('');
  const [aiAnalyticsLoading, setAiAnalyticsLoading] = useState(false);
  const [aiAnalyticsError, setAiAnalyticsError] = useState(null);
  const [revRange, setRevRange] = useState('30D');
  const [aiSuggestions, setAISuggestions] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);

  // === Product Editing State ===
  const [editingProductId, setEditingProductId] = useState(null);
  const [productEditData, setProductEditData] = useState({});
  const [productModalOpen, setProductModalOpen] = useState(false);

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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

    // Load seller-side orders for analytics (robust owner detection)
    try {
      const ordersCol = collection(db, 'orders');
      const orderQueries = [
        query(ordersCol, where('sellerId', '==', u.uid)),
        query(ordersCol, where('artisanId', '==', u.uid)),
        query(ordersCol, where('ownerId', '==', u.uid)),
        query(ordersCol, where('seller.id', '==', u.uid)),
      ];
      const ordResults = await Promise.allSettled(orderQueries.map((q) => getDocs(q)));
      const ordSeen = new Set();
      const orders = [];
      for (const res of ordResults) {
        if (res.status === 'fulfilled') {
          for (const d of res.value.docs) {
            if (!ordSeen.has(d.id)) {
              ordSeen.add(d.id);
              orders.push({ id: d.id, ...d.data() });
            }
          }
        }
      }
      setSalesOrders(orders);

      // Compute seller analytics
      const unitsSold = orders.reduce((sum, o) => {
        if (Array.isArray(o.items)) {
          return sum + o.items.reduce((s, it) => s + (Number(it.qty ?? it.quantity ?? 1) || 1), 0);
        }
        return sum + (Number(o.qty ?? o.quantity ?? 1) || 1);
      }, 0);

      const revenue = orders.reduce((sum, o) => {
        if (Array.isArray(o.items)) {
          return sum + o.items.reduce((s, it) => {
            const qty = Number(it.qty ?? it.quantity ?? 1) || 1;
            const amt = Number(it.total ?? it.amount ?? (it.price ?? 0) * qty) || 0;
            return s + amt;
          }, 0);
        }
        const amt = Number(o.total ?? o.amount);
        if (!isNaN(amt) && amt > 0) return sum + amt;
        const price = Number(o.price ?? 0);
        const qty = Number(o.qty ?? o.quantity ?? 1) || 1;
        return sum + price * qty;
      }, 0);

      const avgOrder = orders.length ? revenue / orders.length : 0;
      setSalesStats({ units: unitsSold, revenue, avgOrder });
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Seller analytics fetch failed/skipped', e?.message || e);
      }
      setSalesOrders([]);
      setSalesStats({ units: 0, revenue: 0, avgOrder: 0 });
    }

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

  // Disable page scroll when Coming Soon overlay is open
  useEffect(() => {
    if (comingSoonOpen && typeof document !== 'undefined') {
      const prevOverflow = document.body.style.overflow;
      const prevPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.paddingRight = prevPaddingRight;
      };
    }
  }, [comingSoonOpen]);

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

  // AI insights for analytics
  const handleGenerateAIInsights = async (payload) => {
    setAiAnalyticsError(null);
    setAiAnalyticsLoading(true);
    try {
      const prompt = `You are an expert e-commerce growth strategist. Analyze the following seller analytics JSON and return 5-8 specific, high-impact recommendations. Focus on pricing, positioning, bundling, hero media, reviews, upsells/cross-sells, and campaign ideas. Output as concise bullet points (max 2 lines each), strongest actions first.\n\nANALYTICS:\n${JSON.stringify(payload, null, 2)}`;
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      let text = '';
      try {
        const j = await res.json();
        text = j.content || j.result || j.text || j.data?.content || '';
      } catch {
        text = await res.text();
      }
      if (!res.ok) throw new Error(text || 'Failed to generate insights');
      setAiAnalyticsText((text || '').trim());
    } catch (e) {
      setAiAnalyticsError(e?.message || 'AI generation failed');
      const fb = Array.isArray(payload?.suggestions) && payload.suggestions.length
        ? `• ${payload.suggestions.join('\n• ')}`
        : 'No AI insights available yet. Add products and collect more data to analyze.';
      setAiAnalyticsText(fb);
    } finally {
      setAiAnalyticsLoading(false);
    }
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
      className={`min-h-screen w-full flex overflow-x-hidden ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`}
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
            className={`block w-full text-left px-4 py-2 rounded-lg transition font-semibold ${activeSection === 'analytics' ? (theme === 'dark' ? 'bg-gray-800 text-blue-300' : 'bg-gray-100 text-blue-700') : (theme === 'dark' ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900')}`}
            onClick={() => setActiveSection('analytics')}
            type="button"
          >Analytics</button>
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
    <LogoutButton variant="outline" size="sm" className="flex items-center gap-2">
      <LogOut size={16} />
        Logout
    </LogoutButton>
  </div>
  <div
    style={{ display: 'flex', justifyContent: 'flex-end' }}
  >
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
      onClick={() => setDeleteDialogOpen(true)}
    >
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
        <ComfermationDelet open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} />
        
       <div className={`mt-auto px-6 pt-4 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
  © {new Date().getFullYear()}
</div>
      </aside>

      {/* Main + News content */}
      <main className={theme === 'dark' ? 'flex-1 bg-black flex flex-col overflow-x-hidden' : 'flex-1 bg-white flex flex-col overflow-x-hidden'}>
        {comingSoonOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            onClick={() => setComingSoonOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()} className="transform scale-110 md:scale-135">
              <CommingSoon />
            </div>
          </div>
        )}
        {/* Top bar */}
        <div className={`sticky top-0 z-20 flex items-center justify-between md:justify-end px-3 sm:px-6 h-14 backdrop-blur ${theme === 'dark' ? 'bg-black/80' : 'bg-white/80'}`}>
          <div className={`md:hidden font-semibold ${theme === 'dark' ? 'text-white' : ''}`}>Dashboard</div>
        </div>

        {/* Mobile section switcher directly under top bar */}
        <div className={`md:hidden border-b ${theme === 'dark' ? 'bg-black/90 border-gray-800' : 'bg-white/90 border-gray-200'} backdrop-blur`}>
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 px-3 py-2">
              {['overview','profile','products','reviews','analytics'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setActiveSection(s)}
                  className={`px-3 py-1 rounded-full text-xs border whitespace-nowrap ${activeSection===s ? 'bg-blue-600 text-white border-blue-600' : (theme==='dark' ? 'text-gray-200 border-gray-700' : 'text-gray-800 border-gray-200')}`}
                  aria-pressed={activeSection===s}
                >{s.charAt(0).toUpperCase()+s.slice(1)}</button>
              ))}
            </div>
          </div>
        </div>

        <style>{`textarea[name="specifications"]{min-height:200px; resize: vertical;}`}</style>

        {/* Page container */}
        <div className="flex flex-row w-full flex-1">
                    <section
            ref={dashboardSectionRef}
            className={`px-3 sm:px-4 py-6 w-full ${showNewsAside ? 'lg:pr-6' : ''}`}
            style={{ flex: showNewsAside ? '3 1 0%' : '1 1 0%' }}
          >
          {/* Overview Section */}
  {activeSection === 'overview' && (
    <>
      <h2 className={`hidden sm:block text-2xl font-bold mb-2 sm:ml-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Dashboard</h2>
      {/* Profile card - hidden on mobile */}
      <div className={`hidden md:block ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-10 mb-8 text-left`}>
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
            <EditAvatar
              onClick={handleAvatarButtonClick}
              disabled={avatarLoading}
              tabIndex={0}
              loading={avatarLoading}
              label="Edit Avatar"
              className="hidden md:inline-flex mt-2 px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-full shadow transition-all focus:outline-none disabled:opacity-60"
            />
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
            {profile?.businessDesc && (
              <div className={`mt-3 text-base font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>
                {profile.businessDesc}
              </div>
            )}
          </div>
        </div>
        {/* Edit Profile */}
        {!editing && (
          <div className="hidden md:block mt-6">
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
        <div className={`font-semibold mb-3 text-left ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Created Products</div>
        {createdProducts.length === 0 && (
          <div className="text-gray-400 italic">No products found.</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {createdProducts.map((prod) => (
            <div key={prod.id} className={`relative rounded-xl border transition shadow-sm flex flex-col gap-2 p-3 sm:p-4 overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
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
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
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
                  {prod.hasCustomPage ? (
    <Link href={`/seller-info/${prod.id}?mode=edit`} className="flex-1">
      <Button
        size="sm"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        type="button"
      >
        Edit Story Page
      </Button>
    </Link>
  ) : (
    <Link href={`/seller-info/${prod.id}?mode=create`} className="flex-1">
      <Button
        size="sm"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
        type="button"
      >
        Add Story Page
      </Button>
    </Link>
  )}
                </div>
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
                    <EditAvatar
                      onClick={handleAvatarButtonClick}
                      disabled={avatarLoading}
                      tabIndex={0}
                      loading={avatarLoading}
                      label="Edit Avatar"
                      className="mt-2 px-4 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-full shadow transition-all focus:outline-none disabled:opacity-60"
                    />
                    {avatarMenuOpen && (
                      <div
                        ref={avatarMenuRef}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 z-30 bg-[#ffffff] rounded-lg shadow-xl border border-[#e4e4e4] py-2 flex flex-col items-stretch"
                        tabIndex={-1}
                      >
                        <button onClick={handleRemoveAvatar} disabled={avatarLoading} className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#ebe9e9] text-sm font-medium transition disabled:opacity-60" type="button">Remove Profile</button>
                        <button onClick={handleChangeAvatar} disabled={avatarLoading} className="w-full px-4 py-2 text-left text-white-300 hover:bg-[#ebe9e9] text-sm font-medium transition" type="button">Change Profile</button>
                        <button onClick={() => setAvatarMenuOpen(false)} className="w-full px-4 py-2 text-left text-gray-300 hover:bg-[#ebe9e9] text-sm font-medium transition" type="button">Cancel</button>
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
          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            (() => {
              const fmtCurr = (n) => (Number(n) || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
              const now = Date.now();
              const day = 86400000;
              const getTime = (d) => d?.toDate?.().getTime?.() || (typeof d === 'string' ? Date.parse(d) : (d instanceof Date ? d.getTime() : 0)) || 0;

              // Compute revenue series and growth for selected range
              const hour = 3600000;
              const revenueOfOrder = (o) => {
                if (Array.isArray(o.items)) {
                  return o.items.reduce((ss, it) => {
                    const qty = Number(it.qty ?? it.quantity ?? 1) || 1;
                    const amt = Number(it.total ?? it.amount ?? (it.price ?? 0) * qty) || 0;
                    return ss + amt;
                  }, 0);
                }
                const amt = Number(o.total ?? o.amount);
                if (!isNaN(amt) && amt > 0) return amt;
                const price = Number(o.price ?? 0);
                const qty = Number(o.qty ?? o.quantity ?? 1) || 1;
                return price * qty;
              };
              const periodLabel = revRange === '1D' ? 'last 1 day' : (revRange === '6M' ? 'last 6 months' : (revRange === '1Y' ? 'last 1 year' : 'last 30 days'));

              let series = [];
              let prevSeries = [];

              if (revRange === '1D') {
                // last 24 hours by hour
                const start = now - 24 * hour;
                for (let i = 0; i < 24; i++) {
                  const t0 = start + i * hour;
                  const t1 = t0 + hour;
                  const sum = salesOrders.reduce((s, o) => {
                    const t = getTime(o.createdAt || o.paidAt || o.updatedAt);
                    return (t >= t0 && t < t1) ? s + revenueOfOrder(o) : s;
                  }, 0);
                  series.push(sum);
                }
                const prevStart = start - 24 * hour;
                for (let i = 0; i < 24; i++) {
                  const t0 = prevStart + i * hour;
                  const t1 = t0 + hour;
                  const sum = salesOrders.reduce((s, o) => {
                    const t = getTime(o.createdAt || o.paidAt || o.updatedAt);
                    return (t >= t0 && t < t1) ? s + revenueOfOrder(o) : s;
                  }, 0);
                  prevSeries.push(sum);
                }
              } else {
                // Days for 30D / 6M / 1Y
                const days = revRange === '6M' ? 180 : (revRange === '1Y' ? 365 : 30);
                const startOfDay = (t) => { const d = new Date(t); d.setHours(0,0,0,0); return d.getTime(); };
                const today0 = startOfDay(now);
                for (let i = days - 1; i >= 0; i--) {
                  const day0 = today0 - i * day;
                  const day1 = day0 + day;
                  const sum = salesOrders.reduce((s, o) => {
                    const t = getTime(o.createdAt || o.paidAt || o.updatedAt);
                    return (t >= day0 && t < day1) ? s + revenueOfOrder(o) : s;
                  }, 0);
                  series.push(sum);
                }
                for (let i = days - 1; i >= 0; i--) {
                  const day0 = today0 - (days + i) * day;
                  const day1 = day0 + day;
                  const sum = salesOrders.reduce((s, o) => {
                    const t = getTime(o.createdAt || o.paidAt || o.updatedAt);
                    return (t >= day0 && t < day1) ? s + revenueOfOrder(o) : s;
                  }, 0);
                  prevSeries.push(sum);
                }
              }

              const sumArr = (arr) => arr.reduce((a,b)=>a+b,0);
              const revCurr = sumArr(series);
              const revPrev = sumArr(prevSeries);
              const growth = revPrev > 0 ? ((revCurr - revPrev) / revPrev) * 100 : (revCurr > 0 ? 100 : 0);

              // Top products by revenue
              const index = new Map(createdProducts.map((p) => [p.id, p]));
              const grouped = {};
              for (const o of salesOrders) {
                if (Array.isArray(o.items)) {
                  for (const it of o.items) {
                    const pid = it.productId || it.id || it.sku || o.productId;
                    const qty = Number(it.qty ?? it.quantity ?? 1) || 1;
                    const amt = Number(it.total ?? it.amount ?? (it.price ?? 0) * qty) || 0;
                    const title = index.get(pid)?.name || index.get(pid)?.title || it.title || o.productTitle || String(pid || 'Unknown');
                    if (!grouped[pid]) grouped[pid] = { qty: 0, revenue: 0, title };
                    grouped[pid].qty += qty;
                    grouped[pid].revenue += amt;
                  }
                } else {
                  const pid = o.productId || o.itemId || o.product?.id;
                  const qty = Number(o.qty ?? o.quantity ?? 1) || 1;
                  const amt = Number(o.total ?? o.amount ?? (o.price ?? 0) * qty) || 0;
                  const title = index.get(pid)?.name || index.get(pid)?.title || o.productTitle || String(pid || 'Unknown');
                  if (!grouped[pid]) grouped[pid] = { qty: 0, revenue: 0, title };
                  grouped[pid].qty += qty;
                  grouped[pid].revenue += amt;
                }
              }
              const top = Object.entries(grouped).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);
              const maxRev = top.reduce((m, [, v]) => Math.max(m, v.revenue), 0) || 1;

              // Build daily revenue series for last 30 days
              const startOfDay = (t) => { const d = new Date(t); d.setHours(0,0,0,0); return d.getTime(); };
              const today0 = startOfDay(now);
              const daysRev = Array.from({ length: 30 }, (_, i) => {
                const day0 = today0 - (29 - i) * day;
                const day1 = day0 + day;
                return salesOrders.reduce((s, o) => {
                  const t = getTime(o.createdAt || o.paidAt || o.updatedAt);
                  if (t >= day0 && t < day1) {
                    if (Array.isArray(o.items)) {
                      return s + o.items.reduce((ss, it) => {
                        const qty = Number(it.qty ?? it.quantity ?? 1) || 1;
                        const amt = Number(it.total ?? it.amount ?? (it.price ?? 0) * qty) || 0;
                        return ss + amt;
                      }, 0);
                    }
                    const amt = Number(o.total ?? o.amount);
                    if (!isNaN(amt) && amt > 0) return s + amt;
                    const price = Number(o.price ?? 0);
                    const qty = Number(o.qty ?? o.quantity ?? 1) || 1;
                    return s + price * qty;
                  }
                  return s;
                }, 0);
              });
              const maxDayRev = Math.max(1, ...daysRev);

              // Suggestions
              const suggestions = [];
              if (salesStats.revenue === 0) suggestions.push('No sales yet: publish products, add compelling images, and share your marketplace link.');
              if (top.length >= 1 && salesOrders.length > 3) suggestions.push('Double down on your top seller: add bundles, highlight reviews, and feature it on your profile.');
              if (createdProducts.length > 0 && salesOrders.length / Math.max(createdProducts.length, 1) < 0.5) suggestions.push('Consider optimizing product descriptions and pricing to improve conversion.');

              return (
                <>
                  <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sales Analytics</h2>

                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
                    <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-5`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Units Sold</span>
                        <BarChart3 className={theme === 'dark' ? 'text-blue-300' : 'text-blue-600'} size={18} />
                      </div>
                      <div className="text-3xl font-bold text-blue-500">{salesStats.units}</div>
                    </div>
                    <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-5`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Revenue</span>
                        <PieChart className={theme === 'dark' ? 'text-purple-300' : 'text-purple-600'} size={18} />
                      </div>
                      <div className="text-3xl font-bold text-purple-500">{fmtCurr(salesStats.revenue)}</div>
                    </div>
                    <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-5`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Avg Order Value</span>
                        <TrendingUp className={theme === 'dark' ? 'text-green-300' : 'text-green-600'} size={18} />
                      </div>
                      <div className="text-3xl font-bold text-green-500">{fmtCurr(salesStats.avgOrder)}</div>
                    </div>
                  </div>

                  {/* Trend + Top products */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                    <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-5`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{`Revenue (${periodLabel})`}</div>
                        <div className={`text-sm flex items-center gap-2 ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          <TrendingUp size={16} /> {isFinite(growth) ? growth.toFixed(1) : '0.0'}%
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap mb-2">
                        {['1D','30D','6M','1Y'].map((rng) => (
                          <button
                            key={rng}
                            type="button"
                            onClick={() => setRevRange(rng)}
                            className={`px-2 py-0.5 rounded text-xs border ${revRange===rng ? 'bg-blue-600 text-white border-blue-600' : (theme==='dark' ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200')} hover:bg-blue-50`}
                            aria-pressed={revRange===rng}
                            aria-label={`Show ${rng} revenue`}
                          >{rng}</button>
                        ))}
                      </div>
                      <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-2xl font-bold`}>{fmtCurr(revCurr)}</div>
                      <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs mt-1`}>Prev period: {fmtCurr(revPrev)}</div>
                      {/* Sparkline chart */}
                      <div className="mt-4">
                        <svg viewBox="0 0 600 120" width="100%" height="120" preserveAspectRatio="none" role="img" aria-label="Revenue last 30 days sparkline">
                          {/* baseline */}
                          <line x1="0" y1="110" x2="600" y2="110" stroke={theme === 'dark' ? '#334155' : '#e5e7eb'} strokeWidth="1" />
                          {/* area fill */}
                          <polyline
                            fill={theme === 'dark' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.20)'}
                            stroke="none"
                            points={`${[0,110].join(',')} ${series.map((v,i)=>`${(i/(series.length-1||1))*600},${110 - (v/Math.max(1, ...series))*100}`).join(' ')} ${600},110`}
                          />
                          {/* line */}
                          <polyline
                            fill="none"
                            stroke={theme === 'dark' ? '#60a5fa' : '#2563eb'}
                            strokeWidth="2.5"
                            points={series.map((v,i)=>`${(i/(series.length-1||1))*600},${110 - (v/Math.max(1, ...series))*100}`).join(' ')}
                          />
                        </svg>
                      </div>
                    </div>

                    <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-5`}>
                      <div className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Top Products</div>
                      {top.length === 0 && (
                        <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No sales data yet.</div>
                      )}
                      <div className="space-y-3">
                        {top.map(([pid, info]) => (
                          <div key={pid}>
                            <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              <span className="truncate pr-2">{info.title}</span>
                              <span className="font-medium">{fmtCurr(info.revenue)}</span>
                            </div>
                            <div className={`h-2 mt-1 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div className="h-2 rounded bg-blue-500" style={{ width: `${Math.max(3, (info.revenue / maxRev) * 100)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-5`}>
                    <div className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Suggestions to improve</div>
                    {suggestions.length === 0 ? (
                      <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Keep up the good work! Add more products and encourage reviews to sustain growth.</div>
                    ) : (
                      <ul className={`list-disc pl-5 space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {suggestions.map((s, i) => (<li key={i}>{s}</li>))}
                      </ul>
                    )}
                  </div>

                  {/* AI Insights */}
                  <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-5 mt-6`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>AI Insights</div>
                      <Button
                        size="sm"
                        disabled={aiAnalyticsLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => { setAiAnalyticsError(null); setComingSoonOpen(true); }}
                      >
                        {aiAnalyticsLoading ? 'Generating...' : (aiAnalyticsText ? 'Regenerate' : 'Generate')}
                      </Button>
                    </div>
                    {aiAnalyticsError && (
                      <div className="text-sm text-red-500 mb-2">{aiAnalyticsError}</div>
                    )}
                    <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap text-sm`}> 
                      {aiAnalyticsText || 'Click Generate to get AI-driven recommendations based on your analytics.'}
                    </div>
                  </div>
                </>
              );
            })()
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
                        <MoreVertical size={18} color="#000000" />
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
                      <div className={`font-semibold text-base break-words overflow-hidden line-clamp-2 pr-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{prod.name || prod.title || "(Unnamed Product)"}</div>
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
                      {prod.hasCustomPage ? (
                        <Link href={`/seller-info/${prod.id}?mode=edit`}>
                          <Button size="sm" className="mt-2 ml-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold" type="button">
                            Edit Story Page
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/seller-info/${prod.id}?mode=create`}>
                          <Button size="sm" className="mt-2 ml-2 bg-green-600 hover:bg-green-700 text-white font-semibold" type="button">
                            Add Story Page
                          </Button>
                        </Link>
                      )}
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
            <aside className="hidden lg:block flex-none max-w-xs w-full self-start px-2 pt-12 pb-8">
              <h2 className={`text-2xl font-bold mb-4 ml-2 sm:ml-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>What's trending?</h2>
              <News />
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
