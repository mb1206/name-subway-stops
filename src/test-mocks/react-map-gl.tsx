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

export function Source({ children }: { children?: ReactNode; [key: string]: unknown }) {
  return <div data-testid="source">{children}</div>
}

export function Layer(_props: unknown) {
  return null
}
