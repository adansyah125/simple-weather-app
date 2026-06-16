import { useCallback, useState } from 'react'

const API_KEY = '08cc7e46b0e9a19c71c98c4baa844730'
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

const MOCK_WEATHER = {
  city: 'Jakarta',
  country: 'ID',
  temp: 31,
  feelsLike: 34,
  tempMin: 28,
  tempMax: 33,
  humidity: 74,
  pressure: 1009,
  windSpeed: 4.5,
  windDeg: 310,
  visibility: 8000,
  description: 'berawan',
  icon: '04d',
  main: 'Clouds',
  sunrise: 1716830000,
  sunset: 1716875000,
  timezone: 25200,
  dt: 1716850000,
}

const MOCK_FORECAST = [
  { day: 'Hari Ini', temp: 31, icon: '02d', main: 'Clouds' },
  { day: 'Sen', temp: 30, icon: '03d', main: 'Clouds' },
  { day: 'Sel', temp: 29, icon: '01d', main: 'Clear' },
  { day: 'Rab', temp: 28, icon: '10d', main: 'Rain' },
  { day: 'Kam', temp: 30, icon: '02d', main: 'Clouds' },
]

const MOCK_HOURLY = [
  { time: 'Sekarang', temp: 31, icon: '04d' },
  { time: '13:00', temp: 32, icon: '04d' },
  { time: '14:00', temp: 32, icon: '04d' },
  { time: '15:00', temp: 31, icon: '10d' },
  { time: '16:00', temp: 30, icon: '10d' },
  { time: '17:00', temp: 29, icon: '10d' },
  { time: '18:00', temp: 28, icon: '04d' },
  { time: '19:00', temp: 28, icon: '04d' },
]

function translateMain(main) {
  const dict = {
    Clear: 'Cerah',
    Clouds: 'Berawan',
    Rain: 'Hujan',
    Drizzle: 'Gerimis',
    Thunderstorm: 'Badai',
    Snow: 'Salju',
    Mist: 'Kabut',
    Haze: 'Kabut',
    Fog: 'Kabut',
  }
  return dict[main] ?? main
}

function parseWeatherData(data) {
  return {
    city: data.name,
    country: data.sys.country,
    temp: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    tempMin: Math.round(data.main.temp_min),
    tempMax: Math.round(data.main.temp_max),
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: data.wind.speed,
    windDeg: data.wind.deg,
    visibility: data.visibility,
    description: translateMain(data.weather[0].main),
    icon: data.weather[0].icon,
    main: data.weather[0].main,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    timezone: data.timezone,
    dt: data.dt,
  }
}

function isApiKeyValid() {
  return API_KEY !== 'YOUR_API_KEY' && API_KEY.length > 0
}

async function tryFetch(url, cityName) {
  if (!isApiKeyValid()) {
    await new Promise((r) => setTimeout(r, 800))
    return null
  }

  const res = await fetch(url)

  if (res.status === 401) {
    console.warn('API Key invalid or not activated. Using mock data.')
    return null
  }

  if (!res.ok) {
    if (res.status === 404) throw new Error(cityName ? 'Kota tidak ditemukan' : 'Lokasi tidak ditemukan')
    throw new Error('Gagal mengambil data cuaca')
  }

  return await res.json()
}

async function fetchWeatherByCity(city) {
  const data = await tryFetch(
    `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`,
    city,
  )

  if (!data) {
    return { ...MOCK_WEATHER, city, description: translateMain(MOCK_WEATHER.main) }
  }

  return parseWeatherData(data)
}

async function fetchWeatherByCoords(lat, lon) {
  const data = await tryFetch(
    `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`,
  )

  if (!data) {
    return { ...MOCK_WEATHER, description: translateMain(MOCK_WEATHER.main) }
  }

  return parseWeatherData(data)
}

async function fetchForecastByCity(city) {
  const data = await tryFetch(
    `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&cnt=40&appid=${API_KEY}`,
    city,
  )

  if (!data) {
    await new Promise((r) => setTimeout(r, 600))
    return { daily: MOCK_FORECAST, hourly: MOCK_HOURLY }
  }

  return parseForecastData(data)
}

async function fetchForecastByCoords(lat, lon) {
  const data = await tryFetch(
    `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=40&appid=${API_KEY}`,
  )

  if (!data) {
    await new Promise((r) => setTimeout(r, 600))
    return { daily: MOCK_FORECAST, hourly: MOCK_HOURLY }
  }

  return parseForecastData(data)
}

function parseForecastData(data) {
  const dailyTemps = {}
  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString('id-ID', { weekday: 'short' })
    if (!dailyTemps[date]) dailyTemps[date] = []
    dailyTemps[date].push(item.main.temp)
  })

  const daily = Object.entries(dailyTemps).slice(0, 5).map(([day, temps]) => {
    const midday = data.list.find((item) => {
      const d = new Date(item.dt * 1000).toLocaleDateString('id-ID', { weekday: 'short' })
      return d === day
    })
    return {
      day,
      temp: Math.round(temps.reduce((a, b) => a + b, 0) / temps.length),
      icon: midday?.weather[0]?.icon ?? '01d',
      main: midday?.weather[0]?.main ?? 'Clear',
    }
  })

  const hourly = data.list.slice(0, 8).map((item) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }),
    temp: Math.round(item.main.temp),
    icon: item.weather[0].icon,
  }))

  return { daily, hourly }
}

export function useWeather() {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchCity = useCallback(async (city) => {
    if (!city?.trim()) return
    setLoading(true)
    setError(null)
    try {
      const [weatherData, forecastData] = await Promise.all([
        fetchWeatherByCity(city.trim()),
        fetchForecastByCity(city.trim()),
      ])
      setWeather(weatherData)
      setForecast(forecastData)
    } catch (err) {
      setError(err.message)
      setWeather(null)
      setForecast(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Browser tidak mendukung deteksi lokasi')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        })
      })

      const { latitude, longitude } = position.coords
      const [weatherData, forecastData] = await Promise.all([
        fetchWeatherByCoords(latitude, longitude),
        fetchForecastByCoords(latitude, longitude),
      ])
      setWeather(weatherData)
      setForecast(forecastData)
    } catch (err) {
      if (err.code === 1) {
        setError('Akses lokasi ditolak. Silakan cari kota secara manual.')
      } else if (err.code === 2) {
        setError('Gagal mendapatkan lokasi. Coba lagi.')
      } else if (err.code === 3) {
        setError('Waktu habis. Coba lagi.')
      } else {
        setError(err.message || 'Gagal mendeteksi lokasi')
      }
      setWeather(null)
      setForecast(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return { weather, forecast, loading, error, searchCity, detectLocation }
}
