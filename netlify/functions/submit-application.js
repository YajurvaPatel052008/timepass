// ========================================================
// NETLIFY SERVERLESS FUNCTION - SECURE SUPABASE ENDPOINT
// This function runs on the backend, keeping API keys safe
// ========================================================

const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse request body
        let applicationData;
        try {
            applicationData = JSON.parse(event.body);
        } catch (e) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid JSON' })
            };
        }

        // Validate required fields
        if (!applicationData.email || !applicationData.name) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Get Supabase credentials from environment variables
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('❌ Supabase credentials not configured');
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    error: 'Database not configured',
                    fallbackId: 'TL-' + Math.floor(100000 + Math.random() * 900000)
                })
            };
        }

        // Initialize Supabase client
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
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                success: true, 
                id: applicationData.id,
                message: 'Application submitted successfully'
            })
        };

    } catch (error) {
        console.error('❌ API Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Failed to submit application',
                details: error.message 
            })
        };
    }
};
