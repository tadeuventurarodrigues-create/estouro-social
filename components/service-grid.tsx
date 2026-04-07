import Link from 'next/link';
import { formatCurrency } from '@/lib/format';

type ServiceItem = {
  id: number;
  name: string;
  category: string;
  description: string;
  rate: number;
  min: number;
  max: number;
  imageUrl?: string | null;
};

export function ServiceGrid({ services }: { services: ServiceItem[] }) {
  return (
    <div className="grid catalog">
      {services.map((service) => (
        <div key={service.id} className="card service-card" style={{ overflow: 'hidden' }}>
          {service.imageUrl ? (
            <img
              src={service.imageUrl}
              alt={service.name}
              style={{
                width: '100%',
                height: 180,
                objectFit: 'cover',
                borderRadius: 14,
                marginBottom: 14,
                border: '1px solid rgba(255,255,255,.08)',
              }}
            />
          ) : null}

          <div className="badge">{service.category}</div>
          <h3>{service.name}</h3>
          <p className="muted small">{service.description}</p>
          <p>
            <strong>{formatCurrency(service.rate)}</strong>
          </p>

          <div style={{ marginTop: 14 }}>
            <Link className="button primary" href={`/checkout?serviceId=${service.id}`}>
              Comprar
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}