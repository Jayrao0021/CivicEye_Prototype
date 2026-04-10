import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const SESSION_KEY = "civiceye-session";
const LOCATION_KEY = "civiceye-location";
const MAX_RADIUS_KM = 50;

const menuItems = [
  "Home",
  "Category",
  "Submit Complaint",
  "Pending Requests",
  "Request Feed",
];

const categoryOptions = [
  "Roads",
  "Sanitation",
  "Traffic",
  "Public Misconduct",
  "Water",
];

const fallbackAuthorities = [
  {
    id: 1,
    name: "Municipal Corporation",
    handle: "@municipalcorp",
    category: "Sanitation",
    followers: "12.4k",
  },
  {
    id: 2,
    name: "Traffic Police",
    handle: "@trafficpolice",
    category: "Traffic",
    followers: "9.1k",
  },
  {
    id: 3,
    name: "Waste Department",
    handle: "@wastedept",
    category: "Sanitation",
    followers: "6.8k",
  },
  {
    id: 4,
    name: "Road Authority",
    handle: "@roadauthority",
    category: "Roads",
    followers: "8.7k",
  },
  {
    id: 5,
    name: "Water Board",
    handle: "@waterboard",
    category: "Water",
    followers: "5.4k",
  },
  {
    id: 6,
    name: "City Clean Squad",
    handle: "@citycleansquad",
    category: "Public Misconduct",
    followers: "7.3k",
  },
];

const fallbackPosts = [
  {
    id: 1,
    authority: "Road Authority",
    handle: "@roadauthority",
    category: "Roads",
    caption:
      "Large pothole near Riverfront Circle. Vehicles are swerving dangerously during evening traffic.",
    location: "Riverfront Circle, 3.2 km away",
    reward: "Reward pending approval",
    status: "Pending",
    image:
      "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    authority: "Waste Department",
    handle: "@wastedept",
    category: "Sanitation",
    caption:
      "Garbage pickup skipped for two days near Lotus Residency. The smell is spreading across the lane.",
    location: "Lotus Residency, 6.5 km away",
    reward: "50 points on approval",
    status: "In Review",
    image:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    authority: "Traffic Police",
    handle: "@trafficpolice",
    category: "Traffic",
    caption:
      "Repeated signal jumping at City Mall junction. Requesting traffic monitoring during rush hours.",
    location: "City Mall Junction, 11.4 km away",
    reward: "5% fine share if verified",
    status: "Approved",
    image:
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    authority: "Road Authority",
    handle: "@roadauthority",
    category: "Roads",
    caption:
      "Broken divider reflectors near Sunrise Flyover are causing visibility issues late at night.",
    location: "Sunrise Flyover, 8.9 km away",
    reward: "Reward points after approval",
    status: "Pending",
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    authority: "Municipal Corporation",
    handle: "@municipalcorp",
    category: "Sanitation",
    caption:
      "Overflowing public bins near Metro Station need urgent collection before the weekend crowd arrives.",
    location: "Metro Station Road, 4.4 km away",
    reward: "45 points on approval",
    status: "Pending",
    image:
      "https://images.unsplash.com/photo-1496247749665-49cf5b1022e9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    authority: "Water Board",
    handle: "@waterboard",
    category: "Water",
    caption:
      "Water leakage from the main pipeline is flooding the sidewalk near Green Park.",
    location: "Green Park, 7.1 km away",
    reward: "Reward points after approval",
    status: "In Review",
    image:
      "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 7,
    authority: "City Clean Squad",
    handle: "@citycleansquad",
    category: "Public Misconduct",
    caption:
      "Repeated littering outside the bus stop every evening. CCTV review could help identify violators.",
    location: "Central Bus Stop, 9.8 km away",
    reward: "5% fine share if verified",
    status: "Pending",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 8,
    authority: "Traffic Police",
    handle: "@trafficpolice",
    category: "Traffic",
    caption:
      "Illegal parking near the school gate is blocking the left lane during pickup hours.",
    location: "Scholars Avenue, 5.7 km away",
    reward: "5% fine share if verified",
    status: "Approved",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 9,
    authority: "Road Authority",
    handle: "@roadauthority",
    category: "Roads",
    caption:
      "Street surface has cracked badly after the last rain, making two-wheeler movement risky.",
    location: "Lakeview Main Road, 13.2 km away",
    reward: "Reward points after approval",
    status: "Pending",
    image:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 10,
    authority: "Waste Department",
    handle: "@wastedept",
    category: "Sanitation",
    caption:
      "Waste dumping has started again behind the market complex and needs regular monitoring.",
    location: "Old Market Backlane, 10.1 km away",
    reward: "55 points on approval",
    status: "In Review",
    image:
      "https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 11,
    authority: "Water Board",
    handle: "@waterboard",
    category: "Water",
    caption:
      "Low pressure supply in Sector 4 has continued for three mornings in a row.",
    location: "Sector 4, 14.6 km away",
    reward: "Reward points after approval",
    status: "Approved",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 12,
    authority: "City Clean Squad",
    handle: "@citycleansquad",
    category: "Public Misconduct",
    caption:
      "Public spitting near the clinic entrance is creating an unhygienic waiting area.",
    location: "Health Lane, 6.2 km away",
    reward: "5% fine share if verified",
    status: "Pending",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 13,
    authority: "Traffic Police",
    handle: "@trafficpolice",
    category: "Traffic",
    caption:
      "Signal timer is not visible from the second lane, causing sudden braking and confusion.",
    location: "Victory Chowk, 12.9 km away",
    reward: "Reward points after approval",
    status: "Pending",
    image:
      "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 14,
    authority: "Municipal Corporation",
    handle: "@municipalcorp",
    category: "Sanitation",
    caption:
      "Open drain near Park Street needs immediate covering before monsoon pickup intensifies.",
    location: "Park Street, 15.4 km away",
    reward: "Reward points after approval",
    status: "Approved",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
  },
];

