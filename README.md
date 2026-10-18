# 🌦️ STRATOS — Real-Time Weather Intelligence

**Above the Ordinary.**

STRATOS is a modern, responsive weather application built to provide real-time weather information, forecasts, and atmospheric insights through a sleek, cosmic-inspired user interface. It allows users to explore weather conditions across cities, view upcoming forecasts, save favorite locations, and access useful atmospheric information in one place.

🌐 **Live Demo:** [STRATOS Weather App](https://stratos-rouge.vercel.app/?city=Chennai)

💻 **GitHub Repository:** [RojaShree03/STRATOS](https://github.com/RojaShree03/STRATOS)

## ✨ Features

- 🌍 **Current Weather:** View current weather conditions and temperature for different cities.
- 🔎 **Smart City Search:** Search for cities with location suggestions.
- 📍 **Geolocation:** Retrieve weather information for your current location with browser permission.
- 🕒 **Hourly Forecast:** Explore upcoming hourly weather conditions.
- 📅 **7-Day Forecast:** View the weather outlook for the coming days.
- 🗺️ **Weather Map:** Explore geographic weather information.
- 🌫️ **Air Quality:** View air-quality information when available.
- 🌅 **Sunrise and Sunset:** Access daily sunrise and sunset information.
- ⭐ **Saved Cities:** Save favorite cities and quickly switch between locations.
- ⚖️ **City Comparison:** Compare weather information across cities.
- 🔔 **Weather Alerts:** Display weather advisories when available.
- 🧠 **Daily Briefing:** View a weather briefing when available.
- ⚙️ **Customizable Settings:** Configure temperature units, themes, default city, and automatic refresh preferences.
- 💾 **Local Storage:** Retain supported settings, recent searches, and saved cities in the browser.
- 📱 **Responsive Design:** Access the application across desktop and mobile devices.

## 🛠️ Technology Stack

- **React** — Component-based user interface
- **Vite** — Development server and production build tool
- **JavaScript** — Application logic
- **Tailwind CSS** — Responsive styling
- **Lucide React** — Interface icons
- **OpenWeather API integration** — Weather data, depending on the service configuration
- **Git and GitHub** — Version control and source code hosting
- **Vercel** — Application deployment

## 🚀 Getting Started

### Prerequisites

Before running the project, install:

- [Node.js](https://nodejs.org/)
- npm, included with Node.js
- An OpenWeather API key if required by the weather service configuration

### 1. Clone the repository

```bash
git clone https://github.com/RojaShree03/STRATOS.git
cd STRATOS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the API key

Check `src/services/weatherApi` to confirm the exact environment variable name expected by the application.

If the code uses `VITE_OPENWEATHER_API_KEY`, create a `.env` file in the project root:

```env
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

Replace the placeholder with your own API key from [OpenWeather](https://openweathermap.org/api).

Never commit your actual API key to GitHub. Keep the `.env` file private and use placeholder values in `.env.example`.

**Security note:** Vite exposes variables prefixed with `VITE_` to client-side code. Use provider-side restrictions and quotas where available; use a backend proxy if the key must remain secret.

### 4. Run the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

### 5. Build for production

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 🌐 Deployment

STRATOS is deployed using Vercel.

To deploy your own version:

1. Sign in to [Vercel](https://vercel.com/) using GitHub.
2. Import the `RojaShree03/STRATOS` repository.
3. Select **Vite** as the framework preset.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Configure the environment variable required by your weather service.
7. Click **Deploy**.

After updating environment variables, redeploy the application for the changes to take effect.

## 🔐 Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_OPENWEATHER_API_KEY` | OpenWeather API key, if this is the variable configured in the weather service |

Ensure `.env` is excluded from version control. Do not store real credentials in the repository or in public documentation.

## 🧪 Available Commands

| Command | Description |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start the development server |
| `npm run build` | Create the production build |
| `npm run preview` | Preview the production build |

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Commit and push your changes.
5. Submit a pull request.


##  Disclaimer

This project is created for **practice and educational purposes only**. It is intended to help develop and improve web development skills. It is not intended for commercial use.