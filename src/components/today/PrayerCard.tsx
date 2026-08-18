import { useEffect, useMemo, useState } from 'react'
import { buildSchedule, cancelReminders, isNative, scheduleReminders } from '../../lib/notifications'
import {
  DEFAULT_LOCATION,
  PRAYER_LABEL,
  formatTime,
  nextPrayer,
  untilLabel,
  type GeoLocation,
} from '../../lib/prayer'

export default function PrayerCard({
  location,
  reminders,
  onChangeLocation,
  onChangeReminders,
}: {
  location: GeoLocation
  reminders: boolean
  onChangeLocation: (loc: GeoLocation) => void
  onChangeReminders: (on: boolean) => void
}) {
  const [now, setNow] = useState(() => new Date())
  const [editing, setEditing] = useState(false)
  const [lat, setLat] = useState(String(location.lat))
  const [lng, setLng] = useState(String(location.lng))
  const [label, setLabel] = useState(location.label)
  const [geoError, setGeoError] = useState('')
  const [native, setNative] = useState(false)
  const [remindState, setRemindState] = useState('')

  useEffect(() => {
    void isNative().then(setNative)
  }, [])

  // Reopening the panel shows the location actually in effect, not the
  // values from an edit that was abandoned.
  const openEditor = () => {
    if (!editing) {
      setLat(String(location.lat))
      setLng(String(location.lng))
      setLabel(location.label)
      setGeoError('')
    }
    setEditing((e) => !e)
  }

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  const next = nextPrayer(location, now)
  // Only for the web copy — do not rebuild a 7-day schedule on every render.
  const plannedCount = useMemo(() => buildSchedule(location).length, [location])

  const coord = (raw: string, limit: number) => {
    const t = raw.trim()
    if (t === '') return null // an empty field must not silently become 0
    const v = Number(t)
    return Number.isFinite(v) && Math.abs(v) <= limit ? v : null
  }

  const save = () => {
    const nlat = coord(lat, 90)
    const nlng = coord(lng, 180)
    if (nlat === null || nlng === null) {
      setGeoError('Enter a latitude between −90 and 90 and a longitude between −180 and 180.')
      return
    }
    const next = { lat: nlat, lng: nlng, label: label.trim() || 'My location' }
    onChangeLocation(next)
    setGeoError('')
    setEditing(false)
    // Alarms already on the device hold the OLD city's times — re-arm them.
    if (reminders) void scheduleReminders(next).then(describe).then(setRemindState)
  }

  const describe = (r: Awaited<ReturnType<typeof scheduleReminders>>) =>
    r.status === 'scheduled'
      ? `Reminders set for the next 7 days (${r.count}).`
      : r.status === 'inexact'
        ? `Set (${r.count}), but this device refused exact alarms — allow "Alarms & reminders" in settings so prayer times are not delayed.`
        : r.status === 'denied'
          ? 'Notifications are turned off for Deen Daily in your device settings.'
          : r.status === 'unsupported'
            ? 'Reminders need the installed app build.'
            : 'Reminders could not be set on this device.'

  const useDevice = () => {
    if (!navigator.geolocation) {
      setGeoError('This device has no location service. Enter coordinates instead.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(4))
        setLng(pos.coords.longitude.toFixed(4))
        // The old place name would now be wrong for these coordinates.
        if (label.trim() === location.label.trim()) setLabel('My location')
        setGeoError('')
      },
      () => setGeoError('Location permission denied. Enter coordinates instead.'),
    )
  }

  return (
    <div className="prayer-card" id="prayers">
      <div className="prayer-next">
        <div>
          <div className="eyebrow">Next prayer</div>
          <div className="pname">
            {PRAYER_LABEL[next.id]}
            {next.tomorrow ? ' (tomorrow)' : ''}
          </div>
        </div>
        <div className="ptime">
          <b>{formatTime(next.time)}</b>
          <span>in {untilLabel(next.time, now)}</span>
        </div>
      </div>
      <button className="prayer-loc" onClick={openEditor}>
        {location.label} · {location.lat.toFixed(2)}, {location.lng.toFixed(2)} — computed on this
        device{editing ? ' ▴' : ' ▾'}
      </button>
      {editing && (
        <div className="prayer-edit">
          <div className="qrow">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="place name"
              aria-label="Place name"
            />
          </div>
          <div className="qrow">
            <input
              type="number"
              step="0.0001"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="latitude"
              aria-label="Latitude"
            />
            <input
              type="number"
              step="0.0001"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="longitude"
              aria-label="Longitude"
            />
          </div>
          {geoError ? <p className="muted">{geoError}</p> : null}
          <div className="qrow">
            <button className="btn small" onClick={useDevice}>
              Use my location
            </button>
            <button
              className="btn small"
              onClick={() => {
                setLat(String(DEFAULT_LOCATION.lat))
                setLng(String(DEFAULT_LOCATION.lng))
                setLabel(DEFAULT_LOCATION.label)
              }}
            >
              Reset
            </button>
            <button className="btn small gold" onClick={save}>
              Save
            </button>
          </div>
          <p className="muted" style={{ marginTop: 6 }}>
            Times use the ISNA method, calculated on this device — no account, no network, and your
            location is never sent anywhere. Shown in this device's time zone.
          </p>
          <div className="qrow" style={{ marginTop: 8 }}>
            {native ? (
              reminders ? (
                <button
                  className="btn small"
                  onClick={async () => {
                    await cancelReminders()
                    onChangeReminders(false)
                    setRemindState('Reminders turned off.')
                  }}
                >
                  Turn reminders off
                </button>
              ) : (
                <button
                  className="btn small"
                  onClick={async () => {
                    const r = await scheduleReminders(location)
                    if (r.status === 'scheduled' || r.status === 'inexact') onChangeReminders(true)
                    setRemindState(describe(r))
                  }}
                >
                  Remind me for prayers &amp; adhkar
                </button>
              )
            ) : (
              <p className="muted">
                Prayer and adhkar reminders need the installed app build — a web page cannot wake
                your phone reliably. The next {plannedCount} reminders are ready and will start as
                soon as you run the app build.
              </p>
            )}
          </div>
          {remindState ? (
            <p className="muted" style={{ marginTop: 4 }}>
              {remindState}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}
