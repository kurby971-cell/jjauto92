interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminClientDetailPage({ params }: Props) {
  const { id } = await params
  return <div>Client {id}</div>
}
