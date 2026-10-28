import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="container section">
      <EmptyState
        icon={Home}
        title="Page Not Found"
        description="The page you are looking for does not exist or may have been relocated."
        actionLabel="Back to Home"
        onAction={() => navigate('/')}
      />
    </div>
  );
}
