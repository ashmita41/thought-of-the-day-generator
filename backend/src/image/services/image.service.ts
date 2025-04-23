import { Injectable, Logger } from '@nestjs/common';
import { TextUtilsService } from './text-utils.service';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  constructor(private textUtilsService: TextUtilsService) {}

  // This service serves as a base utility class for common image manipulation functionality
  // The specific image generation methods have been moved to dedicated services
}
