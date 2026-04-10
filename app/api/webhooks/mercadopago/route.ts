import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("Webhook recebido:", body);

    if (body.type === "payment") {
      const paymentId = body.data.id;

      // buscar pagamento na API do MP
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          },
        }
      );

      const payment = await response.json();

      console.log("Status:", payment.status);

      if (payment.status === "approved") {
        // 👉 AQUI você atualiza no banco
        console.log("Pagamento aprovado!");
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: true }, { status: 500 });
  }
}