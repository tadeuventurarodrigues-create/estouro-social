import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Cadastro desativado nesta versão. Use apenas o login admin configurado no ambiente.',
    },
    { status: 400 }
  );
}