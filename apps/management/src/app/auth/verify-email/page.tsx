export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <h1 className="text-2xl font-bold">Check Your Email</h1>
      <p>
        We&apos;ve sent you a verification link. Please check your email to continue.
      </p>
      <p className="text-sm text-muted-foreground">
        Can&apos;t find the email? Check your spam folder or request a new verification link.
      </p>
    </div>
  )
} 