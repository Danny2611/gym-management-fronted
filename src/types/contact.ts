// src/types/contact.ts
export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  workingHours: {
    weekdays: string;
    weekends: string;
  };
}

export interface MapLocation {
  lat: number;
  lng: number;
  zoom: number;
}

export interface FAQ {
  question: string;
  answer: string;
}
