import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Users,
  CheckSquare,
  Lock,
  LogOut,
  Smile,
  ChevronRight,
  ChevronLeft,
  Palette,
  Mic,
  Trash2,
  Globe,
  Plus,
  MapPin,
  User,
  CheckCircle,
  LayoutDashboard,
  Clipboard,
  RefreshCw,
  Wifi,
  WifiOff,
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  AlertOctagon,
  ArrowLeft,
  Clock,
  Home,
  ShoppingCart,
  Settings,
  KeyRound,
  Baby,
  Repeat,
  Save,
  PieChart,
  BookOpen,
  Menu,
  X as CloseIcon,
  Edit2,
  XCircle,
  AlertCircle,
  UserPlus,
  UserMinus,
  ArrowUp,
  ArrowDown,
  ListChecks,
} from "lucide-react";

// Firebase Imports
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";

// --- CONFIGURATIE & FIREBASE ---
let firebaseConfig;

if (typeof __firebase_config !== "undefined") {
  firebaseConfig = JSON.parse(__firebase_config);
} else {
  firebaseConfig = {
    apiKey: "AIzaSyASpWTp5gsym3S0OXsbj8DVLX5hATABuBg",
    authDomain: "cp-app-final.firebaseapp.com",
    projectId: "cp-app-final",
    storageBucket: "cp-app-final.firebasestorage.app",
    messagingSenderId: "543451160778",
    appId: "1:543451160778:web:b7667edb254daf72e21433",
  };
}

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase config error:", error);
}

const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

// --- KLEURENPALET (OFFICIEEL CP) ---
const C = {
  Pine: "#045E51",
  Bark: "#7A5226",
  Lagoon: "#00192F",
  Sunset: "#700606",
  Grass: "#B1EDA6",
  Honey: "#FFCA55",
  Sky: "#9DB4F6",
  Blossom: "#FF699B",
  White: "#FFFFFF",
  Bg: "#F3F4F6",
};

// --- CONSTANTEN ---
// Default list if nothing in DB
const DEFAULT_STAFF_LIST = [
  "Maik",
  "Quincy",
  "Rens",
  "Mieke",
  "Daan",
  "Bo",
  "Eline",
  "Daphne",
  "Noor",
  "Louka",
  "Milou",
  "Kim",
  "Jeanine",
  "Amée",
  "Amara",
];
const LOCATIONS = ["Crea Atelier", "Podium Market Dome", "Overig"];

const ACTIVITY_OPTIONS = [
  "Kids Disco",
  "Voorleesverhaaltjes",
  "Op Avontuur...",
  "Natuurbingo",
  "Meet & Greet",
  "Show: de Muziekmachine",
  "Live Muziek",
  "Crazy Bingo Game",
  "Family Quiz Night",
  "DJ Night",
  "Walk-In Workshops",
  "Schminken",
  "Glittertattoo & Hairbeads",
  "Workshop: Nachtlampje",
  "Workshop: Maak je eigen Knuffel",
];

const ACTIVITY_TYPES = [
  {
    id: "crea",
    label: "Crea Atelier",
    bg: C.Sky,
    text: C.Lagoon,
    icon: Palette,
  },
  {
    id: "orry",
    label: "Orry & Friends",
    bg: C.Blossom,
    text: C.Sunset,
    icon: Baby,
  },
  { id: "ent", label: "Entertainment", bg: C.Honey, text: C.Bark, icon: Mic },
];

const BASE_ROLES = ["Orry", "Bing", "Woops", "Rep"];

const DAYS_OF_WEEK = [
  { id: 1, label: "Maandag" },
  { id: 2, label: "Dinsdag" },
  { id: 3, label: "Woensdag" },
  { id: 4, label: "Donderdag" },
  { id: 5, label: "Vrijdag" },
  { id: 6, label: "Zaterdag" },
  { id: 0, label: "Zondag" },
];

const NATIONALITIES = [
  { k: "nl", l: "Nederland", i: "🇳🇱", color: C.Honey },
  { k: "be_nl", l: "België (VL)", i: "🇧🇪", color: C.Sky },
  { k: "be_fr", l: "België (WA)", i: "🇧🇪", color: C.Lagoon },
  { k: "de", l: "Duitsland", i: "🇩🇪", color: C.Grass },
  { k: "fr", l: "Frankrijk", i: "🇫🇷", color: C.Blossom },
  { k: "en", l: "Engeland", i: "🇬🇧", color: C.Pine },
  { k: "ch", l: "Zwitserland", i: "🇨🇭", color: C.Sunset },
  { k: "other", l: "Overig", i: "🌍", color: C.Bark },
];

// --- DATA SANITIZER ---
const sanitizeData = (data) => {
  const safe = data || {};
  return {
    settings: safe.settings || { pin: "2412" },
    dailyStats: safe.dailyStats || {},
    schedule: Array.isArray(safe.schedule) ? safe.schedule : [],
    characters: Array.isArray(safe.characters) ? safe.characters : [],
    checklists: Array.isArray(safe.checklists) ? safe.checklists : [],
    checklistTemplates: safe.checklistTemplates || {},
    handover: safe.handover || {},
    hourCorrections: Array.isArray(safe.hourCorrections)
      ? safe.hourCorrections
      : [],
    orders: Array.isArray(safe.orders) ? safe.orders : [],
    staffList: Array.isArray(safe.staffList)
      ? safe.staffList
      : DEFAULT_STAFF_LIST,
    lastUpdate: safe.lastUpdate || new Date().toISOString(),
  };
};

const INITIAL_DATA = {
  settings: { pin: "2412" },
  dailyStats: {},
  schedule: [],
  characters: [],
  checklists: [],
  checklistTemplates: {},
  handover: {},
  hourCorrections: [],
  orders: [],
  staffList: DEFAULT_STAFF_LIST,
  lastUpdate: new Date().toISOString(),
};

// --- HELPERS ---
const toIsoDate = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

const toDutchDate = (dateObj) => {
  if (!dateObj) return "";
  return dateObj.toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 6) return "Goedenacht";
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
};

const getWeatherIcon = (code) => {
  if (code === 0) return { icon: Sun, desc: "Zon" };
  if (code >= 1 && code <= 3) return { icon: CloudSun, desc: "Bewolkt" };
  if (code >= 45 && code <= 48) return { icon: Cloud, desc: "Mist" };
  if (code >= 51 && code <= 67) return { icon: CloudRain, desc: "Regen" };
  if (code >= 71 && code <= 77) return { icon: CloudSnow, desc: "Sneeuw" };
  if (code >= 80 && code <= 82) return { icon: CloudRain, desc: "Buien" };
  if (code >= 95) return { icon: CloudLightning, desc: "Onweer" };
  return { icon: CloudSun, desc: "Wisselvallig" };
};

const getCharColorInfo = (role) => {
  const r = role.toLowerCase();
  if (r.includes("orry")) return { bg: C.Sunset, text: C.White }; // Rood
  if (r.includes("bing")) return { bg: C.Grass, text: C.Pine }; // Groen
  if (r.includes("woops")) return { bg: C.Sky, text: C.Lagoon }; // Blauw
  if (r.includes("rep")) return { bg: C.Honey, text: C.Bark }; // Geel
  return { bg: C.Bg, text: C.Bark };
};

