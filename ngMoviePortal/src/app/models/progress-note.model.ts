export interface ProgressNoteRoutedData {
  noteId?: number;
  clientId?: number | null; // not null
  actionType: any; // not null
  moduleType: any; // not null
  referralId?: number | null; // used by care coordination | appointment
  noteTypeId?: number | null; // used by care coordination
  noteText?: string | null; // used by care coordination
  appointmentId?: number | null; // used by appointment
  IsStudentNote?: boolean | false;
  ApprovedBy?: number | null;
}
