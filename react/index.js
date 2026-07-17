/**
 * React bindings for multi-calendar-datepicker.
 * Plain JS (no JSX) so no build configuration is required by consumers.
 *
 *   import { MultiCalendarDatepicker, useMultiCalendarDatepicker }
 *     from 'multi-calendar-datepicker/react';
 *   import 'multi-calendar-datepicker/css';
 */
import { createElement, useEffect, useMemo, useRef } from 'react';
import { Datepicker } from '../dist/multi-calendar-datepicker.esm.js';

/**
 * Hook: attach a datepicker to your own <input>.
 * Returns { inputRef, pickerRef } — put inputRef on the input element;
 * pickerRef.current is the Datepicker instance (open/close/setGregorianValue…).
 */
export function useMultiCalendarDatepicker(options = {}) {
  const inputRef  = useRef(null);
  const pickerRef = useRef(null);

  // Re-create only when options actually change (by value, not identity).
  const optionsKey = JSON.stringify(options);
  const stableOptions = useMemo(() => options, [optionsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!inputRef.current) return undefined;
    const picker = new Datepicker(inputRef.current, stableOptions);
    pickerRef.current = picker;
    return () => {
      picker.destroy();
      if (pickerRef.current === picker) pickerRef.current = null;
    };
  }, [stableOptions]);

  return { inputRef, pickerRef };
}

/**
 * Ready-made component.
 *
 *   <MultiCalendarDatepicker
 *     options={{ calendar: 'hijri', hijriMode: 'ummalqura', locale: 'ar', dir: 'rtl' }}
 *     value="2026-06-27"                  // Gregorian ISO (controlled-ish)
 *     onChange={detail => ...}            // mcd:change detail
 *     onRangeStart={detail => ...}        // range mode only
 *     placeholder="اختر التاريخ"
 *   />
 */
export function MultiCalendarDatepicker({ options = {}, value, onChange, onRangeStart, ...inputProps }) {
  const { inputRef, pickerRef } = useMultiCalendarDatepicker(options);

  useEffect(() => {
    if (!pickerRef.current || value === undefined) return;
    if (value === null || value === '') {
      pickerRef.current.clear();
    } else if (options.mode === 'range' && String(value).includes('/')) {
      const [s, e] = String(value).split('/');
      pickerRef.current.setGregorianRange(s, e);
    } else {
      pickerRef.current.setGregorianValue(value);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return undefined;
    const changeFn = onChange     ? (e) => onChange(e.detail)     : null;
    const rangeFn  = onRangeStart ? (e) => onRangeStart(e.detail) : null;
    if (changeFn) el.addEventListener('mcd:change', changeFn);
    if (rangeFn)  el.addEventListener('mcd:range-start', rangeFn);
    return () => {
      if (changeFn) el.removeEventListener('mcd:change', changeFn);
      if (rangeFn)  el.removeEventListener('mcd:range-start', rangeFn);
    };
  }, [onChange, onRangeStart]); // eslint-disable-line react-hooks/exhaustive-deps

  return createElement('input', {
    ref: inputRef,
    type: 'text',
    readOnly: !options.allowInput,
    autoComplete: 'off',
    ...inputProps,
  });
}

export default MultiCalendarDatepicker;
