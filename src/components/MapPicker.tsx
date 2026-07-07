import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type MapPickerProps = {
  latitude: string
  longitude: string
  onChange: (latitude: number, longitude: number) => void
}

const defaultCenter: [number, number] = [18.4861, -69.9312]

function MapPicker({ latitude, longitude, onChange }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const initialCenter = getCoordinates(latitude, longitude) ?? defaultCenter
    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: getCoordinates(latitude, longitude) ? 15 : 12,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    map.on('click', (event) => {
      const nextLatitude = Number(event.latlng.lat.toFixed(7))
      const nextLongitude = Number(event.latlng.lng.toFixed(7))
      onChange(nextLatitude, nextLongitude)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [latitude, longitude, onChange])

  useEffect(() => {
    const map = mapRef.current
    const coords = getCoordinates(latitude, longitude)
    if (!map || !coords) return

    if (!markerRef.current) {
      markerRef.current = L.marker(coords).addTo(map)
    } else {
      markerRef.current.setLatLng(coords)
    }

    map.setView(coords, Math.max(map.getZoom(), 15))
  }, [latitude, longitude])

  return (
    <div className="location-picker">
      <div>
        <strong>Selecciona la ubicacion en el mapa</strong>
        <p>Haz click sobre el punto exacto donde se realizara la mision. Las coordenadas se completan automaticamente.</p>
      </div>
      <div ref={containerRef} className="location-map" />
    </div>
  )
}

function getCoordinates(latitude: string, longitude: string): [number, number] | null {
  const parsedLatitude = Number(latitude)
  const parsedLongitude = Number(longitude)

  if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) return null
  return [parsedLatitude, parsedLongitude]
}

export default MapPicker
