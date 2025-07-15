export interface KlaviyoProfileAttributes {
  email?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface KlaviyoProfile {
  id: string;
  attributes: KlaviyoProfileAttributes;
  type: 'profile';
}

export interface KlaviyoMetric {
  id: string;
  attributes: { name: string; [key: string]: any };
  type: 'metric';
}

export interface KlaviyoEvent {
  id: string;
  attributes: { [key: string]: any };
  relationships?: { [key: string]: any };
  type: 'event';
} 