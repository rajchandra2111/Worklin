import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { type, record, old_record } = payload;
    
    console.log(`Processing email trigger for type: ${type}`);

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Email won't be sent.");
      return new Response(JSON.stringify({ message: "No API key" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    let subject = '';
    let html = '';
    let to = ''; // In a real app, you would fetch the user's email from auth.users using their ID in the record.
                 // For now, we'll log it or use a default if available.
                 
    // Example logic to determine email content based on event type
    if (type === 'new_proposal') {
      subject = 'You received a new proposal!';
      html = `<p>A freelancer has submitted a proposal for your project.</p>
              <p><strong>Bid Amount:</strong> $${record.proposed_rate}</p>
              <p>Log in to Worklin to review it.</p>`;
      // You would fetch the client's email using record.project_id -> projects.client_id
      to = 'client@example.com'; 
    } 
    else if (type === 'new_message') {
      subject = 'You have a new message on Worklin';
      html = `<p>You received a new message regarding your contract.</p>
              <p><em>"${record.content}"</em></p>
              <p>Log in to reply.</p>`;
      // You would determine if the sender was client or freelancer and send to the other party
      to = 'user@example.com';
    }
    else if (type === 'contract_update') {
      if (old_record && old_record.status === 'pending' && record.status === 'active') {
        subject = 'Contract Funded & Active!';
        html = `<p>Great news! The client has funded the escrow. You can now begin work.</p>`;
        to = 'freelancer@example.com';
      } else if (old_record && old_record.status === 'active' && record.status === 'completed') {
        subject = 'Payment Released!';
        html = `<p>The client has approved your work and released the funds to your account!</p>`;
        to = 'freelancer@example.com';
      } else {
         return new Response(JSON.stringify({ message: "No email needed for this update" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }

    if (!to || !subject) {
      return new Response(JSON.stringify({ message: "Invalid payload or unhandled event" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Worklin <notifications@worklin.com>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Resend Error: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error sending email:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
