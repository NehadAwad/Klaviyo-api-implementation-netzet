export interface EventAttributes {
  [key: string]: string | number | boolean | null;
}

export interface ProfileAttributes {
  email?: string;
  name?: string;
  phone?: string;
  [key: string]: string | number | boolean | null | undefined;
} 