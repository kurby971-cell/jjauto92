// Types générés depuis schema.sql JJAUTO92

export type VehicleCategory = 'economy' | 'compact' | 'standard' | 'suv' | 'premium' | 'luxury' | 'utility'
export type FuelType = 'essence' | 'diesel' | 'electrique' | 'hybride' | 'hybride_rechargeable'
export type TransmissionType = 'manuelle' | 'automatique'
export type VehicleStatus = 'disponible' | 'en_location' | 'en_maintenance' | 'hors_service'
export type ReservationStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'no_show'
export type ReservationSource = 'web' | 'telephone' | 'admin' | 'partenaire'
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded'
export type PaymentType = 'reservation' | 'supplement' | 'remboursement' | 'penalite'
export type DepositStatus = 'pending' | 'authorized' | 'captured' | 'partially_captured' | 'released' | 'expired'
export type FuelLevel = 'vide' | 'quart' | 'demi' | 'trois_quarts' | 'plein'

export interface Vehicle {
  id: string
  created_at: string
  updated_at: string
  brand: string
  model: string
  year: number
  license_plate: string
  vin: string | null
  color: string
  category: VehicleCategory
  fuel_type: FuelType
  transmission: TransmissionType
  seats: number
  doors: number
  daily_rate: number
  deposit_amount: number
  mileage_included_per_day: number
  excess_mileage_rate: number
  status: VehicleStatus
  current_mileage: number
  is_active: boolean
  insurance_policy_number: string | null
  insurance_expiry: string | null
  technical_inspection_date: string | null
  registration_document_url: string | null
  photos: VehiclePhoto[]
  features: string[]
  description: string | null
  slug: string | null
  location: string
}

export interface VehiclePhoto {
  url: string
  label: string
  is_primary: boolean
}

export interface Customer {
  id: string
  created_at: string
  updated_at: string
  auth_user_id: string | null
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_country: string
  driving_license_number: string | null
  driving_license_expiry: string | null
  driving_license_country: string | null
  driving_license_category: string | null
  id_document_type: 'cni' | 'passeport' | 'titre_sejour' | null
  id_document_number: string | null
  id_document_expiry: string | null
  stripe_customer_id: string | null
  is_verified: boolean
  verified_at: string | null
  is_blacklisted: boolean
  blacklist_reason: string | null
  rgpd_consent_date: string | null
  marketing_consent: boolean
  data_deletion_requested: boolean
  admin_notes: string | null
  total_reservations: number
  total_spent: number
}

export interface Reservation {
  id: string
  created_at: string
  updated_at: string
  reservation_number: string
  customer_id: string
  vehicle_id: string
  start_date: string
  end_date: string
  pickup_time: string
  return_time: string
  total_days: number
  status: ReservationStatus
  source: ReservationSource
  daily_rate_snapshot: number
  base_amount: number
  options_amount: number
  discount_amount: number
  discount_reason: string | null
  total_amount: number
  deposit_amount: number
  options: Record<string, boolean | number>
  pickup_location: string
  return_location: string
  mileage_start: number | null
  fuel_level_start: FuelLevel | null
  mileage_end: number | null
  fuel_level_end: FuelLevel | null
  excess_mileage_charge: number
  fuel_charge: number
  damage_charge: number
  cancelled_at: string | null
  cancellation_reason: string | null
  cancellation_fee: number
  confirmed_at: string | null
  completed_at: string | null
  admin_notes: string | null
}

export interface Payment {
  id: string
  created_at: string
  updated_at: string
  reservation_id: string
  customer_id: string
  stripe_payment_intent_id: string | null
  stripe_charge_id: string | null
  amount: number
  currency: string
  status: PaymentStatus
  type: PaymentType
  refund_amount: number
  refund_reason: string | null
  refunded_at: string | null
  stripe_refund_id: string | null
  description: string | null
  failure_reason: string | null
  metadata: Record<string, unknown>
}

export interface Deposit {
  id: string
  created_at: string
  updated_at: string
  reservation_id: string
  customer_id: string
  stripe_payment_intent_id: string | null
  stripe_setup_intent_id: string | null
  stripe_payment_method_id: string | null
  amount: number
  currency: string
  captured_amount: number
  status: DepositStatus
  authorized_at: string | null
  authorization_expiry: string | null
  captured_at: string | null
  capture_reason: string | null
  released_at: string | null
  release_notes: string | null
}

export interface RentalOption {
  id: string
  code: string
  name: string
  description: string | null
  price_per_day: number
  price_fixed: number
  is_active: boolean
  sort_order: number
}

export interface VehicleUnavailability {
  id: string
  created_at: string
  updated_at: string
  vehicle_id: string
  reservation_id: string | null
  start_date: string
  end_date: string
  reason: string
}

// Type générique Supabase Database pour le client typé
export type Database = {
  public: {
    Tables: {
      vehicles: { Row: Vehicle; Insert: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Vehicle, 'id'>> }
      customers: { Row: Customer; Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Customer, 'id'>> }
      reservations: { Row: Reservation; Insert: Omit<Reservation, 'id' | 'created_at' | 'updated_at' | 'reservation_number' | 'total_days'>; Update: Partial<Omit<Reservation, 'id'>> }
      payments: { Row: Payment; Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Payment, 'id'>> }
      deposits: { Row: Deposit; Insert: Omit<Deposit, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Deposit, 'id'>> }
      rental_options: { Row: RentalOption; Insert: Omit<RentalOption, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<RentalOption, 'id'>> }
      vehicle_unavailability: { Row: VehicleUnavailability; Insert: Omit<VehicleUnavailability, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<VehicleUnavailability, 'id'>> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
