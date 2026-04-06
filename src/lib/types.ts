export type RiskLevel = 'green' | 'yellow' | 'red';
export type SenderType = 'patient' | 'nurse' | 'doctor' | 'ai' | 'CRO';
export type ThreadOwnership = 'AI' | 'Clinical';

export interface Thread {
  id: string;
  domain: string;
  user_id: string; // patient id
  channel: string;
  status: RiskLevel; // green/yellow/red natively used for risk status
  ownership: string; // AI, Nurse, etc
  assigned_role: 'cro' | 'nurse' | 'doctor' | null;
  assigned_user_id: string | null;
  is_locked: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  metadata: any; // Used to store patient_name, last_message, etc
}

export interface Message {
  id: string;
  thread_id: string;
  sender_type: SenderType;
  sender_id: string | null;
  content: string; // content instead of message
  created_at: string;
}
