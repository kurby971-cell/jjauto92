interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminReservationDetailPage({ params }: Props) {
  const { id } = await params
  return <div>Réservation {id}</div>
}
