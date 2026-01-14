import { redirect } from 'next/navigation';

export default function ResumePage() {
  // Server-side redirect to the PDF
  redirect('/assets/static/resume.pdf');
}
