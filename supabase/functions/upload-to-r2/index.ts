import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.20';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

    const r2 = new AwsClient({
      accessKeyId,
      secretAccessKey,
      region: 'auto',
      service: 's3',
    });

    const url = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${objectKey}`;

    console.log('Uploading to:', url);

    const r2Response = await r2.fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
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