// --- HOOKS ---
const useWeather = (date) => {
  const [weather, setWeather] = useState({
    temp: "--",
    desc: "...",
    icon: Cloud,
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const isoDate = toIsoDate(date);
        const url = `https://api.open-meteo.com/v1/forecast?latitude=51.4358&longitude=5.9706&daily=weather_code,temperature_2m_max&timezone=Europe%2FAmsterdam&start_date=${isoDate}&end_date=${isoDate}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.daily?.time?.length > 0) {
          const code = data.daily.weather_code[0];
          const temp = Math.round(data.daily.temperature_2m_max[0]);
          setWeather({ temp, ...getWeatherIcon(code) });
        } else {
          setWeather({ temp: 15, desc: "Geen data", icon: Cloud });
        }
      } catch (error) {
        setWeather({ temp: "--", desc: "Offline", icon: WifiOff });
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 3600000);
    return () => clearInterval(interval);
  }, [date]);

  return weather;
};

const useCurrentTime = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  return now;
};

// --- COMPONENTS ---

const Card = ({ children, className = "", borderColor = "transparent" }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border ${className}`}
    style={{ borderColor: borderColor }}
  >
    {children}
  </div>
);

const StatsWidget = ({ dailyStats, currentDay, onViewDetails }) => {
  const dateKey = toIsoDate(currentDay);
  const stats = dailyStats?.[dateKey] || { total: 0, breakdown: {} };

  if (!stats.total)
    return (
      <Card className="p-4 text-center text-gray-400 text-xs border-dashed h-full flex items-center justify-center">
        Nog geen bezetting bekend
      </Card>
    );

  return (
    <Card
      className="p-5 h-full flex flex-col animate-in fade-in"
      borderColor={C.Grass}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div
            className="p-3 rounded-xl mr-4"
            style={{ backgroundColor: C.Grass, color: C.Pine }}
          >
            <Users size={24} />
          </div>
          <div>
            <span
              className="text-xs uppercase font-bold tracking-wider"
              style={{ color: C.Pine }}
            >
              Aanwezige Gasten
            </span>
            <div
              className="text-3xl font-extrabold leading-none mt-1"
              style={{ color: C.Pine }}
            >
              {stats.total}
            </div>
          </div>
        </div>
        <div
          className="text-right text-xs font-bold px-2 py-1 rounded"
          style={{ backgroundColor: C.Grass, color: C.Pine }}
        >
          {toDutchDate(currentDay)}
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={onViewDetails}
          className="w-full py-3 font-bold rounded-xl text-sm flex items-center justify-center transition-colors group"
          style={{ backgroundColor: C.Grass, color: C.Pine }}
        >
          <PieChart size={16} className="mr-2" />
          Bekijk Bezetting & Nationaliteiten
        </button>
      </div>
    </Card>
  );
};

const OccupancyView = ({ dailyStats, currentDay }) => {
  const dateKey = toIsoDate(currentDay);
  const stats = dailyStats?.[dateKey] || {
    total: 0,
    breakdown: {},
    adults: 0,
    kids: 0,
    babies: 0,
    villas: 0,
  };
  const bd = stats.breakdown || {};

  if (!stats.total)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <PieChart
          size={48}
          className="mb-2 opacity-20"
          style={{ color: C.Pine }}
        />
        <p>Geen data voor deze dag</p>
      </div>
    );

  const StatCard = ({ icon: Icon, label, value, sub, bg, text }) => (
    <Card className="p-4 flex items-center">
      <div
        className="p-3 rounded-xl mr-4"
        style={{ backgroundColor: bg, color: text }}
      >
        <Icon size={24} />
      </div>
      <div>
        <p
          className="text-xs font-bold uppercase opacity-70"
          style={{ color: C.Bark }}
        >
          {label}
        </p>
        <p className="text-2xl font-extrabold" style={{ color: C.Bark }}>
          {value}
        </p>
        {sub && (
          <p className="text-xs opacity-60" style={{ color: C.Bark }}>
            {sub}
          </p>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <h2
        className="text-xl font-bold mb-4 flex items-center"
        style={{ color: C.Pine }}
      >
        <PieChart className="mr-2" /> Bezetting Details
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={Users}
          label="Totaal"
          value={stats.total}
          bg={C.Pine}
          text={C.Grass}
        />
        <StatCard
          icon={Home}
          label="Huisjes"
          value={stats.villas || "?"}
          sub="bezet"
          bg={C.Lagoon}
          text={C.Sky}
        />
        <StatCard
          icon={User}
          label="Volwassenen"
          value={stats.adults || 0}
          bg={C.Bark}
          text={C.Honey}
        />
        <StatCard
          icon={Smile}
          label="Kinderen"
          value={stats.kids || 0}
          bg={C.Sunset}
          text={C.Blossom}
        />
        <StatCard
          icon={Baby}
          label="Baby's"
          value={stats.babies || 0}
          bg={C.Blossom}
          text={C.Sunset}
        />
      </div>

      <Card className="overflow-hidden">
        <div
          className="px-4 py-3 border-b font-bold text-sm"
          style={{
            backgroundColor: C.Grass,
            color: C.Pine,
            borderColor: C.Pine,
          }}
        >
          Nationaliteiten
        </div>
        <div className="divide-y" style={{ borderColor: C.Grass }}>
          {NATIONALITIES.map((nat) => {
            const count = bd[nat.k] || 0;
            const percent =
              stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
            return (
              <div
                key={nat.k}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{nat.i}</span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: C.Bark }}
                  >
                    {nat.l}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className="block text-sm font-bold"
                    style={{ color: C.Pine }}
                  >
                    {count}
                  </span>
                  <span className="block text-[10px]" style={{ color: C.Bark }}>
                    {percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

const HandoverView = ({ currentDay, appData, updateData }) => {
  const dateKey = toIsoDate(currentDay);
  const dayData = appData.handover?.[dateKey] || {
    ent: { names: "", text: "" },
    crea: { names: "", text: "" },
  };

  const [entData, setEntData] = useState(dayData.ent);
  const [creaData, setCreaData] = useState(dayData.crea);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const current = appData.handover?.[dateKey] || {
      ent: { names: "", text: "" },
      crea: { names: "", text: "" },
    };
    setEntData(current.ent);
    setCreaData(current.crea);
  }, [dateKey, appData.handover]);

  const handleSave = async () => {
    setIsSaving(true);
    const newHandover = {
      ...appData.handover,
      [dateKey]: {
        ent: entData,
        crea: creaData,
      },
    };
    await updateData({ handover: newHandover });
    setIsSaving(false);
  };

  const addName = (type, val) => {
    if (!val) return;
    if (type === "ent") {
      const current = entData.names
        ? entData.names.split(", ").filter(Boolean)
        : [];
      if (!current.includes(val)) {
        const newNames = [...current, val].join(", ");
        setEntData({ ...entData, names: newNames });
      }
    } else {
      const current = creaData.names
        ? creaData.names.split(", ").filter(Boolean)
        : [];
      if (!current.includes(val)) {
        const newNames = [...current, val].join(", ");
        setCreaData({ ...creaData, names: newNames });
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex justify-between items-center">
        <h2
          className="text-xl font-bold flex items-center"
          style={{ color: C.Pine }}
        >
          <BookOpen className="mr-2" /> Overdracht
        </h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 rounded-lg font-bold text-sm flex items-center shadow-sm disabled:opacity-50 transition-colors"
          style={{ backgroundColor: C.Pine, color: C.Grass }}
        >
          {isSaving ? (
            <RefreshCw className="animate-spin mr-2" size={16} />
          ) : (
            <Save className="mr-2" size={16} />
          )}
          Opslaan
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card
          className="overflow-hidden border-t-4"
          borderColor={C.Bark}
          style={{ borderTopColor: C.Bark }}
        >
          <div
            className="p-3 border-b flex items-center gap-2 font-bold"
            style={{
              backgroundColor: C.Honey,
              color: C.Bark,
              borderColor: C.Bark,
            }}
          >
            <Mic size={18} /> Entertainment
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label
                className="block text-[10px] uppercase font-bold mb-1"
                style={{ color: C.Bark }}
              >
                Medewerkers
              </label>
              <div className="flex gap-2 mb-2">
                <select
                  className="w-full border rounded-lg p-2 text-sm outline-none bg-white"
                  style={{ borderColor: C.Honey, color: C.Bark }}
                  onChange={(e) => {
                    addName("ent", e.target.value);
                    e.target.value = "";
                  }}
                >
                  <option value="">+ Voeg medewerker toe</option>
                  {appData.staffList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="Handmatige invoer..."
                className="w-full border rounded-lg p-2 text-sm outline-none"
                style={{ borderColor: C.Honey, color: C.Bark }}
                value={entData.names}
                onChange={(e) =>
                  setEntData({ ...entData, names: e.target.value })
                }
              />
            </div>
            <div>
              <label
                className="block text-[10px] uppercase font-bold mb-1"
                style={{ color: C.Bark }}
              >
                Bijzonderheden
              </label>
              <textarea
                className="w-full border rounded-lg p-3 text-sm h-40 resize-none outline-none"
                style={{ borderColor: C.Honey, color: C.Bark }}
                placeholder="Bijzonderheden, vul ze hier in..."
                value={entData.text}
                onChange={(e) =>
                  setEntData({ ...entData, text: e.target.value })
                }
              />
            </div>
          </div>
        </Card>

        <Card
          className="overflow-hidden border-t-4"
          borderColor={C.Lagoon}
          style={{ borderTopColor: C.Lagoon }}
        >
          <div
            className="p-3 border-b flex items-center gap-2 font-bold"
            style={{
              backgroundColor: C.Sky,
              color: C.Lagoon,
              borderColor: C.Lagoon,
            }}
          >
            <Palette size={18} /> Crea Atelier
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label
                className="block text-[10px] uppercase font-bold mb-1"
                style={{ color: C.Lagoon }}
              >
                Medewerkers
              </label>
              <div className="flex gap-2 mb-2">
                <select
                  className="w-full border rounded-lg p-2 text-sm outline-none bg-white"
                  style={{ borderColor: C.Sky, color: C.Lagoon }}
                  onChange={(e) => {
                    addName("crea", e.target.value);
                    e.target.value = "";
                  }}
                >
                  <option value="">+ Voeg medewerker toe</option>
                  {appData.staffList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="Handmatige invoer..."
                className="w-full border rounded-lg p-2 text-sm outline-none"
                style={{ borderColor: C.Sky, color: C.Lagoon }}
                value={creaData.names}
                onChange={(e) =>
                  setCreaData({ ...creaData, names: e.target.value })
                }
              />
            </div>
            <div>
              <label
                className="block text-[10px] uppercase font-bold mb-1"
                style={{ color: C.Lagoon }}
              >
                Bijzonderheden
              </label>
              <textarea
                className="w-full border rounded-lg p-3 text-sm h-40 resize-none outline-none"
                style={{ borderColor: C.Sky, color: C.Lagoon }}
                placeholder="Bijzonderheden, vul ze hier in..."
                value={creaData.text}
                onChange={(e) =>
                  setCreaData({ ...creaData, text: e.target.value })
                }
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const SidebarItem = ({ id, icon: Icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-4 py-3 rounded-xl mb-1 transition-all`}
    style={{
      backgroundColor: active ? C.Grass : "transparent",
      color: active ? C.Pine : C.Grass,
      fontWeight: active ? "bold" : "normal",
    }}
  >
    <Icon size={20} className="mr-3" />
    {label}
  </button>
);

const CalendarModal = ({ currentDate, onClose, onSelect }) => {
  const [viewDate, setViewDate] = useState(currentDate);
  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1
  ).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const changeMonth = (delta) => {
    const newD = new Date(viewDate);
    newD.setMonth(newD.getMonth() + delta);
    setViewDate(newD);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-xs overflow-hidden animate-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-3 flex justify-between items-center"
          style={{ backgroundColor: C.Pine, color: C.Grass }}
        >
          <button
            onClick={() => changeMonth(-1)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold capitalize text-sm">
            {viewDate.toLocaleDateString("nl-NL", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="p-3">
          <div
            className="grid grid-cols-7 text-center text-[10px] font-bold mb-2"
            style={{ color: C.Bark }}
          >
            {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[...Array(startOffset)].map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {[...Array(daysInMonth)].map((_, i) => {
              const dayNum = i + 1;
              const thisDate = new Date(
                viewDate.getFullYear(),
                viewDate.getMonth(),
                dayNum
              );
              const isSelected = toIsoDate(thisDate) === toIsoDate(currentDate);
              return (
                <button
                  key={dayNum}
                  onClick={() => onSelect(thisDate)}
                  className="aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: isSelected ? C.Pine : "transparent",
                    color: isSelected ? C.Grass : C.Bark,
                    fontWeight: isSelected ? "bold" : "normal",
                  }}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => onSelect(new Date())}
          className="w-full p-3 border-t text-xs font-bold hover:opacity-80"
          style={{
            backgroundColor: C.Grass,
            color: C.Pine,
            borderColor: C.Pine,
          }}
        >
          Vandaag
        </button>
      </Card>
    </div>
  );
};

const AdminContainer = ({
  title,
  children,
  backAction,
  currentDay,
  onPrev,
  onNext,
  onCalendar,
}) => (
  <div
    className="rounded-2xl shadow-sm border overflow-hidden max-w-4xl mx-auto animate-in slide-in-from-bottom-4 h-full flex flex-col"
    style={{ backgroundColor: C.White, borderColor: C.Grass }}
  >
    <div
      className="p-4 border-b flex items-center gap-3 sticky top-0 z-20"
      style={{ backgroundColor: C.White, borderColor: C.Grass }}
    >
      <button
        onClick={backAction}
        className="p-2 border rounded-lg shadow-sm transition-colors flex items-center gap-1"
        style={{ borderColor: C.Pine, color: C.Pine }}
      >
        <ArrowLeft size={16} />
        <span className="text-xs font-bold uppercase">Dashboard</span>
      </button>
      <h2 className="font-bold text-lg" style={{ color: C.Pine }}>
        {title}
      </h2>
      <div className="ml-auto flex items-center bg-gray-100 rounded-lg p-1">
        <button onClick={onPrev} className="p-1 hover:bg-white rounded">
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={onCalendar}
          className="px-2 text-xs font-bold min-w-[100px] text-center"
        >
          {toDutchDate(currentDay)}
        </button>
        <button onClick={onNext} className="p-1 hover:bg-white rounded">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
    <div className="p-4 overflow-y-auto flex-1 pb-24">{children}</div>
  </div>
);

const NotificationBadge = ({ count }) => {
  if (!count || count === 0) return null;
  return (
    <span
      className="absolute -top-1 -right-1 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 shadow-sm"
      style={{
        backgroundColor: C.Sunset,
        color: C.Blossom,
        borderColor: C.White,
      }}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
};

// Content component for Task Templates
const TaskTemplatesContent = ({ appData, updateData, currentDay }) => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [viewDay, setViewDay] = useState(1); // Default Maandag
  const [tab, setTab] = useState("entertainment");
  const [newItemText, setNewItemText] = useState("");
  const templates = appData.checklistTemplates || {};

  const toggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const addTemplateItem = () => {
    if (!newItemText.trim() || selectedDays.length === 0) {
      alert("Vul een taak in en selecteer ten minste één dag.");
      return;
    }

    let newTemplates = { ...templates };
    let newChecklists = [...appData.checklists]; // Clone active lists
    const currentIsoDate = toIsoDate(currentDay);
    const currentDayId = currentDay.getDay();

    selectedDays.forEach((dayId) => {
      // 1. Update Template
      const dayTemplates = newTemplates[dayId] || {
        entertainment: [],
        crea: [],
      };
      const currentList = dayTemplates[tab] || [];
      newTemplates[dayId] = {
        ...dayTemplates,
        [tab]: [...currentList, newItemText.trim()],
      };

      // 2. Sync with Active List (if modifying today's template)
      if (dayId === currentDayId) {
        newChecklists.push({
          id: Date.now() + Math.random(),
          text: newItemText.trim(),
          type: tab,
          done: false,
          date: currentIsoDate,
        });
      }
    });

    updateData({ checklistTemplates: newTemplates, checklists: newChecklists });
    setNewItemText("");
    setSelectedDays([]);
    // Alert optional, maybe toast?
  };

  const removeTemplateItem = (dayId, index) => {
    const dayTemplates = templates[dayId] || { entertainment: [], crea: [] };
    const currentList = dayTemplates[tab] || [];
    const itemToRemove = currentList[index];

    // 1. Update Template
    const updatedList = currentList.filter((_, i) => i !== index);
    const newTemplates = {
      ...templates,
      [dayId]: { ...dayTemplates, [tab]: updatedList },
    };

    // 2. Sync with Active List (if modifying today's template)
    let newChecklists = [...appData.checklists];
    const currentIsoDate = toIsoDate(currentDay);

    if (dayId === currentDay.getDay()) {
      // Find index of a task that matches date, type, and text
      // We remove only one instance to be safe
      const taskIndex = newChecklists.findIndex(
        (t) =>
          t.date === currentIsoDate && t.type === tab && t.text === itemToRemove
      );

      if (taskIndex > -1) {
        newChecklists.splice(taskIndex, 1);
      }
    }

    updateData({ checklistTemplates: newTemplates, checklists: newChecklists });
  };

  const moveTemplateItem = (dayId, index, direction) => {
    const dayTemplates = templates[dayId] || { entertainment: [], crea: [] };
    const currentList = [...(dayTemplates[tab] || [])]; // Clone list

    if (index + direction < 0 || index + direction >= currentList.length)
      return;

    // Swap elements
    [currentList[index], currentList[index + direction]] = [
      currentList[index + direction],
      currentList[index],
    ];

    const newTemplates = {
      ...templates,
      [dayId]: { ...dayTemplates, [tab]: currentList },
    };

    updateData({ checklistTemplates: newTemplates });
  };

  const currentViewList = templates[viewDay]?.[tab] || [];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex mb-6 border-b" style={{ borderColor: C.Grass }}>
        <button
          onClick={() => setTab("entertainment")}
          className={`flex-1 pb-2 text-sm font-bold border-b-2 transition-colors`}
          style={{
            borderColor: tab === "entertainment" ? C.Pine : "transparent",
            color: tab === "entertainment" ? C.Pine : C.Bark,
          }}
        >
          Entertainment
        </button>
        <button
          onClick={() => setTab("crea")}
          className={`flex-1 pb-2 text-sm font-bold border-b-2 transition-colors`}
          style={{
            borderColor: tab === "crea" ? C.Pine : "transparent",
            color: tab === "crea" ? C.Pine : C.Bark,
          }}
        >
          Crea
        </button>
      </div>

      {/* SECTION 1: ADD NEW */}
      <Card className="p-4 bg-gray-50" borderColor={C.Grass}>
        <h3
          className="font-bold text-sm mb-3 flex items-center"
          style={{ color: C.Pine }}
        >
          <Plus size={16} className="mr-2" /> Nieuwe Taak Toevoegen
        </h3>

        <input
          type="text"
          placeholder={`Typ taak voor ${tab}...`}
          className="w-full border p-3 rounded-xl text-sm shadow-sm outline-none mb-3 bg-white"
          style={{ borderColor: C.Grass }}
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
        />

        <p className="text-xs font-bold mb-2" style={{ color: C.Bark }}>
          Selecteer dagen om aan toe te voegen:
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.id}
              onClick={() => toggleDay(day.id)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors border`}
              style={{
                backgroundColor: selectedDays.includes(day.id)
                  ? C.Pine
                  : C.White,
                color: selectedDays.includes(day.id) ? C.Grass : C.Pine,
                borderColor: C.Pine,
              }}
            >
              {day.label.substring(0, 2)}
            </button>
          ))}
        </div>

        <button
          onClick={addTemplateItem}
          className="w-full py-3 rounded-xl font-bold shadow-sm flex justify-center items-center text-sm"
          style={{ backgroundColor: C.Pine, color: C.Grass }}
        >
          Toevoegen
        </button>
      </Card>

      {/* SECTION 2: VIEW/EDIT LIST */}
      <div>
        <div
          className="flex justify-between items-end mb-2 border-b pb-1"
          style={{ borderColor: C.Grass }}
        >
          <h3 className="font-bold text-sm" style={{ color: C.Pine }}>
            Bekijk & Bewerk Lijst
          </h3>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-4 gap-2 no-scrollbar">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.id}
              onClick={() => setViewDay(day.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors`}
              style={{
                backgroundColor: viewDay === day.id ? C.Pine : C.Grass,
                color: viewDay === day.id ? C.Grass : C.Pine,
              }}
            >
              {day.label}
            </button>
          ))}
        </div>

        <div className="space-y-2 min-h-[100px]">
          {currentViewList.length === 0 ? (
            <div className="text-center py-8 italic text-xs text-gray-400 border border-dashed rounded-xl">
              Geen taken voor deze dag.
            </div>
          ) : (
            currentViewList.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 bg-white rounded-xl border shadow-sm animate-in fade-in slide-in-from-bottom-2"
                style={{ borderColor: C.Grass }}
              >
                <span className="font-medium text-sm" style={{ color: C.Bark }}>
                  {item}
                </span>
                <div className="flex items-center gap-1">
                  <div className="flex flex-col mr-2">
                    <button
                      onClick={() => moveTemplateItem(viewDay, idx, -1)}
                      disabled={idx === 0}
                      className={`p-0.5 rounded hover:bg-gray-100 ${
                        idx === 0 ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveTemplateItem(viewDay, idx, 1)}
                      disabled={idx === currentViewList.length - 1}
                      className={`p-0.5 rounded hover:bg-gray-100 ${
                        idx === currentViewList.length - 1
                          ? "text-gray-300"
                          : "text-gray-500"
                      }`}
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeTemplateItem(viewDay, idx)}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors"
                    style={{ color: C.Sunset }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Content component for Daily Tasks
const DailyTasksContent = ({
  currentDay,
  todaysChecklists,
  newTask,
  setNewTask,
  updateData,
  appData,
  addTask,
  deleteTask,
}) => {
  const [tab, setTab] = useState("entertainment");
  const tasks = todaysChecklists[tab];

  const moveTask = (index, direction) => {
    if (index + direction < 0 || index + direction >= tasks.length) return;

    // Get the two tasks involved from the filtered view
    const taskA = tasks[index];
    const taskB = tasks[index + direction];

    // Create a copy of the global list
    const newChecklists = [...appData.checklists];

    // Find their indices in the global list
    const indexA = newChecklists.findIndex((t) => t.id === taskA.id);
    const indexB = newChecklists.findIndex((t) => t.id === taskB.id);

    // Swap in global list
    [newChecklists[indexA], newChecklists[indexB]] = [
      newChecklists[indexB],
      newChecklists[indexA],
    ];

    updateData({ checklists: newChecklists });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex mb-4 border-b" style={{ borderColor: C.Grass }}>
        <button
          onClick={() => setTab("entertainment")}
          className={`flex-1 pb-2 text-sm font-bold border-b-2`}
          style={{
            borderColor: tab === "entertainment" ? C.Pine : "transparent",
            color: tab === "entertainment" ? C.Pine : C.Bark,
          }}
        >
          Entertainment
        </button>
        <button
          onClick={() => setTab("crea")}
          className={`flex-1 pb-2 text-sm font-bold border-b-2`}
          style={{
            borderColor: tab === "crea" ? C.Pine : "transparent",
            color: tab === "crea" ? C.Pine : C.Bark,
          }}
        >
          Crea
        </button>
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nieuwe taak voor vandaag..."
          className="flex-1 border p-2 rounded-lg text-sm"
          style={{ borderColor: C.Grass }}
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button
          onClick={() => addTask(tab)}
          className="px-4 rounded-lg font-bold"
          style={{ backgroundColor: C.Pine, color: C.Grass }}
        >
          <Plus />
        </button>
      </div>
      <div className="space-y-2">
        {tasks.map((task, idx) => (
          <div
            key={task.id}
            className="flex justify-between items-center p-3 bg-white rounded-xl border text-sm shadow-sm"
            style={{ borderColor: C.Grass }}
          >
            <span style={{ color: C.Bark }}>{task.text}</span>
            <div className="flex gap-1 items-center">
              <button
                onClick={() => moveTask(idx, -1)}
                disabled={idx === 0}
                className={`p-1 rounded hover:bg-gray-100 ${
                  idx === 0 ? "text-gray-300" : "text-gray-500"
                }`}
              >
                <ArrowUp size={16} />
              </button>
              <button
                onClick={() => moveTask(idx, 1)}
                disabled={idx === tasks.length - 1}
                className={`p-1 rounded hover:bg-gray-100 ${
                  idx === tasks.length - 1 ? "text-gray-300" : "text-gray-500"
                }`}
              >
                <ArrowDown size={16} />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                style={{ color: C.Sunset }}
                className="p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 italic text-gray-400 text-xs">
            Geen taken voor vandaag.
          </div>
        )}
      </div>
    </div>
  );
};

// NEW: Combined Task Manager View
const AdminTasksView = ({
  currentDay,
  onPrev,
  onNext,
  onCalendar,
  backAction,
  todaysChecklists,
  newTask,
  setNewTask,
  updateData,
  appData,
  addTask,
  deleteTask,
}) => {
  const [viewMode, setViewMode] = useState("daily"); // 'daily' or 'templates'

  return (
    <AdminContainer
      title="Takenbeheer"
      backAction={backAction}
      currentDay={currentDay}
      onPrev={onPrev}
      onNext={onNext}
      onCalendar={onCalendar}
    >
      <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
        <button
          onClick={() => setViewMode("daily")}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            viewMode === "daily"
              ? "bg-white shadow text-teal-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Daglijst ({toDutchDate(currentDay)})
        </button>
        <button
          onClick={() => setViewMode("templates")}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            viewMode === "templates"
              ? "bg-white shadow text-teal-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Sjablonen
        </button>
      </div>

      {viewMode === "daily" ? (
        <DailyTasksContent
          currentDay={currentDay}
          todaysChecklists={todaysChecklists}
          newTask={newTask}
          setNewTask={setNewTask}
          updateData={updateData}
          appData={appData}
          addTask={addTask}
          deleteTask={deleteTask}
        />
      ) : (
        <TaskTemplatesContent
          appData={appData}
          updateData={updateData}
          currentDay={currentDay}
        />
      )}
    </AdminContainer>
  );
};

const AdminMenu = ({
  setAdminSubView,
  resetAllData,
  setView,
  handleLogout,
  appData,
}) => {
  const safeData = appData || {};
  const openHoursCount = (safeData.hourCorrections || []).filter(
    (h) => !h.processed
  ).length;
  const openOrdersCount = (safeData.orders || []).filter(
    (o) => o.status === "open"
  ).length;

  const MenuButton = ({
    onClick,
    icon: Icon,
    label,
    iconBg,
    iconColor,
    badge,
  }) => (
    <button
      onClick={onClick}
      className="bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between transition-all group"
      style={{ borderColor: C.Grass }}
    >
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg relative"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <Icon size={20} />
          {badge}
        </div>
        <span className="font-bold" style={{ color: C.Bark }}>
          {label}
        </span>
      </div>
      <ChevronRight size={18} style={{ color: C.Grass }} />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-4">
      <div
        className="border rounded-xl p-4 mb-6 flex items-center"
        style={{ backgroundColor: C.Grass, borderColor: C.Pine }}
      >
        <Lock className="mr-3" size={24} style={{ color: C.Pine }} />
        <div>
          <h3 className="font-bold" style={{ color: C.Pine }}>
            Floormanager
          </h3>
          <p className="text-xs" style={{ color: C.Pine }}>
            Kids & Entertainment
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <MenuButton
          onClick={() => setAdminSubView("edit_stats")}
          icon={Globe}
          label="Gasten & Bezetting"
          iconBg={C.Sky}
          iconColor={C.Lagoon}
        />
        <MenuButton
          onClick={() => setAdminSubView("edit_schedule")}
          icon={CalendarIcon}
          label="Programma"
          iconBg={C.Grass}
          iconColor={C.Pine}
        />
        <MenuButton
          onClick={() => setAdminSubView("edit_chars")}
          icon={Smile}
          label="Karakters"
          iconBg={C.Honey}
          iconColor={C.Bark}
        />
        <MenuButton
          onClick={() => setAdminSubView("manage_tasks")}
          icon={ListChecks}
          label="Taken & Sjablonen"
          iconBg={C.Blossom}
          iconColor={C.Sunset}
        />
        <MenuButton
          onClick={() => setAdminSubView("edit_hours")}
          icon={Clock}
          label="Uren Verwerken"
          iconBg={C.Blossom}
          iconColor={C.Sunset}
          badge={<NotificationBadge count={openHoursCount} />}
        />
        <MenuButton
          onClick={() => setAdminSubView("edit_orders")}
          icon={ShoppingCart}
          label="Bestellingen"
          iconBg={C.Honey}
          iconColor={C.Bark}
          badge={<NotificationBadge count={openOrdersCount} />}
        />
        <MenuButton
          onClick={() => setAdminSubView("settings")}
          icon={Settings}
          label="Instellingen & Team"
          iconBg={C.Bg}
          iconColor={C.Bark}
        />
      </div>
      <div className="pt-6 flex flex-col gap-2 pb-20">
        <button
          onClick={() => setView("dashboard")}
          className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
          style={{ backgroundColor: C.Pine, color: C.Grass }}
        >
          <ArrowLeft size={18} /> Terug naar App
        </button>
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl font-bold border"
          style={{
            backgroundColor: C.Blossom,
            color: C.Sunset,
            borderColor: C.Sunset,
          }}
        >
          Uitloggen
        </button>
      </div>
    </div>
  );
};

const EditSettings = ({
  appData,
  updateData,
  setAdminSubView,
  resetAllData,
}) => {
  const [newPin, setNewPin] = useState(appData.settings?.pin || "2412");
  const [newStaffName, setNewStaffName] = useState("");

  const savePin = () => {
    if (newPin.length < 4) return alert("PIN moet minimaal 4 cijfers zijn.");
    updateData({ settings: { ...appData.settings, pin: newPin } });
    alert("PIN gewijzigd!");
  };

  const addStaff = () => {
    if (!newStaffName.trim()) return;
    if (appData.staffList.includes(newStaffName.trim()))
      return alert("Bestaat al!");
    updateData({ staffList: [...appData.staffList, newStaffName.trim()] });
    setNewStaffName("");
  };

  const removeStaff = (name) => {
    if (confirm(`Weet je zeker dat je ${name} wilt verwijderen?`)) {
      updateData({
        staffList: appData.staffList.filter((s) => s !== name),
      });
    }
  };

  return (
    <AdminContainer
      title="Instellingen"
      backAction={() => setAdminSubView("menu")}
    >
      <div className="space-y-6">
        <Card className="p-4" borderColor={C.Grass}>
          <h3
            className="font-bold mb-3 flex items-center"
            style={{ color: C.Pine }}
          >
            <KeyRound size={18} className="mr-2" /> FM Pincode Wijzigen
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              className="border p-2 rounded-lg w-full"
              style={{ borderColor: C.Grass }}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
            />
            <button
              onClick={savePin}
              className="px-4 rounded-lg font-bold"
              style={{ backgroundColor: C.Pine, color: C.Grass }}
            >
              Opslaan
            </button>
          </div>
        </Card>

        <Card className="p-4" borderColor={C.Grass}>
          <h3
            className="font-bold mb-3 flex items-center"
            style={{ color: C.Pine }}
          >
            <Users size={18} className="mr-2" /> Medewerkers Beheer
          </h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Naam medewerker..."
              className="border p-2 rounded-lg w-full text-sm"
              style={{ borderColor: C.Grass }}
              value={newStaffName}
              onChange={(e) => setNewStaffName(e.target.value)}
            />
            <button
              onClick={addStaff}
              className="px-3 rounded-lg font-bold"
              style={{ backgroundColor: C.Pine, color: C.Grass }}
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-2">
            {appData.staffList.sort().map((staff) => (
              <div
                key={staff}
                className="flex justify-between items-center p-2 bg-gray-50 rounded border text-sm"
              >
                <span>{staff}</span>
                <button
                  onClick={() => removeStaff(staff)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <div
          className="p-4 rounded-xl border"
          style={{ backgroundColor: C.Blossom, borderColor: C.Sunset }}
        >
          <h3 className="font-bold mb-2" style={{ color: C.Sunset }}>
            Gevarenzone
          </h3>
          <p className="text-xs mb-4" style={{ color: C.Sunset }}>
            Hiermee wis je alle data van de hele app. Dit kan niet ongedaan
            gemaakt worden.
          </p>
          <button
            onClick={resetAllData}
            className="w-full py-3 border text-sm font-bold rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: C.White,
              borderColor: C.Sunset,
              color: C.Sunset,
            }}
          >
            <Trash2 size={16} className="mr-2" /> Reset Volledige Database
          </button>
        </div>
      </div>
    </AdminContainer>
  );
};

const EditStats = ({
  appData,
  updateData,
  setAdminSubView,
  currentDay,
  onPrev,
  onNext,
  onCalendar,
}) => {
  const [excelInput, setExcelInput] = useState("");
  const [showImport, setShowImport] = useState(false);
  const dateKey = toIsoDate(currentDay);
  const currentStats = appData.dailyStats?.[dateKey] || {
    total: 0,
    breakdown: {},
  };
  const bd = currentStats.breakdown || {};

  const updateStat = (field, value) => {
    const newStats = { ...appData.dailyStats };
    if (!newStats[dateKey]) newStats[dateKey] = { total: 0, breakdown: {} };
    if (field === "total") {
      newStats[dateKey].total = parseInt(value) || 0;
    } else {
      newStats[dateKey].breakdown = {
        ...newStats[dateKey].breakdown,
        [field]: parseInt(value) || 0,
      };
    }
    updateData({ dailyStats: newStats });
  };

  const parseArrproCSV = (text) => {
    const newStats = { ...appData.dailyStats };
    let count = 0;
    const lines = text.split(/\r\n|\n/);

    lines.forEach((line) => {
      const dateMatch = line.trim().match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
      if (dateMatch) {
        let [_, day, month, year] = dateMatch;
        if (year.length === 2) year = "20" + year;
        const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
          2,
          "0"
        )}`;
        const contentWithoutDate = line.replace(dateMatch[0], "");
        const numbers = contentWithoutDate.match(/[\d,.]+/g);

        if (numbers && numbers.length >= 10) {
          const ints = numbers.map((n) => {
            if (n.includes(",") && n.length < 6) return 0;
            return parseInt(n.replace(/\./g, "").replace(/,/g, "")) || 0;
          });

          let totalIndex = -1;
          for (let i = ints.length - 1; i >= 4; i--) {
            const total = ints[i];
            const babies = ints[i - 1];
            const kids = ints[i - 2];
            const adults = ints[i - 3];
            if (Math.abs(adults + kids + babies - total) <= 5 && total > 0) {
              totalIndex = i;
              break;
            }
          }

          if (totalIndex !== -1) {
            const total = ints[totalIndex];
            const babies = ints[totalIndex - 1];
            const kids = ints[totalIndex - 2];
            const adults = ints[totalIndex - 3];
            const villas =
              ints.length > totalIndex + 1 ? ints[totalIndex + 1] : 0;
            const otherIndex = totalIndex - 5;
            const other = ints[otherIndex];
            const nl = ints[0];
            const bn = ints[2];
            const bf = ints[4];
            const de = ints[6];
            const startVar = 8;
            const endVar = otherIndex;
            const varValues = [];
            for (let k = startVar; k < endVar; k += 2) {
              varValues.push(ints[k]);
            }
            let ch = 0,
              gb = 0,
              fr = 0;
            if (varValues.length === 3) {
              [ch, gb, fr] = varValues;
            } else if (varValues.length === 2) {
              [gb, fr] = varValues;
            } else if (varValues.length === 1) {
              [fr] = varValues;
            }
            newStats[isoDate] = {
              total,
              adults,
              kids,
              babies,
              villas,
              breakdown: {
                nl,
                be_nl: bn,
                be_fr: bf,
                de,
                ch,
                en: gb,
                fr,
                other,
              },
            };
            count++;
          }
        }
      }
    });
    return { stats: newStats, count };
  };

  const processArrproImport = () => {
    if (!excelInput) return;
    const { stats, count } = parseArrproCSV(excelInput);
    if (count > 0) {
      updateData({ dailyStats: stats });
      setExcelInput("");
      setShowImport(false);
      alert(`${count} dagen succesvol geïmporteerd!`);
    } else {
      alert("Kon geen data herkennen. Kopieer de tekst direct uit de PDF.");
    }
  };

  return (
    <AdminContainer
      title={`Bezetting ${toDutchDate(currentDay)}`}
      backAction={() => setAdminSubView("menu")}
      currentDay={currentDay}
      onPrev={onPrev}
      onNext={onNext}
      onCalendar={onCalendar}
    >
      <div className="mb-6">
        <button
          onClick={() => setShowImport(!showImport)}
          className="w-full flex justify-center items-center gap-2 text-sm font-bold px-4 py-3 rounded-xl transition-colors mb-4"
          style={{ backgroundColor: C.Sky, color: C.Lagoon }}
        >
          <Clipboard size={16} />{" "}
          {showImport ? "Sluit Import" : "Importeer Arrpro PDF"}
        </button>
        {showImport && (
          <Card className="p-4 animate-in fade-in mb-6" borderColor={C.Grass}>
            <h4
              className="font-bold text-xs uppercase mb-2"
              style={{ color: C.Pine }}
            >
              Plak Arrpro PDF Inhoud
            </h4>
            <textarea
              className="w-full border p-3 rounded-lg text-xs font-mono h-48 outline-none mb-3"
              placeholder={`"Date","NL Total"...\n"21/11/25","484"...`}
              value={excelInput}
              onChange={(e) => setExcelInput(e.target.value)}
              style={{ borderColor: C.Grass }}
            />
            <button
              onClick={processArrproImport}
              className="w-full text-white text-xs font-bold px-4 py-3 rounded-lg"
              style={{ backgroundColor: C.Pine }}
            >
              Verwerk
            </button>
          </Card>
        )}
      </div>
      <div className="space-y-6">
        <div>
          <label
            className="block text-xs font-bold uppercase mb-1"
            style={{ color: C.Bark }}
          >
            Totaal gasten
          </label>
          <input
            type="number"
            className="w-full border p-3 rounded-xl text-lg font-bold"
            style={{ borderColor: C.Grass, color: C.Pine }}
            value={currentStats.total || 0}
            onChange={(e) => updateStat("total", e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <p
            className="text-xs font-bold uppercase border-b pb-2"
            style={{ color: C.Bark, borderColor: C.Grass }}
          >
            Nationaliteiten
          </p>
          {NATIONALITIES.map((nat) => (
            <div key={nat.k} className="flex items-center gap-3">
              <span className="w-6 text-xl">{nat.i}</span>
              <span
                className="w-24 text-xs font-bold"
                style={{ color: C.Bark }}
              >
                {nat.l}
              </span>
              <input
                type="range"
                min="0"
                max={currentStats.total || 100}
                className="flex-1 h-2"
                style={{ accentColor: C.Pine }}
                value={bd[nat.k] || 0}
                onChange={(e) => updateStat(nat.k, e.target.value)}
              />
              <input
                type="number"
                className="w-14 border p-1.5 rounded-lg text-center font-bold text-sm"
                style={{ borderColor: C.Grass, color: C.Pine }}
                value={bd[nat.k] || 0}
                onChange={(e) => updateStat(nat.k, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </AdminContainer>
  );
};

// --- SHARED COMPONENT: STAFF SELECTOR ---
const StaffMultiSelect = ({ staffList, selected, onChange }) => {
  const selectedArray = selected
    ? selected.split(", ").filter((s) => s.trim() !== "")
    : [];

  const toggleStaff = (name) => {
    let newSelection;
    if (selectedArray.includes(name)) {
      newSelection = selectedArray.filter((s) => s !== name);
    } else {
      newSelection = [...selectedArray, name];
    }
    onChange(newSelection.join(", "));
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-lg max-h-40 overflow-y-auto bg-white">
      {staffList.map((name) => {
        const isSelected = selectedArray.includes(name);
        return (
          <button
            key={name}
            onClick={() => toggleStaff(name)}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              isSelected
                ? "bg-green-100 border-green-600 text-green-800 font-bold"
                : "bg-gray-50 border-gray-200 text-gray-600"
            }`}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
};

const EditSchedule = ({
  currentDay,
  todaysSchedule,
  newItem,
  setNewItem,
  updateData,
  appData,
  setAdminSubView,
  excelInput,
  setExcelInput,
  showExcelImport,
  setShowExcelImport,
  processImport,
  onPrev,
  onNext,
  onCalendar,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const addScheduleItem = () => {
    if (!newItem.time || !newItem.title) return;
    updateData({
      schedule: [...appData.schedule, { ...newItem, id: Date.now() }].sort(
        (a, b) => a.time.localeCompare(b.time)
      ),
    });
    setNewItem({ ...newItem, title: "", loc: "", staff: "" });
  };

  const deleteScheduleItem = (id) => {
    updateData({ schedule: appData.schedule.filter((item) => item.id !== id) });
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEditing = () => {
    const updatedSchedule = appData.schedule
      .map((item) => (item.id === editingId ? editForm : item))
      .sort((a, b) => a.time.localeCompare(b.time));
    updateData({ schedule: updatedSchedule });
    setEditingId(null);
    setEditForm({});
  };

  return (
    <AdminContainer
      title={`Programma ${toDutchDate(currentDay)}`}
      backAction={() => setAdminSubView("menu")}
      currentDay={currentDay}
      onPrev={onPrev}
      onNext={onNext}
      onCalendar={onCalendar}
    >
      <div className="mb-6">
        <button
          onClick={() => setShowExcelImport(!showExcelImport)}
          className="w-full flex justify-center items-center gap-2 text-sm font-bold px-4 py-3 rounded-xl transition-colors mb-4"
          style={{ backgroundColor: C.Sky, color: C.Lagoon }}
        >
          <Clipboard size={16} />
          {showExcelImport ? "Sluit Import" : "Importeer Uit PDF"}
        </button>
        {showExcelImport && (
          <Card className="p-4 animate-in fade-in" borderColor={C.Grass}>
            <p className="text-xs mb-2" style={{ color: C.Bark }}>
              Plak tekst (met datum):
            </p>
            <textarea
              className="w-full border p-3 rounded-lg text-xs font-mono h-32 outline-none mb-3"
              style={{ borderColor: C.Grass }}
              value={excelInput}
              onChange={(e) => setExcelInput(e.target.value)}
            />
            <button
              onClick={processImport}
              className="w-full text-white text-xs font-bold px-4 py-3 rounded-lg"
              style={{ backgroundColor: C.Pine }}
            >
              Verwerk
            </button>
          </Card>
        )}
      </div>

      <Card className="p-4 mb-6 space-y-3" borderColor={C.Grass}>
        <h4 className="text-xs font-bold uppercase" style={{ color: C.Pine }}>
          Handmatig Toevoegen
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="text-[10px] font-bold block mb-1"
              style={{ color: C.Bark }}
            >
              Tijd
            </label>
            <input
              type="time"
              className="w-full border p-2 rounded-lg text-sm"
              style={{ borderColor: C.Grass }}
              value={newItem.time}
              onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
            />
          </div>
          <div>
            <label
              className="text-[10px] font-bold block mb-1"
              style={{ color: C.Bark }}
            >
              Type
            </label>
            <select
              className="w-full border p-2 rounded-lg text-sm"
              style={{ borderColor: C.Grass }}
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <input
          list="activity-options"
          type="text"
          placeholder="Kies of typ Activiteit..."
          className="w-full border p-2 rounded-lg text-sm"
          style={{ borderColor: C.Grass }}
          value={newItem.title}
          onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
        />
        <datalist id="activity-options">
          {ACTIVITY_OPTIONS.map((opt, idx) => (
            <option key={idx} value={opt} />
          ))}
        </datalist>
        <select
          className="w-full border p-2 rounded-lg text-sm"
          style={{ borderColor: C.Grass }}
          value={newItem.loc}
          onChange={(e) => setNewItem({ ...newItem, loc: e.target.value })}
        >
          <option value="">Kies Locatie...</option>
          {LOCATIONS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        {/* STAFF MULTI SELECT */}
        <div>
          <label
            className="text-[10px] font-bold block mb-1"
            style={{ color: C.Bark }}
          >
            Medewerkers (Selecteer meerdere)
          </label>
          <StaffMultiSelect
            staffList={appData.staffList}
            selected={newItem.staff}
            onChange={(val) => setNewItem({ ...newItem, staff: val })}
          />
        </div>

        <button
          onClick={addScheduleItem}
          className="w-full font-bold py-2.5 rounded-lg flex items-center justify-center mt-2"
          style={{ backgroundColor: C.Pine, color: C.Grass }}
        >
          <Plus size={16} />
        </button>
      </Card>

      <div className="space-y-2">
        {todaysSchedule.map((item) => {
          if (editingId === item.id) {
            return (
              <Card
                key={item.id}
                className="p-4 space-y-3 border-2"
                borderColor={C.Pine}
              >
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    className="border p-2 rounded text-sm"
                    value={editForm.time}
                    onChange={(e) =>
                      setEditForm({ ...editForm, time: e.target.value })
                    }
                  />
                  <select
                    className="border p-2 rounded text-sm"
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm({ ...editForm, type: e.target.value })
                    }
                  >
                    {ACTIVITY_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  className="w-full border p-2 rounded text-sm"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="w-full border p-2 rounded text-sm"
                  value={editForm.loc}
                  onChange={(e) =>
                    setEditForm({ ...editForm, loc: e.target.value })
                  }
                />
                <div className="border rounded-lg p-2">
                  <p className="text-xs mb-1 font-bold">Medewerkers:</p>
                  <StaffMultiSelect
                    staffList={appData.staffList}
                    selected={editForm.staff}
                    onChange={(val) => setEditForm({ ...editForm, staff: val })}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveEditing}
                    className="flex-1 py-2 rounded font-bold text-white text-xs"
                    style={{ backgroundColor: C.Pine }}
                  >
                    Opslaan
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="flex-1 py-2 rounded font-bold border text-xs"
                    style={{ borderColor: C.Sunset, color: C.Sunset }}
                  >
                    Annuleren
                  </button>
                </div>
              </Card>
            );
          }

          const typeInfo =
            ACTIVITY_TYPES.find((t) => t.id === item.type) || ACTIVITY_TYPES[0];
          return (
            <div
              key={item.id}
              className={`flex flex-col p-3 border-l-4 rounded-r-xl bg-white shadow-sm border`}
              style={{ borderLeftColor: typeInfo.bg, borderColor: C.Grass }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div
                    className="font-bold text-sm flex items-center gap-2"
                    style={{ color: C.Pine }}
                  >
                    {item.time} - {item.title}
                  </div>
                  <div className="text-xs" style={{ color: C.Bark }}>
                    {item.loc}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(item)}
                    style={{ color: C.Pine }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteScheduleItem(item.id)}
                    style={{ color: C.Sunset }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div
                className="mt-2 pt-2 border-t flex items-center gap-2"
                style={{ borderColor: C.Grass }}
              >
                <User size={14} style={{ color: C.Pine }} />
                <span className="text-xs" style={{ color: C.Bark }}>
                  {item.staff || (
                    <span className="italic opacity-50">Geen staff</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AdminContainer>
  );
};

const EditChars = ({
  currentDay,
  getDayCharacters,
  updateData,
  appData,
  setAdminSubView,
  onPrev,
  onNext,
  onCalendar,
}) => {
  const chars = getDayCharacters(currentDay);
  const dayKey = toIsoDate(currentDay);
  const [newCharRole, setNewCharRole] = useState("");

  const handleUpdateChar = (charId, role, field, value) => {
    let newChars = [...appData.characters];

    // Check if this char entry already exists in DB
    const existingIndex = newChars.findIndex((c) => c.id === charId);

    if (existingIndex >= 0) {
      // Update existing
      newChars[existingIndex] = { ...newChars[existingIndex], [field]: value };
    } else {
      // It's a virtual entry (base role not yet in DB), create it
      newChars.push({
        id: charId || Date.now().toString() + Math.random(),
        date: dayKey,
        role,
        actor: "",
        pakCheck: false,
        [field]: value,
      });
    }
    updateData({ characters: newChars });
  };

  const addExtraChar = () => {
    if (!newCharRole.trim()) return;
    const newChar = {
      id: Date.now().toString(),
      date: dayKey,
      role: newCharRole.trim(),
      actor: "",
      pakCheck: false,
      isExtra: true,
    };
    updateData({ characters: [...appData.characters, newChar] });
    setNewCharRole("");
  };

  const deleteChar = (charId) => {
    if (confirm("Karakter verwijderen?")) {
      updateData({
        characters: appData.characters.filter((c) => c.id !== charId),
      });
    }
  };

  return (
    <AdminContainer
      title="Karakters"
      backAction={() => setAdminSubView("menu")}
      currentDay={currentDay}
      onPrev={onPrev}
      onNext={onNext}
      onCalendar={onCalendar}
    >
      <div className="space-y-4">
        {chars.map((char) => {
          const charColor = getCharColorInfo(char.role);
          return (
            <div
              key={char.id || char.role}
              className="border rounded-xl p-3 flex items-start gap-3"
              style={{ borderColor: C.Grass }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 font-bold"
                style={{
                  backgroundColor: charColor.bg,
                  color: charColor.text,
                }}
              >
                {char.role[0]}
              </div>
              <div className="flex-1 space-y-2">
                <div
                  className="font-bold text-sm flex justify-between"
                  style={{ color: C.Bark }}
                >
                  <span>{char.role}</span>
                  {char.isExtra && (
                    <button
                      onClick={() => deleteChar(char.id)}
                      className="text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <select
                    className="w-full border p-2 rounded-lg text-sm bg-white"
                    style={{ borderColor: C.Grass }}
                    value={char.actor}
                    onChange={(e) =>
                      handleUpdateChar(
                        char.id,
                        char.role,
                        "actor",
                        e.target.value
                      )
                    }
                  >
                    <option value="">Kies medewerker...</option>
                    {appData.staffList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() =>
                      handleUpdateChar(
                        char.id,
                        char.role,
                        "pakCheck",
                        !char.pakCheck
                      )
                    }
                    className={`p-2 border rounded-lg text-sm flex items-center`}
                    style={{
                      backgroundColor: char.pakCheck ? C.Grass : C.White,
                      borderColor: C.Grass,
                      color: char.pakCheck ? C.Pine : C.Bark,
                    }}
                  >
                    <CheckCircle size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <div className="pt-4 border-t mt-4" style={{ borderColor: C.Grass }}>
          <label
            className="text-xs font-bold mb-2 block"
            style={{ color: C.Pine }}
          >
            Extra Karakter Toevoegen
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Naam (bv. Super Mario)"
              className="flex-1 border p-2 rounded-lg text-sm"
              style={{ borderColor: C.Grass }}
              value={newCharRole}
              onChange={(e) => setNewCharRole(e.target.value)}
            />
            <button
              onClick={addExtraChar}
              className="px-4 rounded-lg font-bold"
              style={{ backgroundColor: C.Pine, color: C.Grass }}
            >
              <Plus />
            </button>
          </div>
        </div>
      </div>
    </AdminContainer>
  );
};

const EditHours = ({
  updateData,
  appData,
  setAdminSubView,
  onPrev,
  onNext,
  onCalendar,
}) => {
  const corrections = Array.isArray(appData.hourCorrections)
    ? appData.hourCorrections
    : [];
  const toggleProcessed = (id) => {
    updateData({
      hourCorrections: corrections.map((c) =>
        c.id === id ? { ...c, processed: !c.processed } : c
      ),
    });
  };
  const deleteCorrection = (id) => {
    if (confirm("Verwijderen?"))
      updateData({ hourCorrections: corrections.filter((c) => c.id !== id) });
  };
  const sorted = [...corrections].sort((a, b) =>
    a.processed === b.processed ? 0 : a.processed ? 1 : -1
  );

  return (
    <AdminContainer
      title="Uren Verwerken"
      backAction={() => setAdminSubView("menu")}
      currentDay={new Date()} // Current day doesn't really matter here, but passed for consistency
      onPrev={onPrev}
      onNext={onNext}
      onCalendar={onCalendar}
    >
      <div className="space-y-3">
        {sorted.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed text-sm">
            Geen openstaande correcties.
          </div>
        )}
        {sorted.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border transition-all`}
            style={{
              backgroundColor: item.processed ? C.Bg : C.White,
              borderColor: C.Grass,
              opacity: item.processed ? 0.6 : 1,
            }}
          >
            <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div
                  className="font-bold flex items-center gap-2 text-sm"
                  style={{ color: C.Pine }}
                >
                  {item.name}{" "}
                  <span
                    className="text-[10px] font-normal px-2 py-0.5 rounded"
                    style={{ backgroundColor: C.Grass, color: C.Pine }}
                  >
                    {item.date}
                  </span>
                </div>
                <div
                  className="text-xs mt-1 flex items-center gap-2"
                  style={{ color: C.Bark }}
                >
                  <span
                    className="font-mono px-1.5 rounded border font-bold"
                    style={{
                      backgroundColor: C.Blossom,
                      color: C.Sunset,
                      borderColor: C.Sunset,
                    }}
                  >
                    {item.code}
                  </span>
                  {item.start} - {item.end}
                </div>
                <div
                  className="text-xs mt-2 italic border-l-2 pl-2"
                  style={{ color: C.Bark, borderColor: C.Grass }}
                >
                  "{item.reason}"
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => toggleProcessed(item.id)}
                  className={`p-2 rounded-lg transition-colors flex-1 sm:flex-none flex justify-center`}
                  style={{
                    backgroundColor: item.processed ? C.Bg : C.Grass,
                    color: C.Pine,
                  }}
                >
                  <CheckCircle size={20} />
                </button>
                <button
                  onClick={() => deleteCorrection(item.id)}
                  className="p-2 rounded-lg flex-1 sm:flex-none flex justify-center"
                  style={{ backgroundColor: C.Blossom, color: C.Sunset }}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminContainer>
  );
};

const EditOrders = ({
  updateData,
  appData,
  setAdminSubView,
  onPrev,
  onNext,
  onCalendar,
}) => {
  const orders = Array.isArray(appData.orders) ? appData.orders : [];
  const updateStatus = (id, status) => {
    updateData({
      orders: orders.map((o) => (o.id === id ? { ...o, status } : o)),
    });
  };
  const deleteOrder = (id) => {
    if (confirm("Wil je deze bestelling definitief verwijderen?")) {
      updateData({ orders: orders.filter((o) => o.id !== id) });
    }
  };

  return (
    <AdminContainer
      title="Bestellingen Beheren"
      backAction={() => setAdminSubView("menu")}
      currentDay={new Date()} // Doesn't rely on current day for view, but consistency
      onPrev={onPrev}
      onNext={onNext}
      onCalendar={onCalendar}
    >
      <div className="space-y-3">
        {orders.length === 0 && (
          <p className="text-gray-400 text-center py-10 text-sm">
            Geen bestellingen.
          </p>
        )}
        {orders
          .slice()
          .reverse()
          .map((order) => (
            <Card key={order.id} className="p-4" borderColor={C.Grass}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold" style={{ color: C.Pine }}>
                    {order.item}
                  </div>
                  <div className="text-xs" style={{ color: C.Bark }}>
                    {order.date}
                  </div>
                </div>
                <button
                  onClick={() => deleteOrder(order.id)}
                  style={{ color: C.Sunset }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => updateStatus(order.id, "open")}
                  className={`flex-1 py-2 text-xs font-bold rounded`}
                  style={{
                    backgroundColor: order.status === "open" ? C.Sky : C.Bg,
                    color: order.status === "open" ? C.Lagoon : C.Bark,
                  }}
                >
                  Nieuw
                </button>
                <button
                  onClick={() => updateStatus(order.id, "ordered")}
                  className={`flex-1 py-2 text-xs font-bold rounded`}
                  style={{
                    backgroundColor:
                      order.status === "ordered" ? C.Honey : C.Bg,
                    color: order.status === "ordered" ? C.Bark : C.Bark,
                  }}
                >
                  Besteld
                </button>
                <button
                  onClick={() => updateStatus(order.id, "received")}
                  className={`flex-1 py-2 text-xs font-bold rounded`}
                  style={{
                    backgroundColor:
                      order.status === "received" ? C.Grass : C.Bg,
                    color: order.status === "received" ? C.Pine : C.Bark,
                  }}
                >
                  Binnen
                </button>
              </div>
            </Card>
          ))}
      </div>
    </AdminContainer>
  );
};

const UserHoursView = ({ updateData, appData, setView }) => {
  const [form, setForm] = useState({
    name: "",
    date: toIsoDate(new Date()),
    start: "",
    end: "",
    code: "243",
    reason: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = () => {
    if (!form.name || !form.start || !form.end || !form.reason) {
      setError("Vul alsjeblieft alle velden in!");
      return;
    }
    const currentCorrections = Array.isArray(appData.hourCorrections)
      ? appData.hourCorrections
      : [];
    updateData({
      hourCorrections: [
        ...currentCorrections,
        {
          ...form,
          id: Date.now(),
          processed: false,
          timestamp: new Date().toISOString(),
        },
      ],
    });
    setForm({
      name: "",
      date: toIsoDate(new Date()),
      start: "",
      end: "",
      code: "243",
      reason: "",
    });
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setView("dashboard");
    }, 2000);
  };

  if (success)
    return (
      <div
        className="h-full flex flex-col items-center justify-center animate-in zoom-in p-8 rounded-2xl border"
        style={{ backgroundColor: C.Grass, borderColor: C.Pine, color: C.Pine }}
      >
        <CheckCircle size={64} className="mb-4" />
        <h2 className="text-2xl font-bold">Verzonden!</h2>
        <p className="text-sm mt-2">De floormanager kijkt ernaar.</p>
      </div>
    );

  return (
    <Card className="p-6 max-w-lg mx-auto" borderColor={C.Grass}>
      <h2
        className="font-bold text-xl mb-2 flex items-center"
        style={{ color: C.Pine }}
      >
        <Clock className="mr-2" style={{ color: C.Sunset }} /> Urencorrectie
      </h2>
      <p className="text-xs mb-6" style={{ color: C.Bark }}>
        Vergeten te klokken? Vul dit formulier volledig in.
      </p>
      {error && (
        <div
          className="text-sm p-3 rounded-lg mb-4 font-bold border flex items-center"
          style={{
            backgroundColor: C.Blossom,
            color: C.Sunset,
            borderColor: C.Sunset,
          }}
        >
          <AlertCircle size={16} className="mr-2" />
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label
            className="block text-xs font-bold uppercase mb-1"
            style={{ color: C.Bark }}
          >
            Jouw Naam *
          </label>
          <select
            className="w-full border p-3 rounded-lg text-sm bg-white"
            style={{ borderColor: C.Grass }}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          >
            <option value="">Kies je naam...</option>
            {appData.staffList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-xs font-bold uppercase mb-1"
              style={{ color: C.Bark }}
            >
              Datum *
            </label>
            <input
              type="date"
              className="w-full border p-3 rounded-lg text-sm"
              style={{ borderColor: C.Grass }}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <label
              className="block text-xs font-bold uppercase mb-1"
              style={{ color: C.Bark }}
            >
              Afdeling *
            </label>
            <select
              className="w-full border p-3 rounded-lg text-sm"
              style={{ borderColor: C.Grass }}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            >
              <option value="243">243 (Crea Atelier)</option>
              <option value="258">258 (Entertainment)</option>
              <option value="279">279 (Springkussens)</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-xs font-bold uppercase mb-1"
              style={{ color: C.Bark }}
            >
              Starttijd *
            </label>
            <input
              type="time"
              className="w-full border p-3 rounded-lg text-sm"
              style={{ borderColor: C.Grass }}
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />
          </div>
          <div>
            <label
              className="block text-xs font-bold uppercase mb-1"
              style={{ color: C.Bark }}
            >
              Eindtijd *
            </label>
            <input
              type="time"
              className="w-full border p-3 rounded-lg text-sm"
              style={{ borderColor: C.Grass }}
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label
            className="block text-xs font-bold uppercase mb-1"
            style={{ color: C.Bark }}
          >
            Reden *
          </label>
          <input
            type="text"
            className="w-full border p-3 rounded-lg text-sm"
            style={{ borderColor: C.Grass }}
            placeholder="Bijv. Pasje vergeten..."
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
        </div>
        <button
          onClick={submit}
          className="w-full font-bold py-3 rounded-xl shadow-md transition-colors mt-2"
          style={{ backgroundColor: C.Sunset, color: C.White }}
        >
          Versturen
        </button>
      </div>
    </Card>
  );
};

const UserOrderView = ({ updateData, appData, setView }) => {
  const [item, setItem] = useState("");
  const [success, setSuccess] = useState(false);
  const orders = Array.isArray(appData.orders) ? appData.orders : [];

  const placeOrder = () => {
    if (!item) return;
    updateData({
      orders: [
        ...orders,
        { id: Date.now(), item, status: "open", date: toDutchDate(new Date()) },
      ],
    });
    setItem("");
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setView("dashboard");
    }, 2000);
  };

  if (success)
    return (
      <div
        className="h-full flex flex-col items-center justify-center animate-in zoom-in p-8 rounded-2xl border"
        style={{
          backgroundColor: C.Sky,
          borderColor: C.Lagoon,
          color: C.Lagoon,
        }}
      >
        <CheckCircle size={64} className="mb-4" />
        <h2 className="text-2xl font-bold">Besteld!</h2>
        <p className="text-sm mt-2">Staat in de lijst.</p>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in max-w-lg mx-auto">
      <Card className="p-5" borderColor={C.Grass}>
        <h2
          className="font-bold text-lg mb-3 flex items-center"
          style={{ color: C.Pine }}
        >
          <ShoppingCart className="mr-2" style={{ color: C.Lagoon }} /> Nieuwe
          Bestelling
        </h2>
        <p className="text-xs mb-3" style={{ color: C.Bark }}>
          Wat heb je nodig? Je bestelling komt direct bij de Floormanager
          binnen.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border p-3 rounded-lg text-sm"
            style={{ borderColor: C.Grass }}
            placeholder="Typ hier je bestelling..."
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />
          <button
            onClick={placeOrder}
            className="px-4 rounded-lg font-bold flex items-center"
            style={{ backgroundColor: C.Lagoon, color: C.White }}
          >
            <Plus size={18} />
          </button>
        </div>
      </Card>
      <div>
        <h3
          className="font-bold text-sm uppercase mb-3 ml-1"
          style={{ color: C.Bark }}
        >
          Mijn Bestellingen
        </h3>
        {(!appData.orders || appData.orders.length === 0) && (
          <p
            className="text-center text-sm py-8 italic"
            style={{ color: C.Bark }}
          >
            Nog geen bestellingen.
          </p>
        )}
        <div className="space-y-2">
          {orders
            .slice()
            .reverse()
            .map((order) => (
              <div
                key={order.id}
                className="flex justify-between items-center p-3 bg-white rounded-xl border shadow-sm"
                style={{ borderColor: C.Grass }}
              >
                <div>
                  <div className="text-sm font-bold" style={{ color: C.Pine }}>
                    {order.item}
                  </div>
                  <div className="text-[10px]" style={{ color: C.Bark }}>
                    {order.date}
                  </div>
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded font-bold`}
                  style={{
                    backgroundColor:
                      order.status === "received"
                        ? C.Grass
                        : order.status === "ordered"
                        ? C.Honey
                        : C.Sky,
                    color:
                      order.status === "received"
                        ? C.Pine
                        : order.status === "ordered"
                        ? C.Bark
                        : C.Lagoon,
                  }}
                >
                  {order.status === "received"
                    ? "Binnen"
                    : order.status === "ordered"
                    ? "Besteld"
                    : "Nieuw"}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const LoginScreen = ({ pin, setPin, handleLogin, resetAllData }) => (
  <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in bg-white">
    <div
      className="p-5 rounded-full mb-6"
      style={{ backgroundColor: C.Grass, color: C.Pine }}
    >
      <Lock size={32} />
    </div>
    <h2 className="text-2xl font-bold mb-2" style={{ color: C.Pine }}>
      FM Toegang
    </h2>
    <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-6">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <button
          key={n}
          onClick={() => setPin(pin + n)}
          className="h-14 border rounded-xl text-xl font-bold active:bg-gray-100"
          style={{ borderColor: C.Grass, color: C.Pine }}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => setPin("")}
        className="h-14 rounded-xl font-bold flex items-center justify-center"
        style={{ backgroundColor: C.Blossom, color: C.Sunset }}
      >
        C
      </button>
      <button
        onClick={() => setPin(pin + "0")}
        className="h-14 border rounded-xl text-xl font-bold"
        style={{ borderColor: C.Grass, color: C.Pine }}
      >
        0
      </button>
      <button
        onClick={handleLogin}
        className="h-14 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: C.Pine, color: C.Grass }}
      >
        <ChevronRight />
      </button>
    </div>
    <div className="flex justify-center gap-2 h-2 mb-8">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full`}
          style={{ backgroundColor: i < pin.length ? C.Pine : C.Grass }}
        ></div>
      ))}
    </div>
    <button
      onClick={resetAllData}
      className="text-xs underline"
      style={{ color: C.Bark }}
    >
      Reset App Data
    </button>
  </div>
);

// --- MOBILE MENU OVERLAY ---
const MobileMenu = ({
  isOpen,
  onClose,
  setView,
  handleLogout,
  isLoggedIn,
  setCurrentDay,
}) => {
  if (!isOpen) return null;

  const MenuItem = ({ icon: Icon, label, target }) => (
    <button
      onClick={() => {
        setView(target);
        if (target === "dashboard") setCurrentDay(new Date()); // Reset to today on dashboard click
        onClose();
      }}
      className="flex items-center gap-4 w-full p-4 text-lg font-bold border-b"
      style={{ borderColor: C.Grass, color: C.Pine }}
    >
      <Icon size={24} /> {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      {/* Drawer */}
      <div className="relative w-3/4 max-w-sm h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
        <div
          className="p-6 flex justify-between items-center border-b"
          style={{ backgroundColor: C.Pine, borderColor: C.Grass }}
        >
          <h2 className="text-xl font-bold text-white">Menu</h2>
          <button onClick={onClose} className="text-white">
            <CloseIcon size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <MenuItem
            icon={LayoutDashboard}
            label="Dashboard"
            target="dashboard"
          />
          <MenuItem icon={CalendarIcon} label="Programma" target="schedule" />
          <MenuItem icon={PieChart} label="Bezetting" target="occupancy" />
          <MenuItem icon={Smile} label="Karakters" target="characters" />
          <MenuItem icon={BookOpen} label="Overdracht" target="handover" />
          <MenuItem icon={CheckSquare} label="Takenlijst" target="checks" />
          <MenuItem icon={Clock} label="Uren" target="hours" />
          <MenuItem icon={ShoppingCart} label="Bestellen" target="orders" />
        </div>
        <div className="p-6 border-t" style={{ borderColor: C.Grass }}>
          {!isLoggedIn ? (
            <button
              onClick={() => {
                setView("login");
                onClose();
              }}
              className="w-full py-3 rounded-xl font-bold flex items-center justify-center"
              style={{ backgroundColor: C.Grass, color: C.Pine }}
            >
              <Lock size={18} className="mr-2" /> FM Login
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => {
                  setView("admin");
                  onClose();
                }}
                className="w-full py-3 rounded-xl font-bold flex items-center justify-center"
                style={{ backgroundColor: C.Grass, color: C.Pine }}
              >
                <Settings size={18} className="mr-2" /> Beheer
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  onClose();
                }}
                className="w-full py-3 rounded-xl font-bold flex items-center justify-center border"
                style={{ borderColor: C.Sunset, color: C.Sunset }}
              >
                <LogOut size={18} className="mr-2" /> Uitloggen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  // Inject Font and Tailwind
  useEffect(() => {
    if (!document.getElementById("tailwind-script")) {
      const script = document.createElement("script");
      script.id = "tailwind-script";
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
    // Inject Bagoss-like font style
    const style = document.createElement("style");
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap');
      body { font-family: 'DM Serif Display', serif; }
    `;
    document.head.appendChild(style);
  }, []);

  const [view, setView] = useState("dashboard");
  const [adminSubView, setAdminSubView] = useState("menu");
  const [appData, setAppData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState("");
  const [currentDay, setCurrentDay] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for new mobile menu
  const [connError, setConnError] = useState(null);
  const weather = useWeather(currentDay);
  const greeting = getGreeting();
  // NEW: Use current time for filtering past events
  const now = useCurrentTime();

  const [newItem, setNewItem] = useState({
    date: toIsoDate(new Date()),
    time: "",
    title: "",
    loc: "",
    staff: "",
    type: "crea",
    pax: 0,
  });
  const [newTask, setNewTask] = useState("");
  const [excelInput, setExcelInput] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);

  // --- AUTH ---
  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        if (mounted) setConnError("Kan niet verbinden met server");
      }
    };
    if (auth) initAuth();
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        if (mounted) {
          setUser(u);
          if (!u) setLoading(false);
        }
      });
      return () => {
        mounted = false;
        unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  // --- LIVE SYNC & AUTO TEMPLATE FILL ---
  useEffect(() => {
    if (!user || !db) return;

    const docRef = doc(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "cp_live_data",
      "master"
    );

    const unsub = onSnapshot(
      docRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const newData = sanitizeData(docSnap.data());
          setAppData(newData);

          const dayKey = toIsoDate(currentDay);
          const dayOfWeek = currentDay.getDay();
          const hasChecklists = newData.checklists.some(
            (c) => c.date === dayKey
          );

          if (
            !hasChecklists &&
            newData.checklistTemplates &&
            newData.checklistTemplates[dayOfWeek]
          ) {
            const template = newData.checklistTemplates[dayOfWeek];
            const newTasks = [];
            if (template.entertainment)
              template.entertainment.forEach((text) =>
                newTasks.push({
                  id: Date.now() + Math.random(),
                  text,
                  type: "entertainment",
                  done: false,
                  date: dayKey,
                })
              );
            if (template.crea)
              template.crea.forEach((text) =>
                newTasks.push({
                  id: Date.now() + Math.random(),
                  text,
                  type: "crea",
                  done: false,
                  date: dayKey,
                })
              );
            if (newTasks.length > 0) {
              const updatedChecklists = [...newData.checklists, ...newTasks];
              await setDoc(
                docRef,
                { ...newData, checklists: updatedChecklists },
                { merge: true }
              );
            }
          }
        } else {
          setDoc(docRef, INITIAL_DATA).catch((err) =>
            console.error("Init failed", err)
          );
          setAppData(INITIAL_DATA);
        }
        setLoading(false);
        setConnError(null);
      },
      (err) => {
        console.error("Sync error", err);
        setConnError("Verbinding verbroken.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user, currentDay]);

  const saveData = async (newData) => {
    const updated = {
      ...appData,
      ...newData,
      lastUpdate: new Date().toISOString(),
    };
    setAppData(updated);
    if (user && db) {
      try {
        const docRef = doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "cp_live_data",
          "master"
        );
        await setDoc(docRef, updated, { merge: true });
      } catch (err) {
        console.error("Save failed", err);
        setConnError("Opslaan mislukt!");
      }
    }
  };

  const addTask = (type) => {
    if (!newTask) return;
    const dayKey = toIsoDate(currentDay);
    const newChecklist = [
      ...appData.checklists,
      { id: Date.now(), text: newTask, type, done: false, date: dayKey },
    ];
    saveData({ checklists: newChecklist });
    setNewTask("");
  };
  const deleteTask = (id) => {
    const newChecklist = appData.checklists.filter((t) => t.id !== id);
    saveData({ checklists: newChecklist });
  };
  const handleLogin = () => {
    const currentPin = appData.settings?.pin || "2412";
    if (pin === currentPin) {
      setIsLoggedIn(true);
      setView("admin");
      setAdminSubView("menu");
      setPin("");
    } else {
      alert("Fout");
      setPin("");
    }
  };
  const resetAllData = async () => {
    if (window.confirm("Weet je zeker dat je ALLE data wilt wissen?")) {
      if (user && db) {
        const docRef = doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "cp_live_data",
          "master"
        );
        await setDoc(docRef, INITIAL_DATA);
      } else {
        setAppData(INITIAL_DATA);
      }
    }
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setView("dashboard");
    setAdminSubView("menu");
    setPin("");
  };
  const nextDay = () => {
    const d = new Date(currentDay);
    d.setDate(d.getDate() + 1);
    setCurrentDay(d);
    setNewItem((p) => ({ ...p, date: toIsoDate(d) }));
  };
  const prevDay = () => {
    const d = new Date(currentDay);
    d.setDate(d.getDate() - 1);
    setCurrentDay(d);
    setNewItem((p) => ({ ...p, date: toIsoDate(d) }));
  };

  const parseScheduleRawText = (text) => {
    let cleanText = text.replace(/\s+/g, " ");
    const months = {
      januari: 0,
      februari: 1,
      maart: 2,
      april: 3,
      mei: 4,
      juni: 5,
      juli: 6,
      augustus: 7,
      september: 8,
      oktober: 9,
      november: 10,
      december: 11,
    };
    const dateRegex =
      /(maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag)\s+(\d{1,2})\s+(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)/gi;
    const dayBlocks = [];
    let match;
    let lastIndex = 0;
    let lastDateInfo = null;
    while ((match = dateRegex.exec(cleanText)) !== null) {
      if (lastDateInfo) {
        dayBlocks.push({
          dateInfo: lastDateInfo,
          content: cleanText.substring(lastIndex, match.index),
        });
      }
      lastDateInfo = { day: match[2], month: match[3] };
      lastIndex = dateRegex.lastIndex;
    }
    if (lastDateInfo) {
      dayBlocks.push({
        dateInfo: lastDateInfo,
        content: cleanText.substring(lastIndex),
      });
    }
    const parsedItems = [];
    const currentYear = new Date().getFullYear();
    dayBlocks.forEach((block) => {
      const mIndex = months[block.dateInfo.month.toLowerCase()];
      const d = new Date(currentYear, mIndex, parseInt(block.dateInfo.day));
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const isoDate = d.toISOString().split("T")[0];
      const timeRegex = /(\d{2}:\d{2}-\d{2}:\d{2})/g;
      let tMatch;
      const times = [];
      while ((tMatch = timeRegex.exec(block.content)) !== null) {
        times.push({
          time: tMatch[1],
          index: tMatch.index,
          end: tMatch.index + tMatch[0].length,
        });
      }
      times.forEach((t, i) => {
        const startContent = t.end;
        const endContent =
          i + 1 < times.length ? times[i + 1].index : block.content.length;
        let rawActivity = block.content.substring(startContent, endContent);
        let price = "-";
        const priceMatch = rawActivity.match(/€\s?[\d.,-]+/);
        if (priceMatch) {
          price = priceMatch[0];
          rawActivity = rawActivity.replace(priceMatch[0], "");
        }
        let location = "";
        const locs = LOCATIONS.slice().sort((a, b) => b.length - a.length);
        const extraLocs = [
          "Market Dome",
          "Game Town",
          "Aqua Mundo",
          "Grand Café",
          "Action Factory",
        ];
        const allLocs = [...locs, ...extraLocs];
        for (const loc of allLocs) {
          if (rawActivity.includes(loc)) {
            location = loc;
            rawActivity = rawActivity.replace(loc, "");
            break;
          }
        }
        let title = rawActivity.trim();
        title = title.replace(/^[-–\s]+|[-–\s]+$/g, "");

        // Clean up leading colons/spaces/dashes more aggressively
        title = title.replace(/^[:\-–\s]+/, "").trim();

        let type = "ent";
        const lowerTitle = title.toLowerCase();

        if (
          lowerTitle.includes("orry") ||
          lowerTitle.includes("bing") ||
          lowerTitle.includes("woops") ||
          lowerTitle.includes("rep")
        ) {
          type = "orry";
        } else if (
          lowerTitle.includes("crea") ||
          lowerTitle.includes("knutsel") ||
          lowerTitle.includes("workshop") ||
          lowerTitle.includes("walk-in") ||
          lowerTitle.includes("glitter") ||
          lowerTitle.includes("hairbeads") ||
          lowerTitle.includes("schminken") ||
          lowerTitle.includes("wax") ||
          lowerTitle.includes("zand")
        ) {
          type = "crea";
        } else if (
          lowerTitle.includes("live") ||
          lowerTitle.includes("quiz") ||
          lowerTitle.includes("bingo") ||
          lowerTitle.includes("dj") ||
          lowerTitle.includes("show")
        ) {
          type = "ent";
        }

        if (title.length > 2) {
          parsedItems.push({
            id: Date.now() + Math.random(),
            date: isoDate,
            time: t.time,
            title: title,
            loc: location || "Overig",
            staff: "",
            type: type,
            maxPax: "",
            price: price,
          });
        }
      });
    });
    return parsedItems;
  };

  const processScheduleImport = () => {
    if (!excelInput) return;
    const newItems = parseScheduleRawText(excelInput);
    if (newItems.length > 0) {
      saveData({
        schedule: [...appData.schedule, ...newItems].sort((a, b) =>
          a.time.localeCompare(b.time)
        ),
      });
      setExcelInput("");
      setShowExcelImport(false);
      alert(`${newItems.length} activiteiten toegevoegd!`);
    } else {
      alert("Kon geen activiteiten herkennen. Controleer het formaat.");
    }
  };

  const dayKey = toIsoDate(currentDay);
  const getDayCharacters = (date) => {
    const dKey = toIsoDate(date);

    // Get existing characters for this date
    const existing = appData.characters.filter((c) => c.date === dKey);

    // Create a map for Base Roles to easily merge
    const baseRolesMap = BASE_ROLES.reduce((acc, role) => {
      acc[role] = existing.find((c) => c.role === role) || {
        id: null, // Virtual ID if not saved yet
        role,
        actor: "",
        pakCheck: false,
        date: dKey,
        isExtra: false,
      };
      return acc;
    }, {});

    // Get extra roles (anything in existing that is NOT a base role)
    const extraRoles = existing
      .filter((c) => !BASE_ROLES.includes(c.role))
      .map((c) => ({ ...c, isExtra: true }));

    // Combine: Base Roles first, then Extras
    return [...Object.values(baseRolesMap), ...extraRoles];
  };
  const todaysSchedule = appData.schedule.filter((s) => s.date === dayKey);

  // Filter past activities logic - Modified to keep items but use isPast logic inside render
  const isPastItem = (item) => {
    const currentIsoDate = toIsoDate(now);
    const isToday = dayKey === currentIsoDate;
    const isPastDay = new Date(dayKey) < new Date(currentIsoDate);

    if (isPastDay) return true;
    if (!isToday) return false;

    // Today check
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const times = item.time.split("-");
    const endTimeStr = times[1] || times[0];
    const [h, m] = endTimeStr.split(":").map(Number);
    const itemEndMinutes = h * 60 + m;

    return itemEndMinutes < currentMinutes;
  };

  const todaysCharacters = getDayCharacters(currentDay);
  const todaysChecklists = {
    entertainment: appData.checklists.filter(
      (c) => c.date === dayKey && c.type === "entertainment"
    ),
    crea: appData.checklists.filter(
      (c) => c.date === dayKey && c.type === "crea"
    ),
  };

  if (loading)
    return (
      <div
        className="h-screen flex items-center justify-center bg-white"
        style={{ color: C.Pine }}
      >
        <RefreshCw className="animate-spin mb-4 mr-2" size={24} /> Laden...
      </div>
    );

  return (
    <div
      className="min-h-screen font-sans flex flex-col md:flex-row overflow-hidden"
      style={{ backgroundColor: C.Bg }}
    >
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        setView={setView}
        handleLogout={handleLogout}
        isLoggedIn={isLoggedIn}
        setCurrentDay={setCurrentDay}
      />

      {connError && (
        <div
          className="absolute top-0 left-0 w-full p-2 z-50 text-center text-xs font-bold flex items-center justify-center"
          style={{ backgroundColor: C.Sunset, color: C.Blossom }}
        >
          <AlertOctagon size={14} className="mr-2" /> {connError}
        </div>
      )}
      {!connError && user && (
        <div
          className="absolute top-0 left-0 w-full p-1 z-50 text-center text-[10px] font-bold animate-in fade-in"
          style={{ backgroundColor: C.Pine, color: C.Grass }}
        >
          ✓ Live Verbonden
        </div>
      )}

      {/* Desktop Sidebar (Hidden on Mobile) */}
      <div
        className="hidden md:flex w-72 flex-col h-screen p-6 shadow-xl z-20 flex-shrink-0"
        style={{ backgroundColor: C.Pine }}
      >
        <div className="mb-10 flex items-center justify-center text-center">
          <h1 className="font-extrabold text-2xl text-white tracking-tight">
            Kids <span style={{ color: C.Grass }}>Entertainment</span> <br />
            <span className="text-sm font-medium opacity-70">
              Limburgse Peel
            </span>
          </h1>
        </div>
        <nav className="flex-1 space-y-1">
          <SidebarItem
            id="dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            onClick={() => {
              setView("dashboard");
              setCurrentDay(new Date());
            }}
            active={view === "dashboard"}
          />
          <SidebarItem
            id="occupancy"
            icon={PieChart}
            label="Bezetting"
            onClick={() => setView("occupancy")}
            active={view === "occupancy"}
          />
          <SidebarItem
            id="schedule"
            icon={CalendarIcon}
            label="Programma"
            onClick={() => setView("schedule")}
            active={view === "schedule"}
          />
          <SidebarItem
            id="characters"
            icon={Smile}
            label="Karakters"
            onClick={() => setView("characters")}
            active={view === "characters"}
          />
          <SidebarItem
            id="handover"
            icon={BookOpen}
            label="Overdracht"
            onClick={() => setView("handover")}
            active={view === "handover"}
          />
          <SidebarItem
            id="checks"
            icon={CheckSquare}
            label="Takenlijst"
            onClick={() => setView("checks")}
            active={view === "checks"}
          />
          <SidebarItem
            id="hours"
            icon={Clock}
            label="Uren"
            onClick={() => setView("hours")}
            active={view === "hours"}
          />
          <SidebarItem
            id="orders"
            icon={ShoppingCart}
            label="Bestellen"
            onClick={() => setView("orders")}
            active={view === "orders"}
          />
        </nav>
        <div className="mt-auto pt-6 border-t border-green-800">
          {!isLoggedIn ? (
            <button
              onClick={() => setView("login")}
              className="w-full py-3 rounded-xl flex items-center justify-center font-bold transition-colors hover:opacity-90"
              style={{ backgroundColor: C.Grass, color: C.Pine }}
            >
              <Lock size={16} className="mr-2" /> FM Login
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setView("admin")}
                className="w-full py-3 rounded-xl flex items-center justify-center font-bold transition-colors hover:opacity-90"
                style={{ backgroundColor: C.Grass, color: C.Pine }}
              >
                <Settings size={16} className="mr-2" /> Beheer Menu
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl flex items-center justify-center font-bold transition-colors border hover:opacity-80"
                style={{
                  backgroundColor: C.Blossom,
                  color: C.Sunset,
                  borderColor: C.Sunset,
                }}
              >
                <LogOut size={16} className="mr-2" /> Uitloggen
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* HEADER */}
        <div
          className="p-3 md:p-4 sticky top-0 z-30 shadow-lg rounded-b-2xl md:rounded-none"
          style={{ backgroundColor: C.Pine, color: C.White }}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="md:hidden flex items-center gap-3">
              {/* NEW MOBILE MENU TOGGLE */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg"
                style={{ color: C.Grass }}
              >
                <Menu size={28} />
              </button>
              <h1 className="font-bold text-lg leading-tight">
                Kids Entertainment <span style={{ color: C.Grass }}>LP</span>
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <h2 className="font-bold text-xl">
                {view === "dashboard"
                  ? "Dashboard"
                  : view === "hours"
                  ? "Urencorrectie"
                  : view === "orders"
                  ? "Bestellen"
                  : toDutchDate(currentDay)}
              </h2>
            </div>
            <div className="flex gap-2">
              {!isLoggedIn && (
                <button
                  onClick={() => {
                    setView("dashboard");
                    setCurrentDay(new Date());
                  }}
                  className="p-2 rounded-full hover:bg-white/20"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: C.White,
                  }}
                >
                  <Home size={18} />
                </button>
              )}
              {/* Mobile FM Login Button Removed here, moved to drawer */}
              {isLoggedIn && (
                <div className="md:hidden flex items-center gap-2">
                  <button
                    onClick={() => setView("admin")}
                    className="px-3 py-1 rounded-full text-xs font-bold border text-white"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                  >
                    BEHEER
                  </button>
                </div>
              )}
            </div>
          </div>
          {view !== "hours" &&
            view !== "login" &&
            view !== "orders" &&
            view !== "admin" && (
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 flex items-center justify-between rounded-xl p-1.5 shadow-inner h-10"
                  style={{ backgroundColor: "#03463d" }}
                >
                  <button
                    onClick={prevDay}
                    className="p-1.5 hover:bg-white/10 rounded-lg"
                    style={{ color: C.Grass }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div
                    className="text-center px-2 flex flex-col items-center cursor-pointer"
                    onClick={() => setIsCalendarOpen(true)}
                  >
                    <span
                      className="text-[10px] uppercase tracking-widest font-bold"
                      style={{ color: C.Grass }}
                    >
                      Datum
                    </span>
                    <span
                      className="text-sm font-bold leading-tight"
                      style={{ color: C.White }}
                    >
                      {toDutchDate(currentDay)}
                    </span>
                  </div>
                  <button
                    onClick={nextDay}
                    className="p-1.5 hover:bg-white/10 rounded-lg"
                    style={{ color: C.Grass }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <button
                  onClick={() => setIsCalendarOpen(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl shadow-md hover:opacity-90 transition-colors"
                  style={{ backgroundColor: C.Grass, color: C.Pine }}
                >
                  <CalendarIcon size={18} />
                </button>
              </div>
            )}
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 no-scrollbar">
          {view === "login" ? (
            <LoginScreen
              pin={pin}
              setPin={setPin}
              handleLogin={handleLogin}
              resetAllData={resetAllData}
            />
          ) : view === "admin" ? (
            <>
              {adminSubView === "menu" && (
                <AdminMenu
                  setAdminSubView={setAdminSubView}
                  resetAllData={resetAllData}
                  setView={setView}
                  handleLogout={handleLogout}
                  appData={appData}
                />
              )}
              {adminSubView === "edit_stats" && (
                <EditStats
                  appData={appData}
                  updateData={saveData}
                  setAdminSubView={setAdminSubView}
                  currentDay={currentDay}
                  onPrev={prevDay}
                  onNext={nextDay}
                  onCalendar={() => setIsCalendarOpen(true)}
                />
              )}
              {adminSubView === "edit_schedule" && (
                <EditSchedule
                  currentDay={currentDay}
                  todaysSchedule={todaysSchedule}
                  newItem={newItem}
                  setNewItem={setNewItem}
                  updateData={saveData}
                  appData={appData}
                  setAdminSubView={setAdminSubView}
                  excelInput={excelInput}
                  setExcelInput={setExcelInput}
                  showExcelImport={showExcelImport}
                  setShowExcelImport={setShowExcelImport}
                  processImport={processScheduleImport}
                  onPrev={prevDay}
                  onNext={nextDay}
                  onCalendar={() => setIsCalendarOpen(true)}
                />
              )}
              {adminSubView === "edit_chars" && (
                <EditChars
                  currentDay={currentDay}
                  getDayCharacters={getDayCharacters}
                  updateData={saveData}
                  appData={appData}
                  setAdminSubView={setAdminSubView}
                  onPrev={prevDay}
                  onNext={nextDay}
                  onCalendar={() => setIsCalendarOpen(true)}
                />
              )}
              {adminSubView === "manage_tasks" && (
                <AdminTasksView
                  currentDay={currentDay}
                  todaysChecklists={todaysChecklists}
                  newTask={newTask}
                  setNewTask={setNewTask}
                  updateData={saveData}
                  appData={appData}
                  addTask={addTask}
                  deleteTask={deleteTask}
                  backAction={() => setAdminSubView("menu")}
                  onPrev={prevDay}
                  onNext={nextDay}
                  onCalendar={() => setIsCalendarOpen(true)}
                />
              )}
              {adminSubView === "edit_hours" && (
                <EditHours
                  appData={appData}
                  updateData={saveData}
                  setAdminSubView={setAdminSubView}
                  onPrev={prevDay}
                  onNext={nextDay}
                  onCalendar={() => setIsCalendarOpen(true)}
                />
              )}
              {adminSubView === "edit_orders" && (
                <EditOrders
                  appData={appData}
                  updateData={saveData}
                  setAdminSubView={setAdminSubView}
                  onPrev={prevDay}
                  onNext={nextDay}
                  onCalendar={() => setIsCalendarOpen(true)}
                />
              )}
              {adminSubView === "settings" && (
                <EditSettings
                  appData={appData}
                  updateData={saveData}
                  setAdminSubView={setAdminSubView}
                  resetAllData={resetAllData}
                />
              )}
            </>
          ) : (
            <div className="space-y-6">
              {view === "dashboard" && (
                <div className="space-y-6">
                  <Card
                    className="w-full p-4 flex justify-between items-center"
                    borderColor={C.Grass}
                  >
                    <div>
                      <h2
                        className="text-xl font-bold mb-1"
                        style={{ color: C.Pine }}
                      >
                        {greeting} 👋
                      </h2>
                      <div
                        className="flex items-center text-sm gap-2"
                        style={{ color: C.Bark }}
                      >
                        <weather.icon size={18} style={{ color: C.Pine }} />
                        <span className="font-bold">{weather.temp}°C</span>
                        <span>{weather.desc}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: C.Pine }}
                      >
                        {new Date().toLocaleTimeString("nl-NL", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatsWidget
                      dailyStats={appData.dailyStats}
                      currentDay={currentDay}
                      onViewDetails={() => setView("occupancy")}
                    />

                    {/* Character Summary Card */}
                    <Card
                      className="p-5 h-full flex flex-col"
                      borderColor={C.Grass}
                    >
                      <h3
                        className="font-bold text-sm uppercase mb-3 flex items-center"
                        style={{ color: C.Pine }}
                      >
                        <Smile size={16} className="mr-2" /> Karakters Vandaag
                      </h3>
                      <div className="space-y-2 flex-1 overflow-y-auto max-h-48">
                        {todaysCharacters.filter(
                          (c) => c.actor && c.actor.trim() !== ""
                        ).length > 0 ? (
                          todaysCharacters
                            .filter((c) => c.actor && c.actor.trim() !== "")
                            .map((char) => {
                              const charColor = getCharColorInfo(char.role);
                              return (
                                <div
                                  key={char.role}
                                  className="flex items-center justify-between p-2 rounded border bg-gray-50"
                                  style={{ borderColor: C.Grass }}
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                                      style={{
                                        backgroundColor: charColor.bg,
                                        color: charColor.text,
                                      }}
                                    >
                                      {char.role[0]}
                                    </div>
                                    <span
                                      className="text-sm font-bold"
                                      style={{ color: C.Bark }}
                                    >
                                      {char.role}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-600 truncate max-w-[100px]">
                                    {char.actor}
                                  </span>
                                </div>
                              );
                            })
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <p className="text-xs text-gray-400 italic text-center">
                              Nog geen karakters.
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setView("characters")}
                        className="mt-4 w-full text-xs font-bold py-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors text-center"
                        style={{ color: C.Pine }}
                      >
                        Bekijk Alles
                      </button>
                    </Card>

                    {/* NEW SHORTCUT: TAKENLIJST */}
                    <button
                      onClick={() => setView("checks")}
                      className="p-5 rounded-xl shadow-sm border flex items-center justify-between bg-white hover:bg-gray-50 transition-colors group h-full"
                      style={{ borderColor: C.Grass }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-pink-100 text-pink-800 group-hover:bg-pink-200 transition-colors">
                          <CheckSquare size={24} />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-lg text-gray-800">
                            Mijn Taken
                          </h3>
                          <p className="text-xs text-gray-500">
                            Bekijk checklist
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-gray-400 group-hover:text-gray-600 transition-colors"
                      />
                    </button>
                  </div>
                </div>
              )}
              {view === "occupancy" && (
                <OccupancyView
                  dailyStats={appData.dailyStats}
                  currentDay={currentDay}
                />
              )}
              {view === "handover" && (
                <HandoverView
                  currentDay={currentDay}
                  appData={appData}
                  updateData={saveData}
                />
              )}
              {(view === "dashboard" || view === "schedule") && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2
                      className="font-bold text-lg flex items-center"
                      style={{ color: C.Pine }}
                    >
                      <CalendarIcon
                        className="mr-2"
                        style={{ color: C.Grass }}
                      />{" "}
                      Programma
                    </h2>
                  </div>
                  {todaysSchedule.length === 0 ? (
                    <div
                      className="text-center py-10 rounded-xl border border-dashed text-sm bg-white"
                      style={{ color: C.Bark, borderColor: C.Grass }}
                    >
                      Geen activiteiten.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                      {todaysSchedule.map((item) => {
                        const typeInfo =
                          ACTIVITY_TYPES.find((t) => t.id === item.type) ||
                          ACTIVITY_TYPES[0];
                        const isPast = isPastItem(item);

                        return (
                          <Card
                            key={item.id}
                            className={`p-4 border-l-4 flex flex-col transition-opacity ${
                              isPast ? "opacity-50 grayscale" : ""
                            }`}
                            style={{
                              borderLeftColor: typeInfo.bg,
                              borderColor: C.Grass,
                            }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span
                                className="font-bold text-lg"
                                style={{ color: C.Pine }}
                              >
                                {item.time}
                              </span>
                              <span
                                className="text-[10px] px-2 py-1 rounded font-bold uppercase"
                                style={{
                                  backgroundColor: typeInfo.bg,
                                  color: typeInfo.text,
                                }}
                              >
                                {item.type}
                              </span>
                            </div>
                            <h3
                              className="font-bold text-base mb-1"
                              style={{ color: C.Pine }}
                            >
                              {item.title}
                            </h3>
                            <div
                              className="flex items-center text-xs mb-3"
                              style={{ color: C.Bark }}
                            >
                              <MapPin size={12} className="mr-1" /> {item.loc}
                            </div>
                            <div
                              className="mt-auto pt-3 border-t flex justify-between items-center"
                              style={{ borderColor: C.Grass }}
                            >
                              <div
                                className="flex items-center text-xs font-medium px-2 py-1 rounded-md"
                                style={{
                                  backgroundColor: C.Bg,
                                  color: C.Bark,
                                }}
                              >
                                <User
                                  size={12}
                                  className="mr-1"
                                  style={{ color: C.Pine }}
                                />{" "}
                                {item.staff || (
                                  <span className="italic opacity-50">
                                    Geen staff
                                  </span>
                                )}
                              </div>
                              {isPast && (
                                <span className="text-[10px] font-bold uppercase text-red-400 bg-red-50 px-2 py-1 rounded">
                                  Geweest
                                </span>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {view === "characters" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {todaysCharacters
                    .filter((c) => c.actor && c.actor.trim() !== "")
                    .map((char) => (
                      <Card
                        key={char.role}
                        className="p-5 flex flex-col items-center text-center border-2"
                        borderColor={C.Grass}
                      >
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 font-bold`}
                          style={{
                            backgroundColor: getCharColorInfo(char.role).bg,
                            color: getCharColorInfo(char.role).text,
                          }}
                        >
                          {char.role[0]}
                        </div>
                        <h3
                          className="font-bold text-base mb-1"
                          style={{ color: C.Pine }}
                        >
                          {char.role}
                        </h3>
                        <div
                          className="text-sm font-bold mb-2"
                          style={{ color: C.Bark }}
                        >
                          {char.actor}
                        </div>
                      </Card>
                    ))}
                  {todaysCharacters.filter(
                    (c) => c.actor && c.actor.trim() !== ""
                  ).length === 0 && (
                    <div
                      className="col-span-full text-center py-10 italic"
                      style={{ color: C.Bark }}
                    >
                      Nog geen karakters ingepland voor vandaag.
                    </div>
                  )}
                </div>
              )}
              {view === "checks" && (
                <div className="grid md:grid-cols-2 gap-6">
                  {["entertainment", "crea"].map((type) => (
                    <Card key={type} className="p-5" borderColor={C.Grass}>
                      <h3
                        className="font-bold uppercase mb-3 flex items-center pb-2 border-b text-sm"
                        style={{ color: C.Pine, borderColor: C.Grass }}
                      >
                        {type}
                      </h3>
                      {todaysChecklists[type].map((task) => (
                        <div
                          key={task.id}
                          onClick={() =>
                            saveData({
                              checklists: appData.checklists.map((t) =>
                                t.id === task.id ? { ...t, done: !t.done } : t
                              ),
                            })
                          }
                          className="p-3 rounded-lg border flex items-center mb-2 cursor-pointer hover:bg-gray-50"
                          style={{ borderColor: C.Grass }}
                        >
                          <div
                            className={`w-5 h-5 rounded border mr-3 flex items-center justify-center`}
                            style={{
                              backgroundColor: task.done
                                ? C.Grass
                                : "transparent",
                              borderColor: C.Grass,
                            }}
                          >
                            {task.done && (
                              <CheckCircle
                                size={14}
                                style={{ color: C.Pine }}
                              />
                            )}
                          </div>
                          <span
                            className={`text-sm ${
                              task.done ? "line-through opacity-50" : ""
                            }`}
                            style={{ color: C.Bark }}
                          >
                            {task.text}
                          </span>
                        </div>
                      ))}
                    </Card>
                  ))}
                </div>
              )}
              {view === "hours" && (
                <UserHoursView
                  updateData={saveData}
                  appData={appData}
                  setView={setView}
                />
              )}
              {view === "orders" && (
                <UserOrderView
                  updateData={saveData}
                  appData={appData}
                  setView={setView}
                />
              )}
            </div>
          )}
          <div className="h-20 md:hidden"></div>
        </main>
        {isCalendarOpen && (
          <CalendarModal
            currentDate={currentDay}
            onClose={() => setIsCalendarOpen(false)}
            onSelect={(date) => {
              setCurrentDay(date);
              setIsCalendarOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
