/**
 * Common types that used in the projects
 * 
 * @since 1.1.0
 */
export interface Student {
    id: number;
    full_name: string;
    email: string;
    number_of_mails: number;
    wa_number: number | string;
    register_at: string;
    created_at: string;
    updated_at: string;
    status: string;
    google_form_id: number
    number_of_referrals: number;
    referral_student: Student[];
    google_form_color?: string;
}

export interface GoogleForm {
    id: number;
    title: string;
    slug: string;
    color: string;
    whatsapp_group_link: string;
    created_at: string;
    updated_at: string;
}

export interface Message {
    message: string;
    from: string;
    error: boolean;
}

export interface Notification extends Message {
    id: string;
}

