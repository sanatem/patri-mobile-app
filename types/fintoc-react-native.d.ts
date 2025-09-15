declare module '@fintoc/fintoc-react-native' {
  import { ViewStyle } from 'react-native';

  export interface FintocOptions {
    public_key: string;
    product?: string;
    widget_id?: string;
    widget_token?: string;
    amount?: number;
    currency?: string;
    theme?: {
      primary_color?: string;
      background_color?: string;
    };
    language?: string;
    country?: string;
    [key: string]: any;
  }

  export interface FintocWidgetViewProps {
    options: FintocOptions;
    onSuccess?: (data: any) => void;
    onExit?: () => void;
    style?: ViewStyle;
  }

  export declare const FintocWidgetView: React.ComponentType<FintocWidgetViewProps>;
}