const seededCoordinates = [
  [19.033, 72.846],
  [19.051, 72.829],
  [19.066, 72.851],
  [19.012, 72.871],
  [19.029, 72.817],
  [18.998, 72.839],
  [19.044, 72.876],
  [19.058, 72.811],
  [19.072, 72.835],
  [19.019, 72.859],
  [19.085, 72.848],
  [19.062, 72.864],
  [19.091, 72.823],
  [19.015, 72.892],
];

const seedPosts = fallbackPosts.map((post, index) => ({
  ...post,
  media_url: post.image,
  media_type: "image",
  latitude: seededCoordinates[index]?.[0] ?? null,
  longitude: seededCoordinates[index]?.[1] ?? null,
}));

function shuffleItems(items) {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[randomIndex]] = [clone[randomIndex], clone[index]];
  }
  return clone;
}

function mergePosts(primaryPosts, backupPosts) {
  const byCaption = new Set(primaryPosts.map((post) => post.caption));
  return [...primaryPosts, ...backupPosts.filter((post) => !byCaption.has(post.caption))];
}

function getMapEmbedUrl(latitude, longitude) {
  if (!latitude || !longitude) {
    return "https://www.openstreetmap.org/export/embed.html?bbox=72.80%2C18.90%2C72.92%2C19.06&layer=mapnik";
  }

  const left = longitude - 0.06;
  const right = longitude + 0.06;
  const top = latitude + 0.04;
  const bottom = latitude - 0.04;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(first, second) {
  if (!first.latitude || !first.longitude || !second.latitude || !second.longitude) {
    return null;
  }

  const earthRadius = 6371;
  const latDiff = toRadians(second.latitude - first.latitude);
  const lngDiff = toRadians(second.longitude - first.longitude);
  const start = toRadians(first.latitude);
  const end = toRadians(second.latitude);

  const a =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.sin(lngDiff / 2) * Math.sin(lngDiff / 2) * Math.cos(start) * Math.cos(end);

  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function readApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return {
    message: text.startsWith("<")
      ? "Backend returned an unexpected page. Restart CivicEye Launcher and try again."
      : text || "Unexpected server response.",
  };
}

function Sidebar({ active, onChange, onSignOut, user }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">CE</div>
        <div>
          <p className="brand-name">CivicEye</p>
          <p className="brand-tag">Civic social network</p>
        </div>
      </div>

      <div className="profile-card">
        <p className="profile-name">{user.name}</p>
        <p className="profile-email">{user.email}</p>
        <button type="button" className="signout-btn" onClick={onSignOut}>
          Sign out
        </button>
      </div>

      <nav className="menu">
        {menuItems.map((item) => (
          <button
            key={item}
            type="button"
            className={`menu-item ${active === item ? "menu-item-active" : ""}`}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="sidebar-card">
        <p className="sidebar-card-label">Coverage zone</p>
        <h3>50 km civic radius</h3>
        <p>
          Complaints and feeds are limited to nearby authorities and issues in
          your selected area.
        </p>
      </div>
    </aside>
  );
}

function PostCard({ post }) {
  const statusClass = `status-${post.status.toLowerCase().replace(/\s+/g, "-")}`;
  const mediaUrl = post.media_url || post.image;
  const mediaType = post.media_type || "image";

  return (
    <article className="post-card">
      <div className="post-header">
        <div>
          <p className="post-authority">{post.authority}</p>
          <p className="post-handle">
            {post.handle} | {post.category}
          </p>
        </div>
        <span className={`status-pill ${statusClass}`}>{post.status}</span>
      </div>

      {mediaType === "video" ? (
        <video className="post-image" controls src={mediaUrl} />
      ) : (
        <img className="post-image" src={mediaUrl} alt={post.caption} />
      )}

      <p className="post-caption">{post.caption}</p>

      <div className="post-meta">
        <span>{post.location}</span>
        <span>{post.reward}</span>
      </div>
    </article>
  );
}

function AuthScreen({ authMode, setAuthMode, form, setForm, onEmailAuth, onGoogleAuth, feedback }) {
  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-copy">
          <p className="eyebrow">Neighborhood accountability, redesigned</p>
          <h1>Report local issues like a social platform built for cities.</h1>
          <p className="auth-text">
            Citizens post civic complaints, tag the right authority, and track
            progress while staying inside a 50 km local zone.
          </p>
          <div className="auth-points">
            <span>Live civic feed</span>
            <span>Authority tagging</span>
            <span>Reward workflow</span>
            <span>Real nearby map</span>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${authMode === "signup" ? "auth-tab-active" : ""}`}
              onClick={() => setAuthMode("signup")}
            >
              Sign Up
            </button>
            <button
              type="button"
              className={`auth-tab ${authMode === "signin" ? "auth-tab-active" : ""}`}
              onClick={() => setAuthMode("signin")}
            >
              Sign In
            </button>
          </div>

          <p className="auth-card-title">
            {authMode === "signup" ? "Create your CivicEye account" : "Welcome back"}
          </p>

          {authMode === "signup" && (
            <input
              className="input"
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          )}

          <input
            className="input"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          {feedback.message && (
            <div className={`feedback-banner feedback-${feedback.type || "info"}`}>
              {feedback.message}
            </div>
          )}
          <button type="button" className="primary-btn" onClick={onEmailAuth}>
            {authMode === "signup" ? "Create account" : "Sign in with email"}
          </button>
          <button type="button" className="secondary-btn" onClick={onGoogleAuth}>
            Continue with Google
          </button>
          <p className="auth-note">
            Once you sign in on this device, CivicEye will remember your session
            so you do not need to log in again. Google is still a demo shortcut
            until OAuth credentials are added.
          </p>
        </div>
      </div>
    </div>
  );
}

function LocationSetup({ location, permissionState, onLocate, onContinue }) {
  const hasLocation = Boolean(location.latitude && location.longitude);

  return (
    <div className="auth-shell">
      <div className="onboarding-layout">
        <div className="onboarding-card">
          <div className="success-badge">Registration successful</div>
          <h2>Selecting your live civic zone</h2>
          <p>
            CivicEye now uses your real device location to limit visible posts
            and authorities to your nearby 50 km area.
          </p>

          <div className="location-actions">
            <button type="button" className="primary-btn" onClick={onLocate}>
              Use my live location
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={onContinue}
              disabled={!hasLocation}
            >
              Continue to app
            </button>
          </div>

          <p className="location-copy">
            {hasLocation
              ? `Location captured: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
              : permissionState === "denied"
                ? "Location access was denied. Allow browser location to continue."
                : "Allow location access to show nearby civic issues and local authorities."}
          </p>
        </div>

        <div className="map-panel">
          <div className="map-panel-head">
            <div>
              <p className="eyebrow">Live area preview</p>
              <h3>Your 50 km civic map</h3>
            </div>
            <span className="map-chip">Real-time location</span>
          </div>

          <iframe
            className="live-map"
            title="Live location map"
            src={getMapEmbedUrl(location.latitude, location.longitude)}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("Home");
  const [authMode, setAuthMode] = useState("signup");
  const [stage, setStage] = useState("auth");
  const [posts, setPosts] = useState(seedPosts);
  const [authorities, setAuthorities] = useState(fallbackAuthorities);
  const [isLoading, setIsLoading] = useState(true);
  const [serverMode, setServerMode] = useState("memory");
  const [permissionState, setPermissionState] = useState("idle");
  const [selectedCategory, setSelectedCategory] = useState("Roads");
  const [submitState, setSubmitState] = useState({ type: "", message: "" });
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [form, setForm] = useState({
    caption: "",
    authority: fallbackAuthorities[0].name,
    category: "Roads",
    mediaFile: null,
  });

  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    const savedLocation = localStorage.getItem(LOCATION_KEY);

    if (savedSession) {
      const sessionUser = JSON.parse(savedSession);
      setUser(sessionUser);
      setStage(savedLocation ? "app" : "location");
    }

    if (savedLocation) {
      setLocation(JSON.parse(savedLocation));
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [healthResponse, authoritiesResponse, postsResponse] = await Promise.all([
          fetch(`${API_BASE}/api/health`),
          fetch(`${API_BASE}/api/authorities`),
          fetch(`${API_BASE}/api/posts`),
        ]);

        if (!healthResponse.ok || !authoritiesResponse.ok || !postsResponse.ok) {
          throw new Error("API unavailable");
        }

        const health = await healthResponse.json();
        const authorityData = await authoritiesResponse.json();
        const postData = await postsResponse.json();

        setServerMode(health.mode || "memory");
        setAuthorities(authorityData.length ? authorityData : fallbackAuthorities);
        setPosts(mergePosts(postData, seedPosts));
        setForm((current) => ({
          ...current,
          authority: authorityData[0]?.name || current.authority,
        }));
      } catch {
        setSubmitState({
          type: "warning",
          message:
            "Backend not reachable yet. Showing demo data until the server starts.",
        });
        setPosts(seedPosts);
        setAuthorities(fallbackAuthorities);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const visiblePosts = useMemo(() => {
    if (!location.latitude || !location.longitude) {
      return posts;
    }

    return posts.filter((post) => {
      const distance = getDistanceKm(location, {
        latitude: Number(post.latitude),
        longitude: Number(post.longitude),
      });

      return distance === null || distance <= MAX_RADIUS_KM;
    });
  }, [posts, location]);

  const pendingPosts = useMemo(
    () => visiblePosts.filter((post) => post.status === "Pending" || post.status === "In Review"),
    [visiblePosts]
  );

  const categoryPosts = useMemo(() => {
    const matches = visiblePosts.filter((post) => post.category === selectedCategory);
    return matches.slice(0, 10);
  }, [visiblePosts, selectedCategory]);

  const homePosts = useMemo(() => shuffleItems(visiblePosts).slice(0, 12), [visiblePosts]);
  const recommendedAuthorities = useMemo(
    () => shuffleItems(authorities).slice(0, 6),
    [authorities]
  );

  const handleEmailAuth = async () => {
    try {
      const endpoint = authMode === "signup" ? "signup" : "signin";
      const payload =
        authMode === "signup"
          ? {
              name: authForm.name.trim(),
              email: authForm.email.trim(),
              password: authForm.password,
            }
          : {
              email: authForm.email.trim(),
              password: authForm.password,
            };

      const response = await fetch(`${API_BASE}/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await readApiResponse(response);
      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
      setUser(data.user);
      setStage(localStorage.getItem(LOCATION_KEY) ? "app" : "location");
      setSubmitState({
        type: "success",
        message:
          authMode === "signup"
            ? "Account created successfully."
            : "Signed in successfully.",
      });
    } catch (error) {
      setSubmitState({
        type: "error",
        message: error.message,
      });
    }
  };

  const handleGoogleAuth = () => {
    const nextUser = {
      name: "Google User",
      email: authForm.email.trim() || "google.user@example.com",
      provider: "google-demo",
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    setStage(localStorage.getItem(LOCATION_KEY) ? "app" : "location");
    setSubmitState({
      type: "success",
      message: "Google sign-in demo completed.",
    });
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setPermissionState("denied");
      return;
    }

    setPermissionState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        localStorage.setItem(LOCATION_KEY, JSON.stringify(nextLocation));
        setLocation(nextLocation);
        setPermissionState("granted");
      },
      () => {
        setPermissionState("denied");
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.caption.trim() || !form.mediaFile) {
      setSubmitState({
        type: "error",
        message: "Please add complaint details and select an image or video.",
      });
      return;
    }

    try {
      const payload = new FormData();
      payload.append("authority", form.authority);
      payload.append("caption", form.caption.trim());
      payload.append("category", form.category);
      payload.append("location", "Within your 50 km zone");
      payload.append("latitude", String(location.latitude || ""));
      payload.append("longitude", String(location.longitude || ""));
      payload.append("media", form.mediaFile);

      const response = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        body: payload,
      });

      const data = await readApiResponse(response);
      if (!response.ok) {
        throw new Error(data.message || "Failed to save");
      }

      setPosts((current) => [data, ...current]);
      setSubmitState({
        type: "success",
        message: "Complaint published successfully.",
      });
      setActive("Request Feed");
      setForm({
        caption: "",
        authority: authorities[0]?.name || fallbackAuthorities[0].name,
        category: "Roads",
        mediaFile: null,
      });
    } catch (error) {
      setSubmitState({
        type: "error",
        message: error.message || "Could not reach the backend. Start the server and try again.",
      });
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LOCATION_KEY);
    setUser(null);
    setLocation({
      latitude: null,
      longitude: null,
    });
    setStage("auth");
    setPermissionState("idle");
  };

  if (stage === "auth") {
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        form={authForm}
        setForm={setAuthForm}
        onEmailAuth={handleEmailAuth}
        onGoogleAuth={handleGoogleAuth}
        feedback={submitState}
      />
    );
  }

  if (stage === "location") {
    return (
      <LocationSetup
        location={location}
        permissionState={permissionState}
        onLocate={handleLocate}
        onContinue={() => setStage("app")}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        onChange={setActive}
        onSignOut={handleSignOut}
        user={user || { name: "Citizen", email: "" }}
      />

      <main className="content">
        <header className="hero-panel">
          <div>
            <p className="eyebrow">CivicEye dashboard</p>
            <h2>Report, track, and reward local civic action.</h2>
            <p className="hero-text">
              Your feed is limited to nearby requests and authority accounts inside
              a {MAX_RADIUS_KM} km radius from your live device location.
            </p>
          </div>
          <div className="hero-stats">
            <div>
              <strong>{visiblePosts.length}</strong>
              <span>Nearby posts</span>
            </div>
            <div>
              <strong>{authorities.length}</strong>
              <span>Recommended accounts</span>
            </div>
            <div>
              <strong>50 km</strong>
              <span>Nearby civic zone</span>
            </div>
          </div>
        </header>

        <div className="status-banner-row">
          <div className="mode-badge">
            Backend mode: <strong>{serverMode}</strong>
          </div>
          {isLoading && <div className="mode-badge">Loading live data...</div>}
          {location.latitude && (
            <div className="mode-badge">
              Location: {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}
            </div>
          )}
          {submitState.message && (
            <div className={`feedback-banner feedback-${submitState.type || "info"}`}>
              {submitState.message}
            </div>
          )}
        </div>

        {active === "Home" && (
          <section className="home-layout">
            <div className="panel">
              <div className="section-head">
                <h3>Recommended authorities</h3>
                <span>Like Instagram suggestions, but for local departments</span>
              </div>
              <div className="authority-grid">
                {recommendedAuthorities.map((authority) => (
                  <div key={authority.id} className="authority-card">
                    <div className="authority-avatar">{authority.name.slice(0, 2)}</div>
                    <div>
                      <p className="authority-name">{authority.name}</p>
                      <p className="authority-handle">
                        {authority.handle} | {authority.followers} followers
                      </p>
                    </div>
                    <span className="authority-chip">{authority.category}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="section-head">
                <h3>Nearby map</h3>
                <span>Live location preview like delivery apps</span>
              </div>
              <iframe
                className="live-map app-map"
                title="Nearby civic map"
                src={getMapEmbedUrl(location.latitude, location.longitude)}
                loading="lazy"
              />
            </div>

            <div className="panel full-panel">
              <div className="section-head">
                <h3>Random feed picks</h3>
                <span>Showing 10 to 12 posts from the nearby feed</span>
              </div>
              <div className="stack">
                {homePosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </section>
        )}

        {active === "Category" && (
          <section className="panel">
            <div className="section-head">
              <h3>Issue Categories</h3>
              <span>Each category opens 5 to 10 related civic posts</span>
            </div>

            <div className="category-tabs">
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`category-tab ${selectedCategory === category ? "category-tab-active" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="stack">
              {categoryPosts.length ? (
                categoryPosts.map((post) => <PostCard key={post.id} post={post} />)
              ) : (
                <div className="empty-state">No nearby posts found for this category yet.</div>
              )}
            </div>
          </section>
        )}

        {active === "Submit Complaint" && (
          <section className="panel">
            <div className="section-head">
              <h3>Submit a Complaint</h3>
              <span>Post it like a civic feed entry and tag the right authority</span>
            </div>
            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Issue category
                <select
                  className="input"
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                >
                  {categoryOptions.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label>
                Tag local authority
                <select
                  className="input"
                  value={form.authority}
                  onChange={(event) => setForm({ ...form, authority: event.target.value })}
                >
                  {authorities.map((authority) => (
                    <option key={authority.id}>{authority.name}</option>
                  ))}
                </select>
              </label>

              <label className="full-width">
                Upload photo or video
                <input
                  className="input file-input"
                  type="file"
                  accept="image/*,video/*"
                  onChange={(event) =>
                    setForm({
                      ...form,
                      mediaFile: event.target.files?.[0] || null,
                    })
                  }
                />
                <span className="file-note">
                  {form.mediaFile ? `Selected: ${form.mediaFile.name}` : "Choose one image or video file"}
                </span>
              </label>

              <label className="full-width">
                Caption / complaint details
                <textarea
                  className="input textarea"
                  placeholder="Describe the issue, location, and why it should be resolved."
                  value={form.caption}
                  onChange={(event) => setForm({ ...form, caption: event.target.value })}
                />
              </label>

              <div className="form-footer full-width">
                <p>
                  Reward is granted only after authority approval. Public
                  misconduct reports can unlock a 5% fine share if verified.
                </p>
                <button type="submit" className="primary-btn">
                  Publish Request
                </button>
              </div>
            </form>
          </section>
        )}

        {active === "Pending Requests" && (
          <section className="panel">
            <div className="section-head">
              <h3>Pending Requests</h3>
              <span>Complaints still waiting for authority action</span>
            </div>
            <div className="stack">
              {pendingPosts.length ? (
                pendingPosts.map((post) => <PostCard key={post.id} post={post} />)
              ) : (
                <div className="empty-state">No pending nearby requests right now.</div>
              )}
            </div>
          </section>
        )}

        {active === "Request Feed" && (
          <section className="panel">
            <div className="section-head">
              <h3>Request Feed</h3>
              <span>Total nearby feed posts: {visiblePosts.length}</span>
            </div>
            <div className="stack">
              {visiblePosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
