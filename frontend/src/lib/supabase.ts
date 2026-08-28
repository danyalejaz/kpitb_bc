import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

export interface CertificateRecord {
  certificate_id: string;
  student_name: string;
  degree: string;
  roll_number: string;
  graduation_year: number;
  issuing_university: string;
  issuer_address: string;
  transaction_hash: string;
  created_at?: string;
}

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

export async function saveCertificateRecord(record: CertificateRecord) {
  if (!supabase) {
    return {
      saved: false,
      error: "Supabase is not configured yet.",
    };
  }

  const { error } = await supabase.from("certificates").insert(record);

  return {
    saved: !error,
    error: error?.message,
  };
}

export async function getCertificateRecords() {
  if (!supabase) {
    return {
      records: [] as CertificateRecord[],
      error: "Supabase is not configured yet.",
    };
  }

  const { data, error } = await supabase
    .from("certificates")
    .select(
      "certificate_id,student_name,degree,roll_number,graduation_year,issuing_university,issuer_address,transaction_hash,created_at",
    )
    .order("created_at", { ascending: false });

  return {
    records: (data ?? []) as CertificateRecord[],
    error: error?.message,
  };
}
