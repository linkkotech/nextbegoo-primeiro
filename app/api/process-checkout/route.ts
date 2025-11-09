import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// TODO: Implementar lógica de checkout com Stripe e Escrow
const requestSchema = z.object({
  merchantId: z.string().uuid(),
  amount: z.number().positive(),
  items: z.array(z.any()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchantId, amount, items } = requestSchema.parse(body);

    // TODO: Implementar:
    // 1. Validação de elegibilidade do merchant
    // 2. Cálculo de taxa de serviço (5%)
    // 3. Cálculo de cashback
    // 4. Criação de PaymentIntent no Stripe
    // 5. Criação de CheckoutIntent no banco (ESCROW)
    // 6. Retorno do client_secret

    return NextResponse.json(
      {
        message: 'Checkout endpoint - Em implementação',
        merchantId,
        amount,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
