import { useEffect, useState } from 'react';
import { FileText, Stethoscope } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import EmptyState from '../../components/EmptyState';

export default function MedicalHistory() {
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient
      .get('/patient/medical-history')
      .then(({ data }) => setHistory(data.medicalHistory))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load medical history'));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Medical History</h2>
          <p>Notes and prescriptions added by your doctors over time.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {history === null ? (
        <p>Loading...</p>
      ) : history.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title="No medical history yet"
            message="Notes added by your doctor during consultations will appear here."
          />
        </div>
      ) : (
        <div className="timeline">
          {history
            .slice()
            .reverse()
            .map((h, idx) => (
              <div className="timeline-item" key={idx}>
                <span className="timeline-dot">
                  <Stethoscope size={16} />
                </span>
                <div className="timeline-content">
                  <div className="timeline-date">{new Date(h.date).toLocaleString()}</div>
                  <p>{h.note}</p>
                  {h.prescribedBy?.specialization && (
                    <small style={{ color: 'var(--text-muted)' }}>
                      — Dr. via {h.prescribedBy.specialization}
                    </small>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
