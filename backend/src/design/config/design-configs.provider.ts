// src/design/config/design-configs.provider.ts
import { Injectable } from '@nestjs/common';
import { DesignConfig } from '../interfaces/design-config.interface';

@Injectable()
export class DesignConfigsProvider {
  private readonly designConfigs: Map<string, DesignConfig> = new Map();
  
  constructor() {
    this.initializeConfigs();
  }
  
  private initializeConfigs(): void {
    // Monday config
    this.designConfigs.set('monday', {
      designId: 'fixed-monday-design',
      mode: 'fixed',
      background: {
        color: '#E8F4F8', // Light Blue
        type: 'solid'
      },
      layout: {
        type: 'centered',
        margins: {
          top: 60,
          bottom: 60,
          left: 60,
          right: 60
        }
      },
      typography: {
        title: {
          fontFamily: 'Montserrat', // Modern sans-serif font
          fontSize: 28,
          color: '#000000',
          weight: 'bold',
          alignment: 'center'
        },
        quote: {
          fontFamily: 'Georgia',
          fontSize: 22,
          color: '#2C3E50',
          weight: 'normal',
          alignment: 'center'
        },
        author: {
          fontFamily: 'Courier New',
          fontSize: 16,
          color: '#34495E',
          weight: 'light',
          alignment: 'center'
        }
      }
    });
    
    // Tuesday config
    this.designConfigs.set('tuesday', {
      designId: 'fixed-tuesday-design',
      mode: 'fixed',
      background: {
        color: '#F0E6FF', // Light Purple
        type: 'solid'
      },
      layout: {
        type: 'centered',
        margins: {
          top: 60,
          bottom: 60,
          left: 60,
          right: 60
        }
      },
      typography: {
        title: {
          fontFamily: 'Playfair Display', // Elegant serif font
          fontSize: 28,
          color: '#2C3E50',
          weight: 'bold',
          alignment: 'center'
        },
        quote: {
          fontFamily: 'Palatino Linotype',
          fontSize: 22,
          color: '#4A4A4A',
          weight: 'normal',
          alignment: 'center'
        },
        author: {
          fontFamily: 'Trebuchet MS',
          fontSize: 16,
          color: '#3D3D3D',
          weight: 'light',
          alignment: 'center'
        }
      }
    });
    
    // Wednesday config
    this.designConfigs.set('wednesday', {
      designId: 'fixed-wednesday-design',
      mode: 'fixed',
      background: {
        color: '#E6F2E6', // Light Green
        type: 'solid'
      },
      layout: {
        type: 'centered',
        margins: {
          top: 60,
          bottom: 60,
          left: 60,
          right: 60
        }
      },
      typography: {
        title: {
          fontFamily: 'Lato', // Clean modern font
          fontSize: 28,
          color: '#1A1A1A',
          weight: 'bold',
          alignment: 'center'
        },
        quote: {
          fontFamily: 'Arial',
          fontSize: 22,
          color: '#2D3436',
          weight: 'normal',
          alignment: 'center'
        },
        author: {
          fontFamily: 'Courier New',
          fontSize: 16,
          color: '#34495E',
          weight: 'light',
          alignment: 'center'
        }
      }
    });
    
    // Thursday config
    this.designConfigs.set('thursday', {
      designId: 'fixed-thursday-design',
      mode: 'fixed',
      background: {
        color: '#FFF0E6', // Light Orange
        type: 'solid'
      },
      layout: {
        type: 'centered',
        margins: {
          top: 60,
          bottom: 60,
          left: 60,
          right: 60
        }
      },
      typography: {
        title: {
          fontFamily: 'Merriweather', // Classic serif font
          fontSize: 28,
          color: '#2C3E50',
          weight: 'bold',
          alignment: 'center'
        },
        quote: {
          fontFamily: 'Verdana',
          fontSize: 22,
          color: '#4A4A4A',
          weight: 'normal',
          alignment: 'center'
        },
        author: {
          fontFamily: 'Palatino Linotype',
          fontSize: 16,
          color: '#3D3D3D',
          weight: 'light',
          alignment: 'center'
        }
      }
    });
    
    // Friday config
    this.designConfigs.set('friday', {
      designId: 'fixed-friday-design',
      mode: 'fixed',
      background: {
        color: '#F4E1D2', // Light Peach
        type: 'solid'
      },
      layout: {
        type: 'centered',
        margins: {
          top: 60,
          bottom: 60,
          left: 60,
          right: 60
        }
      },
      typography: {
        title: {
          fontFamily: 'Roboto Slab', // Modern slab serif
          fontSize: 28,
          color: '#1A1A1A',
          weight: 'bold',
          alignment: 'center'
        },
        quote: {
          fontFamily: 'Georgia',
          fontSize: 22,
          color: '#2D3436',
          weight: 'normal',
          alignment: 'center'
        },
        author: {
          fontFamily: 'Arial',
          fontSize: 16,
          color: '#34495E',
          weight: 'light',
          alignment: 'center'
        }
      }
    });
    
    // Saturday config
    this.designConfigs.set('saturday', {
      designId: 'fixed-saturday-design',
      mode: 'fixed',
      background: {
        color: '#E8F4F8', // Light Blue
        type: 'solid'
      },
      layout: {
        type: 'centered',
        margins: {
          top: 60,
          bottom: 60,
          left: 60,
          right: 60
        }
      },
      typography: {
        title: {
          fontFamily: 'Open Sans', // Clean modern sans-serif
          fontSize: 28,
          color: '#2C3E50',
          weight: 'bold',
          alignment: 'center'
        },
        quote: {
          fontFamily: 'Verdana',
          fontSize: 22,
          color: '#4A4A4A',
          weight: 'normal',
          alignment: 'center'
        },
        author: {
          fontFamily: 'Trebuchet MS',
          fontSize: 16,
          color: '#3D3D3D',
          weight: 'light',
          alignment: 'center'
        }
      }
    });
    
    // Sunday config
    this.designConfigs.set('sunday', {
      designId: 'fixed-sunday-design',
      mode: 'fixed',
      background: {
        color: '#F0E6FF', // Light Purple
        type: 'solid'
      },
      layout: {
        type: 'centered',
        margins: {
          top: 60,
          bottom: 60,
          left: 60,
          right: 60
        }
      },
      typography: {
        title: {
          fontFamily: 'Libre Baskerville', // Classic elegant serif
          fontSize: 28,
          color: '#1A1A1A',
          weight: 'bold',
          alignment: 'center'
        },
        quote: {
          fontFamily: 'Palatino Linotype',
          fontSize: 22,
          color: '#2D3436',
          weight: 'normal',
          alignment: 'center'
        },
        author: {
          fontFamily: 'Georgia',
          fontSize: 16,
          color: '#34495E',
          weight: 'light',
          alignment: 'center'
        }
      }
    });
  }
  
