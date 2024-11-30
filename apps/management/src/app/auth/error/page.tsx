import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AuthError() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-muted-foreground mb-6">
          There was a problem verifying your email. The link may have expired or been used already.
        </p>
        <Button asChild>
          <Link href="/auth/signin">
            Return to Sign In
          </Link>
        </Button>
      </div>
    </div>
  )
} 