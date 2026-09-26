import PatientSearch from '../../components/PatientSearch';

export default function DoctorSearch() {
  return <PatientSearch endpoint="/doctor/patients/search" />;
}
