import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Hero } from './hero';
import { MessageService } from './message.service';
import { HEROES } from './mock-heroes';

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private heroesUrl = 'api/heroes';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  constructor(
    private httpClient: HttpClient,
    private messageService: MessageService
  ) { }

  private log(message: string): void {
    this.messageService.add(`HeroService: ${message}`);
  }

  private handleError<T>(operation = 'operation', result?: T): (error: any) => Observable<T> {
    return (error: any): Observable<T> => {
      console.log(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  // getHeroes(): Observable<Hero[]> {
  //   this.messageService.add(`HeroService: fetched heroes`);
  //   return of(HEROES);
  // }

  getHeroes(): Observable<Hero[]> {
    return this.httpClient.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(() => this.log(`Heroes fetched`)),
        catchError(this.handleError<Hero[]>('getHeroes', []))
      );
  }

  // getHero(id: string): Observable<Hero> {
  //   this.messageService.add(`HeroService: fetched hero id=${id}`);
  //   return of(HEROES.find(hero => hero.id.toString() === id) as Hero);
  // }

  getHero(id: string): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;

    return this.httpClient.get<Hero>(url)
      .pipe(
        tap(() => this.log(`fetched hero: id=${id}`)),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  getHeroNo404<Data>(id: string): Observable<Hero> {
    const url = `${this.heroesUrl}/?id=${id}`;

    return this.httpClient.get<Hero[]>(url).pipe(
      map((heroes) => heroes[0]),
      tap((hero) => {
        const result = hero ? 'fetched hero successfully' : 'could not find hero';
        this.log(`id: ${id} ${result}`);
      }),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }

  updateHero(hero: Hero | undefined): Observable<any> {
    return this.httpClient.put<any>(this.heroesUrl, hero, this.httpOptions)
      .pipe(
        tap(() => this.log(`updated hero: id=${hero?.id}`)),
        catchError(this.handleError<any>('updateHero'))
      );
  }

  addHero(hero: Hero): Observable<Hero> {
    return this.httpClient.post<Hero>(
      this.heroesUrl,
      hero,
      this.httpOptions
    ).pipe(
      tap((newHero: Hero) => this.log(`added hero with id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  deleteHero(hero: Hero): Observable<Hero> {
    const url = `${this.heroesUrl}/${hero.id}`;

    return this.httpClient.delete<Hero>(
      url,
      this.httpOptions
    ).pipe(
      tap(() => this.log(`deleted hero with id=${hero.id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  searchHeroes(name: string): Observable<Hero[]> {
    name = name.trim();
    if (!name) { return of([]); }

    return this.httpClient.get<Hero[]>(
      `${this.heroesUrl}/?name=${name}`
    ).pipe(
      tap(x => x.length ?
        `found heroes matching ${name}` :
        `could not match ${name}`
      ),
      catchError(this.handleError<Hero[]>('searchHero', []))
    );
  }
}
