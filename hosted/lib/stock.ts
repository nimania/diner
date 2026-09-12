import {numeric} from './cost';
export function quantityUnits(value:unknown){const n=numeric(value,0.001,1e7)*1000;if(Math.abs(n-Math.round(n))>0.00001)throw Error('quantity precision');return Math.round(n);}
export function expiryDate(value:unknown){if(value===''||value==null)return null;if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)throw Error('date');return value;}
