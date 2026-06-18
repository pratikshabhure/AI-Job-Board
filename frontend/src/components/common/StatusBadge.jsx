import React from 'react';

const StatusBadge = ({ status, type = 'application' }) => {
  // Handle undefined or null status
  if (!status) {
    return null;
  }

  const getStatusClass = () => {
    const statusLower = status.toLowerCase();
    
    if (type === 'application') {
      switch (statusLower) {
        case 'applied':
          return 'badge-applied';
        case 'shortlisted':
          return 'badge-shortlisted';
        case 'rejected':
          return 'badge-rejected';
        default:
          return 'badge bg-gray-100 text-gray-800';
      }
    }
    
    if (type === 'job') {
      switch (statusLower) {
        case 'open':
          return 'badge-open';
        case 'closed':
          return 'badge-closed';
        default:
          return 'badge bg-gray-100 text-gray-800';
      }
    }
    
    return 'badge bg-gray-100 text-gray-800';
  };

  return (
    <span className={getStatusClass()}>
      {status}
    </span>
  );
};

export default StatusBadge;