const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function hmacSha256(key: Uint8Array, message: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
  return new Uint8Array(sig);
}

async function sha256Hex(data: Uint8Array): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function toHex(bytes: Uint8Array): string {
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getSignatureKey(key: string, dateStamp: string, region: string, service: string) {
  const kDate = await hmacSha256(new TextEncoder().encode('AWS4' + key), dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  return kSigning;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const accountId = (formData.get('accountId') as string)?.trim();
    const accessKeyId = (formData.get('accessKeyId') as string)?.trim();
    const secretAccessKey = (formData.get('secretAccessKey') as string)?.trim();
    const bucketName = (formData.get('bucketName') as string)?.trim();
    const publicDomain = (formData.get('publicDomain') as string)?.trim() || '';
    const folder = (formData.get('folder') as string)?.trim() || 'uploads';

    if (!file || !accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ext = file.name.split('.').pop() || 'bin';
    const objectKey = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    const contentType = file.type || 'application/octet-stream';

    // R2 uses path-style: https://<accountId>.r2.cloudflarestorage.com/<bucket>/<key>
    const host = `${accountId}.r2.cloudflarestorage.com`;
    const endpoint = `https://${host}`;
    const canonicalUri = `/${bucketName}/${objectKey}`;
    const url = `${endpoint}${canonicalUri}`;

    const region = 'auto';
    const service = 's3';

    const now = new Date();
    const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    const dateStamp = amzDate.slice(0, 8);

    // Use UNSIGNED-PAYLOAD for simpler signing
    const payloadHash = 'UNSIGNED-PAYLOAD';

    // Canonical headers must be sorted by lowercase name
    const canonicalHeaders = [
      `content-type:${contentType}`,
      `host:${host}`,
      `x-amz-content-sha256:${payloadHash}`,
      `x-amz-date:${amzDate}`,
    ].join('\n') + '\n';

    const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = [
      'PUT',
      canonicalUri,
      '', // empty query string
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    console.log('Canonical URI:', canonicalUri);
    console.log('Host:', host);
    console.log('Date:', amzDate);

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const canonicalRequestHash = await sha256Hex(new TextEncoder().encode(canonicalRequest));

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      canonicalRequestHash,
    ].join('\n');

    const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
    const signature = toHex(await hmacSha256(signingKey, stringToSign));

    const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    console.log('Uploading to:', url);

    const r2Response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': amzDate,
        'Authorization': authHeader,
      },
      body: fileBytes,
    });

    if (!r2Response.ok) {
      const errorText = await r2Response.text();
      console.error('R2 error status:', r2Response.status);
      console.error('R2 error body:', errorText);
      return new Response(
        JSON.stringify({ error: 'R2 upload failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build public URL
    let publicUrl: string;
    if (publicDomain) {
      const domain = publicDomain.replace(/\/$/, '');
      const prefix = domain.startsWith('http') ? '' : 'https://';
      publicUrl = `${prefix}${domain}/${objectKey}`;
    } else {
      publicUrl = url;
    }

    return new Response(
      JSON.stringify({ url: publicUrl, key: objectKey }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