  getFixedDesignByDay(day: string): DesignConfig | null {
    return this.designConfigs.get(day.toLowerCase()) || null;
  }
  
  getRandomDesign(): DesignConfig {
    // Enhanced fonts for random designs
    const backgroundColors = [
      '#F5F5F5', '#E8F4F8', '#F0E6FF', 
      '#E6F2E6', '#FFF0E6', '#F4E1D2'
    ];
    
    const titleFontFamilies = [
      'Montserrat', 'Playfair Display', 'Lato', 
      'Merriweather', 'Roboto Slab', 'Open Sans',
      'Libre Baskerville', 'Raleway', 'Source Sans Pro'
    ];
    
    const contentFontFamilies = [
      'Arial', 'Verdana', 'Palatino Linotype', 
      'Georgia', 'Courier New', 'Trebuchet MS',
      'Lora', 'Nunito', 'Crimson Text'
    ];
    
    const textColors = [
      '#2C3E50', '#34495E', '#4A4A4A', 
      '#1A1A1A', '#3D3D3D', '#2D3436'
    ];

    return {
      designId: `random-design-${Math.floor(Math.random() * 100)}`,
      mode: 'random',
      background: {
        color: backgroundColors[Math.floor(Math.random() * backgroundColors.length)],
        type: 'solid'
      },
      layout: {
        type: 'centered',
        margins: {
          top: 60,
          bottom: 60,
          left: 60,
          right: 60
        }
      },
      typography: {
        title: {
          fontFamily: titleFontFamilies[Math.floor(Math.random() * titleFontFamilies.length)],
          fontSize: 28,
          color: '#000000',
          weight: 'bold',
          alignment: 'center'
        },
        quote: {
          fontFamily: contentFontFamilies[Math.floor(Math.random() * contentFontFamilies.length)],
          fontSize: 22,
          color: textColors[Math.floor(Math.random() * textColors.length)],
          weight: 'normal',
          alignment: 'center'
        },
        author: {
          fontFamily: contentFontFamilies[Math.floor(Math.random() * contentFontFamilies.length)],
          fontSize: 16,
          color: textColors[Math.floor(Math.random() * textColors.length)],
          weight: 'light',
          alignment: 'center'
        }
      }
    };
  }
  
  getAllDesigns(): DesignConfig[] {
    return Array.from(this.designConfigs.values());
  }
}