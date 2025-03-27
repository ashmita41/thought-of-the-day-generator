import { Injectable } from '@nestjs/common';
import { DesignConfig } from '../interfaces/design-config.interface';

@Injectable()
export class DesignConfigRepository {
  private weeklyDesigns: {[key: string]: DesignConfig} = {
    'monday': {
      designId: 'fixed-monday-design',
      mode: 'fixed',
      background: {
        color: '#E8F4F8',
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
          fontFamily: 'Arial',
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
    },
    'tuesday': {
      designId: 'fixed-tuesday-design',
      mode: 'fixed',
      background: {
        color: '#F0E6FF',
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
          fontFamily: 'Verdana',
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
    },
    'wednesday': {
      designId: 'fixed-wednesday-design',
      mode: 'fixed',
      background: {
        color: '#E6F2E6',
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
          fontFamily: 'Georgia',
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
    },
    'thursday': {
      designId: 'fixed-thursday-design',
      mode: 'fixed',
      background: {
        color: '#FFF0E6',
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
          fontFamily: 'Trebuchet MS',
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
    },
    'friday': {
      designId: 'fixed-friday-design',
      mode: 'fixed',
      background: {
        color: '#F4E1D2',
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
          fontFamily: 'Palatino Linotype',
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
    },
    'saturday': {
      designId: 'fixed-saturday-design',
      mode: 'fixed',
      background: {
        color: '#E8F4F8',
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
          fontFamily: 'Courier New',
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
    },
    'sunday': {
      designId: 'fixed-sunday-design',
      mode: 'fixed',
      background: {
        color: '#F0E6FF',
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
          fontFamily: 'Arial',
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
    }
  };

  findRandomDesign(): DesignConfig {
    const backgroundColors = [
      '#F5F5F5', '#E8F4F8', '#F0E6FF', 
      '#E6F2E6', '#FFF0E6', '#F4E1D2'
    ];
    const fontFamilies = [
      'Arial', 'Verdana', 'Palatino Linotype', 
      'Georgia', 'Courier New', 'Trebuchet MS'
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
          fontFamily: 'Arial',
          fontSize: 28,
          color: '#000000',
          weight: 'bold',
          alignment: 'center'
        },
        quote: {
          fontFamily: fontFamilies[Math.floor(Math.random() * fontFamilies.length)],
          fontSize: 22,
          color: textColors[Math.floor(Math.random() * textColors.length)],
          weight: 'normal',
          alignment: 'center'
        },
        author: {
          fontFamily: fontFamilies[Math.floor(Math.random() * fontFamilies.length)],
          fontSize: 16,
          color: textColors[Math.floor(Math.random() * textColors.length)],
          weight: 'light',
          alignment: 'center'
        }
      }
    };
  }

  findFixedDesignByDay(day: string): DesignConfig {
    const normalizedDay = day.toLowerCase();
    
    // If specific day design exists, return it
    if (this.weeklyDesigns[normalizedDay]) {
      return this.weeklyDesigns[normalizedDay];
    }
    
    // If no specific day design, return random design
    return this.findRandomDesign();
  }

  findAllDesigns(): DesignConfig[] {
    return [
      ...Object.values(this.weeklyDesigns),
      this.findRandomDesign()
    ];
  }
}