import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '飲み放題QR注文',
  description: 'QRコードから飲み放題メニューを注文',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
