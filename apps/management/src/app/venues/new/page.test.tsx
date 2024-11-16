import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import NewVenue from './page'
import { supabase } from '@/lib/supabase'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(),
    })),
  },
}))

describe('NewVenue', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the form correctly', () => {
    render(<NewVenue />)
    
    expect(screen.getByLabelText(/name \*/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contact email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save venue/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<NewVenue />)
    
    const submitButton = screen.getByRole('button', { name: /save venue/i })
    fireEvent.click(submitButton)

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
  })

  it('validates email format', async () => {
    render(<NewVenue />)
    
    const emailInput = screen.getByLabelText(/contact email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    
    const submitButton = screen.getByRole('button', { name: /save venue/i })
    fireEvent.click(submitButton)

    expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument()
  })

  it('submits form successfully', async () => {
    const mockInsert = jest.fn().mockResolvedValue({ error: null })
    ;(supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    })

    render(<NewVenue />)
    
    // Fill in form
    fireEvent.change(screen.getByLabelText(/name \*/i), {
      target: { value: 'Test Venue' },
    })
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: '123 Test St' },
    })
    fireEvent.change(screen.getByLabelText(/contact email/i), {
      target: { value: 'test@example.com' },
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save venue/i }))

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith([{
        name: 'Test Venue',
        address: '123 Test St',
        contact_email: 'test@example.com',
      }])
      expect(mockRouter.push).toHaveBeenCalledWith('/venues')
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  it('handles submission errors', async () => {
    const mockError = new Error('Database error')
    const mockInsert = jest.fn().mockResolvedValue({ error: mockError })
    ;(supabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    })

    render(<NewVenue />)
    
    // Fill in form
    fireEvent.change(screen.getByLabelText(/name \*/i), {
      target: { value: 'Test Venue' },
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save venue/i }))

    await waitFor(() => {
      expect(screen.getByText('Database error')).toBeInTheDocument()
    })
  })

  it('navigates back when cancel is clicked', () => {
    render(<NewVenue />)
    
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockRouter.back).toHaveBeenCalled()
  })
}) 