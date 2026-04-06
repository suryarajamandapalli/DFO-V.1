import { supabase } from './supabase';

// Mock Patient Message Injector for testing since NLP backend is dead.
export const simulateIncomingPatientMessage = async (patientName: string, text: string, riskLevel: 'green' | 'yellow' | 'red') => {
  // 1. Create a dummy thread
  const { data: thread, error: threadErr } = await supabase
    .from('conversation_threads')
    .insert([
      {
        channel: 'web',
        metadata: {
          patient_name: patientName,
          last_message: text,
          sentiment_score: riskLevel === 'red' ? -0.9 : riskLevel === 'yellow' ? -0.4 : 0.8
        },
        status: riskLevel
      }
    ])
    .select()
    .single();

  if (threadErr || !thread) {
    console.error("Simulation error logging thread", threadErr);
    return;
  }

  // 2. Insert the message
  await supabase
    .from('conversation_messages')
    .insert([
      {
        thread_id: thread.id,
        sender_type: 'patient',
        content: text
      }
    ]);
    
  // 3. Insert Sakhi AI automated reply immediately
  await supabase
    .from('conversation_messages')
    .insert([
      {
        thread_id: thread.id,
        sender_type: 'ai',
        content: "Your message has been received by our clinical system. A triage specialist will review this shortly."
      }
    ]);
};

// Send a clinical message
export const sendClinicalMessage = async (threadId: string, role: string, userId: string, message: string) => {
  const { error } = await supabase
    .from('conversation_messages')
    .insert([
      {
        thread_id: threadId,
        sender_type: role,
        sender_id: userId,
        content: message
      }
    ]);
    
  if (error) throw error;
  
  // Update metadata on thread to keep list fresh
  
  // First fetch the old thread to preserve existing metadata
  const { data: thr } = await supabase.from('conversation_threads').select('metadata').eq('id', threadId).single();
  const meta = thr?.metadata || {};
  
  await supabase
    .from('conversation_threads')
    .update({ 
      metadata: { ...meta, last_message: '(Clinical) ' + message },
      updated_at: new Date().toISOString()
    })
    .eq('id', threadId);
};

// Takeover Thread
export const takeoverThread = async (threadId: string, role: 'nurse' | 'doctor', userId: string) => {
  const { error } = await supabase
    .from('conversation_threads')
    .update({ 
      assigned_user_id: userId,
      assigned_role: role,
      ownership: 'Clinical',
      is_locked: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', threadId);
    
  if (error) throw error;
  
  // Inject automated takeover log
  await supabase
    .from('conversation_messages')
    .insert([
      {
        thread_id: threadId,
        sender_type: 'ai',
        content: `🚨 THREAD TAKEOVER: A human ${role} has claimed this thread. Automated AI routing is now disabled.`
      }
    ]);
};
