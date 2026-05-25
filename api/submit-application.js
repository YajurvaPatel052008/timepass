// ========================================================
// VERCEL SERVERLESS FUNCTION - SECURE SUPABASE ENDPOINT
// This function runs on the backend, keeping API keys safe
// ========================================================

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // CORS headers for frontend requests
        res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Get form data from request
        const applicationData = req.body;

        // Validate required fields
        if (!applicationData.email || !applicationData.name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Initialize Supabase with server-side credentials (never exposed)
        const { createClient } = await import('@supabase/supabase-js');
        
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('❌ Supabase credentials not configured');
            return res.status(500).json({ 
                error: 'Database not configured',
                fallbackId: 'TL-' + Math.floor(100000 + Math.random() * 900000)
            });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Insert into database
        const { data, error } = await supabase
            .from('creator_applications')
            .insert([applicationData])
            .select();

        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }

        console.log('✅ Application saved:', applicationData.id);
        return res.status(200).json({ 
            success: true, 
            id: applicationData.id,
            message: 'Application submitted successfully'
        });

    } catch (error) {
        console.error('❌ API Error:', error);
        return res.status(500).json({ 
            error: 'Failed to submit application',
            details: error.message 
        });
    }
}
