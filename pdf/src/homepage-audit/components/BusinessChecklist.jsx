import React from 'react';
import BusinessChecklistRow from './BusinessChecklistRow';
import { ShieldIcon, PhoneIcon, GlobeIcon, PinIcon, ImageIcon, DocumentIcon, MessageIcon } from './icons';
import theme from '../theme';

// Checklist items are {label, status} only (per the mapper contract) — no
// icon field, so the icon is chosen from the label here, presentation-only.
const LABEL_ICON = {
  'verified business': <ShieldIcon color={theme.color.green} />,
  'phone number': <PhoneIcon color={theme.color.green} />,
  website: <GlobeIcon color={theme.color.green} />,
  'business address': <PinIcon color={theme.color.green} />,
  'photos added': <ImageIcon color={theme.color.green} />,
  'services added': <DocumentIcon color={theme.color.green} />,
  'recent posts': <MessageIcon color={theme.color.green} />,
};

export default function BusinessChecklist({ items }) {
  const list = items || [];
  return (
    <div>
      {list.map((item, idx) => (
        <BusinessChecklistRow
          key={item.label || idx}
          icon={LABEL_ICON[String(item.label || '').toLowerCase()] || <ShieldIcon color={theme.color.green} />}
          label={item.label}
          status={item.status}
          isLast={idx === list.length - 1}
        />
      ))}
    </div>
  );
}
