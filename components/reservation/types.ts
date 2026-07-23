export type DriverData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  licenseNumber: string
}

export type DocumentRefs = {
  licenseRecto: string | null
  licenseVerso: string | null
  idDocument: string | null
  idDocumentVerso: string | null // CNI verso only — null for passeport (page unique)
  idDocumentType: 'cni' | 'passeport' | null
}

export type ReservationDraft = {
  vehicleId: string
  vehicleSlug: string | null
  dateStart: string
  dateEnd: string
  nbDays: number
  selectedOptionIds: string[]
  baseAmount: number
  optionsAmount: number
  totalAmount: number
  depositAmount: number
  driver: DriverData | null
  documents: DocumentRefs
  reservationId: string | null
  reservationNumber: string | null
  lastStep: number
}

export const EMPTY_DOCS: DocumentRefs = {
  licenseRecto: null,
  licenseVerso: null,
  idDocument: null,
  idDocumentVerso: null,
  idDocumentType: null,
}
