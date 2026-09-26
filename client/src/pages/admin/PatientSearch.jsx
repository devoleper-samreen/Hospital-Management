import PatientSearch from '../../components/PatientSearch';

export default function AdminPatientSearch() {
  return <PatientSearch endpoint="/admin/patients/search" />;
}
