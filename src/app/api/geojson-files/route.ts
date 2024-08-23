// src/app/api/geojson-files/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const directoryPath = path.join(process.cwd(), 'public', 'geojson');
  
  try {
    const files = await fs.promises.readdir(directoryPath);
    const geoJsonFiles = files
      .filter(file => file.endsWith('.geojson'))
      .map(file => ({
        name: file.replace('.geojson', '').replace(/_/g, ' '),
        file: file  // Keep the full filename
      }));
    
    return NextResponse.json(geoJsonFiles);
  } catch (error) {
    console.error('Error reading directory:', error);
    return NextResponse.json({ error: 'Unable to scan directory' }, { status: 500 });
  }
}