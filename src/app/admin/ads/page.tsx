import { redirect } from 'next/navigation';

export default function AdsManagementPage() {
  // This page used to be a UI mock with non-persistent actions.
  // Redirect to the real admin advertisements page where actions are backed by the database.
  redirect('/admin/advertisements');
}