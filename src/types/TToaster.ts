export type ToasterProperties = {
  message: string | number;
  isVisible: boolean;
  type: TToasterNotification;
  timeout: number;
}

export type TToasterNotification = 'success' | 'error' | 'info' | 'warning';