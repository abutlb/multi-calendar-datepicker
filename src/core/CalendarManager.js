import { GregorianCalendar } from '../calendars/GregorianCalendar.js';
import { HijriCalendar }     from '../calendars/HijriCalendar.js';
import { JalaliCalendar }    from '../calendars/JalaliCalendar.js';
import { CopticCalendar }    from '../calendars/CopticCalendar.js';

const registry = new Map();

export function registerCalendar(adapter) {
  registry.set(adapter.id, adapter);
}

export function getCalendar(id) {
  const cal = registry.get(id);
  if (!cal) throw new Error(`Unknown calendar: ${id}`);
  return cal;
}

export function getRegisteredCalendars() {
  return [...registry.values()];
}

// Register built-in calendars
registerCalendar(new GregorianCalendar());
registerCalendar(new HijriCalendar('tabular'));   // id = 'hijri'
registerCalendar(new JalaliCalendar());
registerCalendar(new CopticCalendar());

// Also expose ummalqura as a separate id for convenience
const uq = new HijriCalendar('ummalqura');
uq.id = 'ummalqura';
registerCalendar(uq);
