import type { InfoItemProps } from '@/types/tournament';

const InfoItem = ({ label, value }: InfoItemProps) => (
  <div>
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

export default InfoItem;
