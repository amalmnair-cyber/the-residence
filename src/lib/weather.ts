import "server-only";

export interface Weather {
  temperatureC: number;
  description: string;
}

// WMO weather interpretation codes — the subset Open-Meteo actually
// returns for current conditions. Falls back to "—" for any code not
// listed here rather than guessing.
const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy rain showers",
  95: "Thunderstorm",
};

// Open-Meteo: free, no API key, no signup — a good fit for a small
// per-property "currently X°C" line without adding another account to
// manage. Never throws: the property page should render fine whether or
// not the weather happened to be reachable.
export async function getCurrentWeather(lat: number, lon: number): Promise<Weather | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=celsius`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;

    const data = await res.json();
    const temperatureC = data?.current?.temperature_2m;
    const weatherCode = data?.current?.weather_code;
    if (typeof temperatureC !== "number" || typeof weatherCode !== "number") return null;

    return {
      temperatureC: Math.round(temperatureC),
      description: WEATHER_CODES[weatherCode] ?? "—",
    };
  } catch (err) {
    console.error("weather fetch failed", err);
    return null;
  }
}
