import React from 'react';

export default function JobCard({ candidate, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#ffffff',
        padding: '16px',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        border: '1px solid #e5e7eb',
        borderBottom: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      {/* Name & Role */}
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ margin: '0 0 4px 0', color: '#111827', fontSize: '1.15rem', fontWeight: '700', textTransform: 'capitalize' }}>
          {candidate.candidateName || 'Unknown Candidate'}
        </h4>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem', fontWeight: '600' }}>
          {candidate.role}
        </p>
      </div>

      {/* Extracted Contact Details */}
      <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '6px', border: '1px solid #f1f3f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '1rem' }}>📧</span>
          <span style={{ fontSize: '0.85rem', color: '#374151', wordBreak: 'break-all', fontWeight: '500' }}>
            {candidate.candidateEmail || 'No Email Found'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>📞</span>
          <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: '500' }}>
            {candidate.phone || 'N/A'}
          </span>
        </div>
      </div>

      {/* Match Score */}
      <p style={{ margin: '4px 0 0 0', color: '#16a34a', fontWeight: '800', textAlign: 'center', fontSize: '1rem' }}>
        Match: {Number(candidate.score).toFixed(2)}%
      </p>
    </div>
  );
}