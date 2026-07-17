export function qs(selector, parent = document) {
  return typeof selector === 'string' ? parent.querySelector(selector) : selector;
}

export function create(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k.startsWith('data-')) el.setAttribute(k, v);
    else if (k.startsWith('aria-') || k === 'role' || k === 'tabindex') el.setAttribute(k, v);
    else el[k] = v;
  }
  for (const child of children) {
    if (child == null) continue;
    el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return el;
}

export function setContent(el, text) {
  if (!el) return;
  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea') el.value = text;
  else el.textContent = text;
}

export function on(el, event, fn, opts) {
  el.addEventListener(event, fn, opts);
  return () => el.removeEventListener(event, fn, opts);
}
