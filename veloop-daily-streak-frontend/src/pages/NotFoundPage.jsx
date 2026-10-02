import { Compass } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import p from './Page.module.css';

export default function NotFoundPage() {
  return (
    <div className={p.card}>
      <EmptyState icon={Compass} title="Page not found" text="That page doesn't exist." action={<Button to="/dashboard" size="sm">Back to dashboard</Button>} />
    </div>
  );
}
