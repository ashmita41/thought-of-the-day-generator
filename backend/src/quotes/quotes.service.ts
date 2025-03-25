import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Quote } from './entities/quote.entity';

interface QuoteResponse {
  _id: string;
  content: string;
  author: string;
}

@Injectable()
export class QuotesService {
  constructor(private readonly httpService: HttpService) {}

  findAll(): Observable<Quote[]> {
    // Since we're using a random quote API, we'll return a single quote
    return this.findRandom().pipe(
      map(quote => [quote]),
      catchError(() => of([{
        id: 1,
        text: 'Creativity is intelligence having fun.',
        author: 'Albert Einstein'
      }]))
    );
  }

  findRandom(): Observable<Quote> {
    return this.httpService.get<QuoteResponse>('https://api.quotable.io/random').pipe(
      map(response => ({
        id: 1, // Since we're getting a random quote, we'll use a fixed ID
        text: response.data.content,
        author: response.data.author
      })),
      catchError(() => of({
        id: 1,
        text: 'Creativity is intelligence having fun.',
        author: 'Albert Einstein'
      }))
    );
  }

  findOne(id: number): Observable<Quote> {
    // For a random quote API, we'll just return a random quote
    return this.findRandom();
  }

  create(quote: Quote): Observable<Quote> {
    // Not applicable for external API
    throw new Error('Creation not supported with external API');
  }

  remove(id: number): Observable<void> {
    // Not applicable for external API
    throw new Error('Removal not supported with external API');
  }
}