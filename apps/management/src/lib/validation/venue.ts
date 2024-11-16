export type FormErrors = {
  name?: string
  email?: string
}

export function validateVenueForm(formData: FormData): FormErrors {
  const errors: FormErrors = {}
  const name = formData.get('name') as string
  const email = formData.get('contact_email') as string

  if (!name || name.trim().length === 0) {
    errors.name = 'Name is required'
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address'
  }

  return errors
} 