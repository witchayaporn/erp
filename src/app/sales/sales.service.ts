import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AngularFireDatabase, AngularFireList, SnapshotAction } from '@angular/fire/database';
import 'rxjs/add/operator/map';
import { map, tap, concatMap, toArray, switchMap } from 'rxjs/operators';
import { BehaviorSubject, from, of } from 'rxjs';
import { Quotation, Item } from './sales.model';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  quotationList: AngularFireList<any>;
  private _quotations = new BehaviorSubject<Quotation[]>(null);

  get quotations() {
    return this._quotations.asObservable();
  }

  constructor(private http: HttpClient, private db: AngularFireDatabase) {
    this.quotationList = db.list('quotation');
  }

  addQuotation(quotation: any) {
    // addQuotation(quotation: Quotation) {
    const data = {
      addressTo: quotation.addressTo,
      date: quotation.date,
      expirationDate: quotation.expirationDate,
      item: quotation.item,
      quantity: quotation.quantity,
      isInvoice: false
    };
    return this.http.post(environment.siteUrl + '/quotation.json', data);
  }

  getQuotation() {
    // return this.http.get(environment.siteUrl + '/quotation.json').pipe(
    //   map((val, index) => {
    //     console.log(val);
    //     const item = new Item(val[index].item, val[index].quantity);
    //     const quotation = new Quotation(
    //       val[index].key, val[index].addressTo, val[index].date, val[index].expirationDate, [item], val[index].isInvoice);
    //     return quotation;
    //   })
    // );

    return this.quotationList.snapshotChanges().map(actions => {
      return actions.map(action => {
        const item = new Item(action.payload.val().item, action.payload.val().quantity);
        const quotation = new Quotation(
          action.key, action.payload.val().addressTo, action.payload.val().date, action.payload.val().expirationDate, [item], action.payload.val().isInvoice);
        return quotation;
      });
    }).pipe(tap(data => {
      this._quotations.next(data);
    }));
  }

  deleteQuotation(id: string) {
    return this.http.delete(environment.siteUrl + '/quotation/' + id + '.json');
  }

  updateQuotation(quotation: any, id: string) {
    const data = {
      addressTo: quotation.addressTo,
      date: quotation.date,
      expirationDate: quotation.expirationDate,
      item: quotation.item,
      quantity: quotation.quantity
    };
    return this.http.patch(environment.siteUrl + '/quotation/' + id + '.json', data);
  }

  addInvoice(id) {
    const data = {
      isInvoice: true
    };
    return this.http.patch(environment.siteUrl + '/quotation/' + id + '.json', data);
  }
}
