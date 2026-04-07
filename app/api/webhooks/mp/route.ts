import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("🔥 Webhook Mercado Pago recebido:", body);

    const paymentId = body?.data?.id;

    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const payment = await res.json();

    console.log("💰 Status do pagamento:", payment.status);

    if (payment.status === "approved") {
      console.log("✅ PAGAMENTO APROVADO");

      // 👉 aqui você pode liberar pedido, saldo, etc
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    return NextResponse.json({ error: true });
  }
}