'use client';

import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PaymentButtonProps {
    appointmentId: string;
    amount: number;
    disabled?: boolean;
}

export function PaymentButton({ appointmentId, amount, disabled }: PaymentButtonProps) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // Call API to create checkout session
            const response = await fetch('/api/stripe/create-booking-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appointmentId,
                    redirectUrl: window.location.href, // Return to this page
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Error al iniciar el pago');
            }

            const { url } = await response.json();

            // Redirect to Stripe Checkout
            window.location.href = url;
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
            setLoading(false);
        }
    };

    if (disabled) {
        return (
            <Button variant="outline" disabled className="w-full gap-2 text-green-600 border-green-200 bg-green-50">
                <CreditCard size={16} />
                Pagado
            </Button>
        );
    }

    return (
        <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />}
            Pagar ${amount} MXN
        </Button>
    );
}
