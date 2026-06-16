import { useCallback, useEffect, useState } from 'react'
import { Search, MapPin, Droplets, Wind, Eye, Thermometer, Sun, Moon, Sunrise, Sunset, Gauge, RefreshCw, Crosshair, CloudRain } from 'lucide-react'

import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { useWeather } from '../hooks/use-weather'
import { useTheme } from '../hooks/use-theme'

function getWindDirection(deg) {
  const dirs = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL']
  return dirs[Math.round(deg / 45) % 8]
}

function formatTime(timestamp, timezoneOffset) {
  const date = new Date((timestamp + timezoneOffset) * 1000)
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })
}

function getWeatherGradient(main, isDark) {
  const gradients = {
    Clear: isDark
      ? 'from-amber-600/30 from-10% via-orange-500/10 via-40% to-background'
      : 'from-amber-400/40 from-10% via-orange-300/20 via-40% to-background',
    Clouds: isDark
      ? 'from-zinc-500/30 from-10% via-zinc-400/10 via-40% to-background'
      : 'from-zinc-400/40 from-10% via-zinc-300/20 via-40% to-background',
    Rain: isDark
      ? 'from-blue-700/40 from-10% via-blue-600/15 via-40% to-background'
      : 'from-blue-500/40 from-10% via-blue-400/20 via-40% to-background',
    Drizzle: isDark
      ? 'from-sky-600/35 from-10% via-sky-500/10 via-40% to-background'
      : 'from-sky-400/35 from-10% via-sky-300/15 via-40% to-background',
    Thunderstorm: isDark
      ? 'from-purple-700/40 from-10% via-indigo-600/15 via-40% to-background'
      : 'from-purple-500/35 from-10% via-indigo-400/15 via-40% to-background',
    Snow: isDark
      ? 'from-blue-200/20 from-10% via-sky-200/10 via-40% to-background'
      : 'from-blue-100/50 from-10% via-sky-50/30 via-40% to-background',
    Mist: isDark
      ? 'from-zinc-500/25 from-10% via-zinc-400/10 via-40% to-background'
      : 'from-zinc-300/35 from-10% via-zinc-200/15 via-40% to-background',
    Haze: isDark
      ? 'from-zinc-500/25 from-10% via-zinc-400/10 via-40% to-background'
      : 'from-zinc-300/35 from-10% via-zinc-200/15 via-40% to-background',
    Fog: isDark
      ? 'from-zinc-500/25 from-10% via-zinc-400/10 via-40% to-background'
      : 'from-zinc-300/35 from-10% via-zinc-200/15 via-40% to-background',
  }
  return gradients[main] ?? (isDark
    ? 'from-zinc-700/20 via-background to-background'
    : 'from-zinc-300/25 via-background to-background')
}

function WeatherSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 p-6 rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm">
        <Skeleton className="size-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="size-12 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="size-24 rounded-full bg-secondary flex items-center justify-center mb-6">
        <Sun className="size-12 text-muted-foreground/50" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Cek Cuaca</h2>
      <p className="text-muted-foreground max-w-sm">
        Cari nama kota atau gunakan lokasi kamu untuk melihat cuaca terkini
      </p>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="size-24 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <CloudRain className="size-12 text-destructive/50" />
      </div>
      <h2 className="text-xl font-semibold mb-2 text-destructive">Gagal!</h2>
      <p className="text-muted-foreground max-w-sm">{message}</p>
    </div>
  )
}

