import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Members',
  description: 'Manage your members',
}

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 