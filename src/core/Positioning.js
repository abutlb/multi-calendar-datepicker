/**
 * Positions the picker popup relative to its trigger input.
 * Preference: below the input; flips above if not enough space.
 */
export function positionPicker(picker, input, preferredPosition = 'auto') {
  const rect   = input.getBoundingClientRect();
  const pHeight = picker.offsetHeight || 320;
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;

  let placeAbove = false;
  if (preferredPosition === 'top') {
    placeAbove = true;
  } else if (preferredPosition === 'auto') {
    placeAbove = spaceBelow < pHeight && spaceAbove > spaceBelow;
  }

  const scrollX = window.pageXOffset;
  const scrollY = window.pageYOffset;

  picker.style.position = 'absolute';
  picker.style.zIndex   = '99999';

  if (placeAbove) {
    picker.style.top  = `${rect.top + scrollY - pHeight - 4}px`;
  } else {
    picker.style.top  = `${rect.bottom + scrollY + 4}px`;
  }

  // Align left edge; clamp to viewport
  let left = rect.left + scrollX;
  const pickerWidth = picker.offsetWidth || 300;
  if (left + pickerWidth > window.innerWidth + scrollX) {
    left = window.innerWidth + scrollX - pickerWidth - 8;
  }
  if (left < scrollX) left = scrollX + 8;
  picker.style.left = `${left}px`;
}