export function WeatherApp() {
  const [inputValue, setInputValue] = useState('')
  const [located, setLocated] = useState(false)
  const { weather, forecast, loading, error, searchCity, detectLocation } = useWeather()
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    if (!located) {
      setLocated(true)
      detectLocation()
    }
  }, [located, detectLocation])

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault()
      searchCity(inputValue)
    },
    [inputValue, searchCity],
  )

  return (
    <div className="min-h-screen transition-colors duration-500">
      <div
        className={`min-h-screen bg-gradient-to-b ${weather ? getWeatherGradient(weather.main, isDark) : isDark ? 'from-zinc-700/15 via-background to-background' : 'from-zinc-300/20 via-background to-background'}`}
      >
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <Sun className="size-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight">Cuaca</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="relative mb-8 animate-slide-up">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Cari kota..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="h-12 pl-10 pr-4 rounded-xl bg-card border-muted text-base shadow-sm focus-visible:ring-2 focus-visible:ring-ring/50 transition-all duration-200"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="h-12 px-6 rounded-xl font-medium shadow-sm transition-all duration-200"
              >
                {loading ? (
                  <RefreshCw className="size-4 animate-spin" />
                ) : (
                  'Cari'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={detectLocation}
                disabled={loading}
                className="size-12 rounded-xl shrink-0"
                title="Gunakan lokasi saya"
              >
                <Crosshair className="size-4" />
              </Button>
            </div>
          </form>

          {loading && <WeatherSkeleton />}

          {error && <ErrorState message={error} />}

          {!loading && !error && !weather && <EmptyState />}

          {!loading && !error && weather && (
            <div className="space-y-6">
              <div className="p-6 sm:p-8 rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm animate-fade-in">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="size-4" />
                      <span className="text-sm font-medium">{weather.city}, {weather.country}</span>
                    </div>
                    <div className="text-6xl sm:text-7xl font-light tracking-tighter">
                      {weather.temp}°
                    </div>
                    <p className="text-muted-foreground capitalize">{weather.description}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                      alt={weather.description}
                      className="size-24 sm:size-28 -mr-2 -mt-2 drop-shadow-lg"
                    />
                    <Badge variant="secondary" className="text-xs font-medium">
                      Terasa {weather.feelsLike}°
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t flex items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Sunrise className="size-4" />
                    <span>{formatTime(weather.sunrise, weather.timezone)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sunset className="size-4" />
                    <span>{formatTime(weather.sunset, weather.timezone)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Thermometer className="size-4" />
                    <span>T: {weather.tempMax}° R: {weather.tempMin}°</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: Droplets,
                    label: 'Kelembapan',
                    value: `${weather.humidity}%`,
                    sub: weather.humidity > 70 ? 'Tinggi' : weather.humidity > 40 ? 'Normal' : 'Rendah',
                    delay: 1,
                  },
                  {
                    icon: Wind,
                    label: 'Angin',
                    value: `${weather.windSpeed} m/s`,
                    sub: getWindDirection(weather.windDeg),
                    delay: 2,
                  },
                  {
                    icon: Eye,
                    label: 'Jarak Pandang',
                    value: `${(weather.visibility / 1000).toFixed(1)} km`,
                    sub: weather.visibility > 5000 ? 'Baik' : 'Kabur',
                    delay: 3,
                  },
                  {
                    icon: Gauge,
                    label: 'Tekanan',
                    value: `${weather.pressure} hPa`,
                    sub: weather.pressure > 1013 ? 'Tinggi' : weather.pressure < 1013 ? 'Rendah' : 'Normal',
                    delay: 4,
                  },
                ].map((item) => (
                  <Card
                    key={item.label}
                    className={`animate-fade-in stagger-${item.delay} border-muted/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                        <item.icon className="size-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                        <p className="text-lg font-semibold tracking-tight">{item.value}</p>
                        <p className="text-xs text-muted-foreground/70">{item.sub}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {forecast && forecast.hourly && (
                <div className="animate-fade-in stagger-5">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                    Prakiraan Per Jam
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                    {forecast.hourly.map((hour, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-1.5 p-4 min-w-[88px] rounded-xl border bg-card/80 backdrop-blur-sm hover:bg-accent/50 transition-all duration-200 cursor-default shrink-0"
                      >
                        <span className="text-xs text-muted-foreground font-medium">
                          {hour.time}
                        </span>
                        <img
                          src={`https://openweathermap.org/img/wn/${hour.icon}.png`}
                          alt=""
                          className="size-10"
                        />
                        <span className="text-sm font-semibold">{hour.temp}°</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {forecast && forecast.daily && (
                <div className="animate-fade-in stagger-5 pb-8">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                    Prakiraan 5 Hari
                  </h3>
                  <Card className="border-muted/50 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-4 divide-y">
                      {forecast.daily.map((day, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                        >
                          <span className="w-16 text-sm font-medium">{day.day}</span>
                          <img
                            src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                            alt=""
                            className="size-9"
                          />
                          <span className="text-sm text-muted-foreground capitalize flex-1">
                            {day.main === 'Clear' ? 'Cerah' : day.main === 'Clouds' ? 'Berawan' : day.main === 'Rain' ? 'Hujan' : day.main === 'Drizzle' ? 'Gerimis' : day.main === 'Thunderstorm' ? 'Badai' : day.main === 'Snow' ? 'Salju' : day.main}
                          </span>
                          <span className="text-sm font-semibold tabular-nums">{day.temp}°</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
