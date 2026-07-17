import type * as React from 'react';
import type { Datepicker, DatepickerOptions } from '../types/index';

export interface UseMultiCalendarDatepickerResult {
  inputRef: React.RefObject<HTMLInputElement>;
  pickerRef: React.RefObject<Datepicker | null>;
}

/** Attach a datepicker to your own input element. */
export declare function useMultiCalendarDatepicker(
  options?: DatepickerOptions
): UseMultiCalendarDatepickerResult;

export interface MultiCalendarDatepickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  options?: DatepickerOptions;
  /** Gregorian ISO value ("YYYY-MM-DD", or "start/end" in range mode). null/'' clears. */
  value?: string | null;
  /** Receives the mcd:change event detail. */
  onChange?: (detail: Record<string, unknown>) => void;
  /** Range mode: receives the mcd:range-start event detail. */
  onRangeStart?: (detail: Record<string, unknown>) => void;
}

export declare function MultiCalendarDatepicker(
  props: MultiCalendarDatepickerProps
): React.ReactElement;

export default MultiCalendarDatepicker;
