import { NextRequest, NextResponse } from 'next/server';
import { uploadToIrys } from '@/lib/irys';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const network = formData.get('network') as 'devnet' | 'mainnet' || 'devnet';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uri = await uploadToIrys(
      buffer,
      file.type,
      network,
      [{ name: 'Asset-Type', value: 'image' }]
    );

    return NextResponse.json({ uri });
  } catch (error: any) {
    console.error('Upload image error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
