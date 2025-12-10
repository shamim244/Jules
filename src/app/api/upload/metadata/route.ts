import { NextRequest, NextResponse } from 'next/server';
import { uploadToIrys } from '@/lib/irys';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { metadata, network } = body;

    if (!metadata) {
      return NextResponse.json({ error: 'No metadata provided' }, { status: 400 });
    }

    const metadataString = JSON.stringify(metadata);

    const uri = await uploadToIrys(
      metadataString,
      'application/json',
      network || 'devnet',
      [{ name: 'Asset-Type', value: 'metadata' }]
    );

    return NextResponse.json({ uri });
  } catch (error: any) {
    console.error('Upload metadata error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
