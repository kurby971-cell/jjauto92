const reservationColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
  no_show: 'bg-orange-100 text-orange-600 border-orange-200',
}

const reservationLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  active: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
  no_show: 'No-show',
}

const vehicleColors: Record<string, string> = {
  disponible: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  en_location: 'bg-[#C9A84C]/15 text-[#A07830] border-[#C9A84C]/30',
  en_maintenance: 'bg-orange-100 text-orange-700 border-orange-200',
  hors_service: 'bg-red-100 text-red-600 border-red-200',
}

const vehicleLabels: Record<string, string> = {
  disponible: 'Disponible',
  en_location: 'En location',
  en_maintenance: 'Maintenance',
  hors_service: 'Hors service',
}

const depositColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-500 border-gray-200',
  authorized: 'bg-blue-100 text-blue-700 border-blue-200',
  captured: 'bg-orange-100 text-orange-700 border-orange-200',
  partially_captured: 'bg-orange-100 text-orange-600 border-orange-200',
  released: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  expired: 'bg-red-100 text-red-500 border-red-200',
}

const depositLabels: Record<string, string> = {
  pending: 'En attente',
  authorized: 'Autorisée',
  captured: 'Capturée',
  partially_captured: 'Partielle',
  released: 'Libérée',
  expired: 'Expirée',
}

interface Props {
  status: string
  type: 'reservation' | 'vehicle' | 'deposit' | 'customer'
}

export default function StatusBadge({ status, type }: Props) {
  let colorClass = 'bg-gray-100 text-gray-500 border-gray-200'
  let label = status

  if (type === 'reservation') {
    colorClass = reservationColors[status] ?? colorClass
    label = reservationLabels[status] ?? status
  } else if (type === 'vehicle') {
    colorClass = vehicleColors[status] ?? colorClass
    label = vehicleLabels[status] ?? status
  } else if (type === 'deposit') {
    colorClass = depositColors[status] ?? colorClass
    label = depositLabels[status] ?? status
  } else if (type === 'customer') {
    colorClass = status === 'verified'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : status === 'blacklisted'
        ? 'bg-red-100 text-red-600 border-red-200'
        : 'bg-gray-100 text-gray-500 border-gray-200'
    label = status === 'verified' ? 'Vérifié' : status === 'blacklisted' ? 'Blacklisté' : 'Non vérifié'
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${colorClass}`}>
      {label}
    </span>
  )
}
