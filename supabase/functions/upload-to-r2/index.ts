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

async function sha256(data: Uint8Array): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function hex(bytes: Uint8Array): string {
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getSignatureKey(key: string, dateStamp: string, region: string, service: string) {
  let kDate = await hmacSha256(new TextEncoder().encode('AWS4' + key), dateStamp);
  let kRegion = await hmacSha256(kDate, region);
  let kService = await hmacSha256(kRegion, service);
  let kSigning = await hmacSha256(kService, 'aws4_request');
  return kSigning;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const accountId = formData.get('accountId') as string;
    const accessKeyId = formData.get('accessKeyId') as string;
    const secretAccessKey = formData.get('secretAccessKey') as string;
    const bucketName = formData.get('bucketName') as string;
    const publicDomain = formData.get('publicDomain') as string;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file || !accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ext = file.name.split('.').pop() || 'bin';
    const objectKey = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const fileBytes = new Uint8Array(await file.arrayBuffer());
    const contentHash = await sha256(fileBytes);

    const host = `${accountId}.r2.cloudflarestorage.com`;
    const url = `https://${host}/${bucketName}/${objectKey}`;
    const region = 'auto';
    const service = 's3';

    const now = new Date();
    const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    const dateStamp = amzDate.slice(0, 8);

    const canonicalHeaders = `content-type:${file.type || 'application/octet-stream'}\nhost:${host}\nx-amz-content-sha256:${contentHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = [
      'PUT',
      '/' + bucketName + '/' + objectKey,
      '',
      canonicalHeaders,
      signedHeaders,
      contentHash,
    ].join('\n');

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      await sha256(new TextEncoder().encode(canonicalRequest)),
    ].join('\n');

    const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
    const signature = hex(await hmacSha256(signingKey, stringToSign));

    const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const r2Response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'Host': host,
        'x-amz-content-sha256': contentHash,
        'x-amz-date': amzDate,
        'Authorization': authHeader,
      },
      body: fileBytes,
    });

    if (!r2Response.ok) {
      const errorText = await r2Response.text();
      console.error('R2 upload error:', errorText);
      return new Response(
        JSON.stringify({ error: 'R2 upload failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build public URL
    let publicUrl: string;
    if (publicDomain) {
      const domain = publicDomain.replace(/\/$/, '');
      publicUrl = `${domain}/${objectKey}`;
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
