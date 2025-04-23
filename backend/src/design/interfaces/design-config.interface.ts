export interface DesignConfig {
  designId: string;
  mode: 'random' | 'fixed';
  background: {
    color: string;
    type: 'solid' | 'gradient';
  };
  layout: {
    type: 'centered' | 'left-aligned' | 'right-aligned';
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  typography: {
    title: {
      fontFamily: string;
      fontSize: number;
      color: string;
      weight: string;
      alignment: 'center';
    };
    quote: {
      fontFamily: string;
      fontSize: number;
      color: string;
      weight: string;
      alignment: 'center';
    };
    author: {
      fontFamily: string;
      fontSize: number;
      color: string;
      weight: string;
      alignment: 'center';
    };
  };
}
