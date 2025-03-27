// src/design/config/design-config.ts

export interface DesignConfiguration {
  designId: string;
  mode: 'fixed' | 'random';
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
    quote: {
      fontFamily: string;
      fontSize: number;
      color: string;
      weight: 'normal' | 'bold' | 'light';
    };
    author: {
      fontFamily: string;
      fontSize: number;
      color: string;
      weight: 'normal' | 'light';
    };
  };
}

export const DESIGN_CONFIGURATIONS: DesignConfiguration[] = [
  // Monday Design
  {
    designId: 'monday-design',
    mode: 'fixed',
    background: {
      color: '#E6F2FF', // Light Blue
      type: 'solid'
    },
    layout: {
      type: 'centered',
      margins: {
        top: 50,
        bottom: 50,
        left: 100,
        right: 100
      }
    },
    typography: {
      quote: {
        fontFamily: 'Arial',
        fontSize: 24,
        color: '#333333',
        weight: 'normal'
      },
      author: {
        fontFamily: 'Arial',
        fontSize: 18,
        color: '#666666',
        weight: 'light'
      }
    }
  },
  // Tuesday Design
  {
    designId: 'tuesday-design',
    mode: 'fixed',
    background: {
      color: '#F0F8FF', // Alice Blue
      type: 'gradient'
    },
    layout: {
      type: 'left-aligned',
      margins: {
        top: 40,
        bottom: 40,
        left: 80,
        right: 80
      }
    },
    typography: {
      quote: {
        fontFamily: 'Georgia',
        fontSize: 26,
        color: '#1A1A1A',
        weight: 'bold'
      },
      author: {
        fontFamily: 'Verdana',
        fontSize: 16,
        color: '#444444',
        weight: 'light'
      }
    }
  },
  // Random Designs (for random mode)
  {
    designId: 'random-design-1',
    mode: 'random',
    background: {
      color: '#F5F5F5', // Light Gray
      type: 'solid'
    },
    layout: {
      type: 'right-aligned',
      margins: {
        top: 60,
        bottom: 60,
        left: 120,
        right: 120
      }
    },
    typography: {
      quote: {
        fontFamily: 'Palatino Linotype',
        fontSize: 22,
        color: '#2C3E50',
        weight: 'normal'
      },
      author: {
        fontFamily: 'Courier New',
        fontSize: 16,
        color: '#34495E',
        weight: 'light'
      }
    }
  }
];