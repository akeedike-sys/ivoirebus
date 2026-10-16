import { TestBed } from '@angular/core/testing';
import { CityService } from './city.service';
import { TripService } from './trip.service';

describe('CityService', () => {
  let service: CityService;
  let trips: TripService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CityService);
    trips = TestBed.inject(TripService);
  });

  it('crée une ville et l’ajoute à la liste', () => {
    const city = service.create('Abidjan');
    expect(service.cities().map((item) => item.name)).toContain('Abidjan');
    expect(city.id).toBeTruthy();
  });

  it('refuse un nom en doublon (insensible à la casse)', () => {
    service.create('Abidjan');
    expect(() => service.create('  abidjan ')).toThrow('Cette ville existe déjà');
  });

  it('refuse un nom vide', () => {
    expect(() => service.create('   ')).toThrow('Le nom de la ville est obligatoire');
  });

  it('renomme une ville', () => {
    const city = service.create('Abidjan');
    service.rename(city.id, 'Abidjan Plateau');
    expect(service.nameOf(city.id)).toBe('Abidjan Plateau');
  });

  it('refuse un renommage vers un nom existant', () => {
    const abidjan = service.create('Abidjan');
    service.create('Bouaké');
    expect(() => service.rename(abidjan.id, 'Bouaké')).toThrow('Cette ville existe déjà');
  });

  it('supprime une ville non utilisée', () => {
    const city = service.create('Abidjan');
    service.remove(city.id);
    expect(service.byId(city.id)).toBeUndefined();
  });

  it('refuse la suppression d’une ville utilisée par un trajet', () => {
    const abidjan = service.create('Abidjan');
    const bouake = service.create('Bouaké');
    trips.create({
      departureCityId: abidjan.id,
      arrivalCityId: bouake.id,
      departureAt: new Date(Date.now() + 86_400_000).toISOString(),
      price: 3000,
      capacity: 40,
    });

    expect(() => service.remove(abidjan.id)).toThrow('Cette ville est utilisée par un trajet');
  });
});
