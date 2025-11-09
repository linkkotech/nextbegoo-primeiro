import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// TODO: Implementar lógica de conversão Moneta (1:1.30)
const requestSchema = z.object({
  userId: z.string().uuid(),
  amountReal: z.number().positive().optional(),
  amountMoneta: z.number().positive().optional(),
  direction: z.enum(['real_to_moneta', 'moneta_to_real']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amountReal, amountMoneta, direction } = requestSchema.parse(body);

    const CONVERSION_RATE = 1.3; // 1 Real = 1.30 Moneta

    // TODO: Implementar:
    // 1. Buscar MonetaWallet do usuário
    // 2. Validar saldo suficiente
    // 3. Aplicar conversão
    // 4. Atualizar saldos
    // 5. Registrar transação

    let convertedAmount = 0;
    if (direction === 'real_to_moneta' && amountReal) {
      convertedAmount = amountReal * CONVERSION_RATE;
    } else if (direction === 'moneta_to_real' && amountMoneta) {
      convertedAmount = amountMoneta / CONVERSION_RATE;
    }

    return NextResponse.json(
      {
        message: 'Conversão Moneta - Em implementação',
        userId,
        direction,
        convertedAmount,
        rate: CONVERSION_RATE,
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
