import type { ReactNode } from 'react'

export function Map({ children }: { children?: ReactNode }) {
  return <div data-testid="map">{children}</div>
}

export function Marker({ children, longitude, latitude }: {
  children?: ReactNode
  longitude: number
  latitude: number
}) {
  return (
    <div data-testid="marker" data-lng={longitude} data-lat={latitude}>
      {children}
    </div>
  )
}
