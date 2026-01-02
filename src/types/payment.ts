export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'insurance'
export type PaymentStatus = 'pending' | 'completed' | 'cancelled' | 'refunded'

export interface Payment {
    id: string
    patient_id: string
    session_id?: string
    amount: number
    method: PaymentMethod
    status: PaymentStatus
    description?: string
    invoice_number?: string
    payment_date: string
    created_at: string
    updated_at: string
}
