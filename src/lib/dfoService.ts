import { supabase } from './supabase';

// Mock Patient Message Injector (The "Risk Engine" simulation)
export const simulateIncomingPatientMessage = async (patientName: string, text: string, riskLevel: 'green' | 'yellow' | 'red') => {
  const sentimentScore = riskLevel === 'red' ? -0.85 : riskLevel === 'yellow' ? -0.35 : 0.75;
  
  // 1. Create a thread with the strict schema
  const { data: thread, error: threadErr } = await supabase
    .from('threads')
    .insert([
      {
        patient_name: patientName,
        last_message: text,
        risk_level: riskLevel,
        sentiment_score: sentimentScore,
        status: 'open',
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (threadErr || !thread) {
    console.error("Simulation error logging thread", threadErr);
    return;
  }

  // 2. Insert the patient message
  await supabase
    .from('messages')
    .insert([
      {
        thread_id: thread.id,
        sender_type: 'patient',
        message: text
      }
    ]);
    
  // 3. Create SLA Tracking record
  // Red = 5 mins, Yellow = 15 mins, Green = 60 mins
  const slaMinutes = riskLevel === 'red' ? 5 : riskLevel === 'yellow' ? 15 : 60;
  const deadline = new Date();
  deadline.setMinutes(deadline.getMinutes() + slaMinutes);

  await supabase
    .from('sla_tracking')
    .insert([
      {
        thread_id: thread.id,
        response_deadline: deadline.toISOString(),
        status: 'pending'
      }
    ]);

  // 4. Automated AI Acknowledgement
  await supabase
    .from('messages')
    .insert([
      {
        thread_id: thread.id,
        sender_type: 'ai',
        message: "JanmaSethu Sakhi: Your concern has been triaged. A clinical specialist will be with you shortly. (SLA: " + slaMinutes + "m)"
      }
    ]);
};

// Send a clinical message
export const sendClinicalMessage = async (threadId: string, role: string, _userId: string, message: string) => {
  const { error } = await supabase
    .from('messages')
    .insert([
      {
        thread_id: threadId,
        sender_type: role,
        message: message
      }
    ]);
    
  if (error) throw error;
  
  // Update last message on thread
  await supabase
    .from('threads')
    .update({ 
      last_message: '(Clinician) ' + message
    })
    .eq('id', threadId);

  // Mark SLA as completed if this is the first response
  await supabase
    .from('sla_tracking')
    .update({ 
      status: 'completed',
      responded_at: new Date().toISOString()
    })
    .eq('thread_id', threadId)
    .eq('status', 'pending');
};

// Takeover / Assignment logic
export const assignThread = async (threadId: string, role: 'nurse' | 'doctor', userId: string) => {
  const { error } = await supabase
    .from('threads')
    .update({ 
      assigned_to: userId,
      assigned_role: role,
      status: 'assigned'
    })
    .eq('id', threadId);
    
  if (error) throw error;
  
  // Log takeover in message history
  await supabase
    .from('messages')
    .insert([
      {
        thread_id: threadId,
        sender_type: 'ai',
        message: `SYSTEM ALERT: Thread assigned to ${role.toUpperCase()}. AI responses are now secondary to clinical control.`
      }
    ]);
};
