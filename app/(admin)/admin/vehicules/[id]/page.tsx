interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminVehiculeDetailPage({ params }: Props) {
  const { id } = await params
  return <div>Véhicule {id}</div>
}
