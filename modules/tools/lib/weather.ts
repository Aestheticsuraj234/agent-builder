import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const weatherTool = tool(
  async ({ location }) => {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`
    );
    const geoData = await geoRes.json();
    const place = geoData.results?.[0];

    if (!place) {
      return `Could not find location: ${location}`;
    }

    const forecastRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=3`
    );
    const forecast = await forecastRes.json();

    return JSON.stringify({
      location: `${place.name}, ${place.country_code ?? ""}`.trim(),
      current: forecast.current,
      daily: forecast.daily,
    });
  },
  {
    name: "weather",
    description: "Get weather forecast for a city or location",
    schema: z.object({
      location: z.string().describe("City or place name"),
    }),
  }
);
