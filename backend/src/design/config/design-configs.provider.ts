import { Injectable } from '@nestjs/common';
import { DesignConfig } from '../interfaces/design-config.interface';

@Injectable()
export class DesignConfigsProvider {
  private readonly designConfigs: Map<string, DesignConfig> = new Map();
  
  constructor() {
    this.initializeConfigs();
  }
  
  private initializeConfigs(): void {
    // Monday config - Vibrant Blue/Purple Gradient
    this.designConfigs.set('monday', {
      designId: 'fixed-monday-design',
      mode: 'fixed',
      background: {
        color: '["#4158D0", "#C850C0"]', // Vibrant blue to purple gradient
        type: 'gradient'
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
          fontFamily: 'Montserrat',
          fontSize: 28,
          color: '#FFFFFF', // White for better contrast
          weight: 'bold',
          alignment: 'center'
        },
        quote: {
          fontFamily: 'Georgia',
          fontSize: 22,
          color: '#FFFFFF',
          weight: 'normal',
          alignment: 'center'
        },
        author: {
          fontFamily: 'Courier New',
          fontSize: 16,
          color: '#F0F0F0',
          weight: 'light',
          alignment: 'center'
        }
      }
    });
    
    // Tuesday config - Sunny Yellow/Orange
    this.designConfigs.set('tuesday', {
      designId: 'fixed-tuesday-design',
      mode: 'fixed',
      background: {
        color: '["#FFCC70", "#FF9EB1"]', // Sunny yellow to pink
        type: 'gradient'
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
          fontFamily: 'Playfair Display',
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
    
    // Wednesday config - Fresh Mint/Teal
    this.designConfigs.set('wednesday', {
      designId: 'fixed-wednesday-design',
      mode: 'fixed',
      background: {
        color: '["#0CCDA3", "#1DFFC8"]', // Fresh mint gradient
        type: 'gradient'
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
          fontFamily: 'Lato',
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
    
    // Thursday config - Vibrant Orange/Pink
    this.designConfigs.set('thursday', {
      designId: 'fixed-thursday-design',
      mode: 'fixed',
      background: {
        color: '["#FF7676", "#F54EA2"]', // Vibrant orange to pink
        type: 'gradient'
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
          fontFamily: 'Merriweather',
          fontSize: 28,
          color: '#FFFFFF',
          weight: 'bold',
          alignment: 'center'
        },
        quote: {
          fontFamily: 'Verdana',
          fontSize: 22,
          color: '#FFFFFF',
          weight: 'normal',
          alignment: 'center'
        },
        author: {
          fontFamily: 'Palatino Linotype',
          fontSize: 16,
          color: '#F0F0F0',
          weight: 'light',
          alignment: 'center'
        }
      }
    });
    
    // Friday config - Cheerful Pink/Purple
    this.designConfigs.set('friday', {
      designId: 'fixed-friday-design',
      mode: 'fixed',
      background: {
        color: '["#FF61D2", "#FE9090"]', // Cheerful pink to light orange
        type: 'gradient'
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
          fontFamily: 'Roboto Slab',
          fontSize: 28,
          color: '#FFFFFF',
          weight: 'bold',
          alignment: 'center'
        },
        quote: {
          fontFamily: 'Georgia',
          fontSize: 22,
          color: '#FFFFFF',
          weight: 'normal',
          alignment: 'center'
        },
        author: {
          fontFamily: 'Arial',
          fontSize: 16,
          color: '#F0F0F0',
          weight: 'light',
          alignment: 'center'
        }
      }
    });
    
    // Saturday config - Electric Blue/Cyan
    this.designConfigs.set('saturday', {
      designId: 'fixed-saturday-design',
      mode: 'fixed',
      background: {
        color: '["#0061FF", "#60EFFF"]', // Electric blue to cyan
        type: 'gradient'
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
          fontFamily: 'Open Sans',
          fontSize: 28,
          color: '#FFFFFF',
          weight: 'bold',
          alignment: 'center'
        },
        quote: {
          fontFamily: 'Verdana',
          fontSize: 22,
          color: '#FFFFFF',
          weight: 'normal',
          alignment: 'center'
        },
        author: {
          fontFamily: 'Trebuchet MS',
          fontSize: 16,
          color: '#F0F0F0',
          weight: 'light',
          alignment: 'center'
        }
      }
    });
    
    // Sunday config - Dreamy Purple/Pink
    this.designConfigs.set('sunday', {
      designId: 'fixed-sunday-design',
      mode: 'fixed',
      background: {
        color: '["#764BA2", "#FF7EB3"]', // Dreamy purple to pink
        type: 'gradient'
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
          fontFamily: 'Libre Baskerville',
          fontSize: 28,
          color: '#FFFFFF',
          weight: 'bold',
          alignment: 'center'
        },
        quote: {
          fontFamily: 'Palatino Linotype',
          fontSize: 22,
          color: '#FFFFFF',
          weight: 'normal',
          alignment: 'center'
        },
        author: {
          fontFamily: 'Georgia',
          fontSize: 16,
          color: '#F0F0F0',
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
    // Enhanced fonts and vibrant colors for random designs
    const backgroundGradients = [
      '["#FF9A8B", "#FF6A88"]', // Coral to pink
      '["#42E695", "#3BB2B8"]', // Mint to teal
      '["#8A2387", "#E94057", "#F27121"]', // Purple to red to orange
      '["#1FA2FF", "#12D8FA", "#A6FFCB"]', // Blue to cyan to mint
      '["#FF61D2", "#FE9090"]', // Pink to light orange
      '["#4158D0", "#C850C0"]', // Blue to purple
      '["#0061FF", "#60EFFF"]', // Blue to cyan
      '["#6713D2", "#CC208E"]'  // Deep purple to magenta
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
      '#FFFFFF', '#F0F0F0', '#F5F5F5', 
      '#E8E8E8', '#2C3E50', '#34495E'
    ];

    return {
      designId: `random-design-${Math.floor(Math.random() * 100)}`,
      mode: 'random',
      background: {
        color: backgroundGradients[Math.floor(Math.random() * backgroundGradients.length)],
        type: 'gradient'
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
          color: '#FFFFFF',
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