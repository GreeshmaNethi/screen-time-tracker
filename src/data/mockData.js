import { format, subDays } from "date-fns";

export const APPS = [
  { id: "instagram", name: "Instagram", icon: "📸", color: "#E1306C", gradient: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" },
  { id: "linkedin",  name: "LinkedIn",  icon: "💼", color: "#0077B5", gradient: "linear-gradient(135deg, #0077B5, #00a0dc)" },
  { id: "twitter",   name: "Twitter/X", icon: "🐦", color: "#1DA1F2", gradient: "linear-gradient(135deg, #1DA1F2, #0d8ecf)" },
  { id: "youtube",   name: "YouTube",   icon: "▶️", color: "#FF0000", gradient: "linear-gradient(135deg, #FF0000, #cc0000)" },
  { id: "tiktok",    name: "TikTok",    icon: "🎵", color: "#69C9D0", gradient: "linear-gradient(135deg, #010101, #69C9D0)" },
  { id: "reddit",    name: "Reddit",    icon: "👾", color: "#FF4500", gradient: "linear-gradient(135deg, #FF4500, #ff6534)" },
  { id: "snapchat",  name: "Snapchat",  icon: "👻", color: "#FFFC00", gradient: "linear-gradient(135deg, #FFFC00, #f0e800)" },
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function generateHourly(total) {
  const hours = new Array(24).fill(0);
  let remaining = total;
  const activeHours = [9,10,11,12,13,14,15,16,17,18,19,20,21,22];
  for (let i = 0; i < activeHours.length && remaining > 0; i++) {
    const chunk = Math.min(rand(0, Math.ceil(remaining / (activeHours.length - i))), remaining);
    hours[activeHours[i]] = chunk;
    remaining -= chunk;
  }
  return hours;
}

export function generateMockUsage() {
  const usage = {};
  APPS.forEach(app => {
    usage[app.id] = {};
    for (let d = 0; d < 7; d++) {
      const date = format(subDays(new Date(), d), "yyyy-MM-dd");
      const totalMinutes = rand(10, 120);
      usage[app.id][date] = {
        totalMinutes,
        opens: rand(3, 30),
        hourly: generateHourly(totalMinutes),
      };
    }
  });
  return usage;
}

// Generates a single day's fresh data (used when today's entry is missing)
export function generateTodayData() {
  const totalMinutes = rand(20, 110);
  return {
    totalMinutes,
    opens: rand(4, 25),
    hourly: generateHourly(totalMinutes),
  };
}

export function generateDefaultLimits() {
  const limits = {};
  APPS.forEach(app => {
    limits[app.id] = { enabled: true, minutes: 60 };
  });
  return limits;
}
