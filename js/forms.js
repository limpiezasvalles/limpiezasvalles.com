/**
 * LIMPIEZAS VALLES SOLUTIONS — forms.js
 * Form validation · Honeypot · AJAX submission · RGPD
 */

'use strict';

/* ============================================================
   SANITIZE — strip potentially harmful characters
   ============================================================ */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>'"]/g, '')
    .slice(0, 2000);
}

/* ============================================================
   VALIDATION HELPERS
   ============================================================ */
const validators = {
  required: (val) => val.trim().length > 0,
  email:    (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
  phone:    (val) => /^[+\d\s\-().]{6,20}$/.test(val.trim()),
  minLength:(val, min) => val.trim().length >= min,
};

function showFieldError(field, msg) {
  const errEl = field.closest('.form__group')?.querySelector('.form__error');
  field.style.borderColor = '#dc2626';
  field.setAttribute('aria-invalid', 'true');
  if (errEl) {
    errEl.textContent = msg;
    errEl.classList.add('is-visible');
  }
}

function clearFieldError(field) {
  const errEl = field.closest('.form__group')?.querySelector('.form__error');
  field.style.borderColor = '';
  field.removeAttribute('aria-invalid');
  if (errEl) {
    errEl.classList.remove('is-visible');
  }
}

function validateField(field) {
  const val = field.value;
  const type = field.type;
  const name = field.name;
  clearFieldError(field);

  if (field.required && !validators.required(val)) {
    showFieldError(field, 'Este campo es obligatorio.');
    return false;
  }

  if (type === 'email' && val && !validators.email(val)) {
    showFieldError(field, 'Introduce un email válido.');
    return false;
  }

  if (name === 'telefono' && val && !validators.phone(val)) {
    showFieldError(field, 'Introduce un teléfono válido (6-20 dígitos).');
    return false;
  }

  if (type === 'checkbox' && field.required && !field.checked) {
    showFieldError(field, 'Debes aceptar la política de privacidad.');
    return false;
  }

  return true;
}

/* ============================================================
   FORM FEEDBACK MESSAGES
   ============================================================ */
function showFeedback(form, type, message) {
  // Remove old feedback
  const old = form.querySelector('.form__feedback');
  if (old) old.remove();

  const icons = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error:   `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };

  const div = document.createElement('div');
  div.className = `form__feedback form__feedback--${type} is-visible`;
  div.setAttribute('role', 'alert');
  // message is either a hardcoded string or sanitized Formspree response — not raw user input
  div.innerHTML = `${icons[type]}<span>${sanitize(message)}</span>`;

  const submitGroup = form.querySelector('.form__submit')?.closest('.form__group') ||
                      form.querySelector('.form__submit')?.parentElement;
  if (submitGroup) {
    submitGroup.after(div);
  } else {
    form.appendChild(div);
  }

  // Scroll feedback into view
  div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ============================================================
   SUBMIT BUTTON STATE
   ============================================================ */
function setButtonLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.classList.add('is-loading');
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
  } else {
    btn.classList.remove('is-loading');
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
  }
}

/* ============================================================
   HONEYPOT CHECK
   ============================================================ */
function isSpam(form) {
  const honeypot = form.querySelector('[name="_gotcha"], [name="url"]');
  return honeypot && honeypot.value.trim() !== '';
}

/* ============================================================
   AJAX FORM SUBMISSION (Formspree)
   ============================================================ */
async function submitForm(form) {
  const submitBtn = form.querySelector('.form__submit');
  const action = form.getAttribute('action');

  // Honeypot check
  if (isSpam(form)) {
    // Silently succeed (don't tell the spammer)
    setButtonLoading(submitBtn, false);
    showFeedback(form, 'success',
      '¡Gracias! Hemos recibido tu mensaje y te contactaremos en breve.');
    form.reset();
    return;
  }

  // Validate all fields
  let isValid = true;
  form.querySelectorAll('input:not([type="hidden"]):not(.form__honeypot input), select, textarea').forEach(field => {
    if (!validateField(field)) isValid = false;
  });

  // Special check for RGPD checkbox
  const rgpdCheckbox = form.querySelector('[name="rgpd"]');
  if (rgpdCheckbox && !rgpdCheckbox.checked) {
    showFieldError(rgpdCheckbox, 'Debes aceptar la política de privacidad.');
    isValid = false;
  }

  if (!isValid) {
    // Focus first invalid field
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  setButtonLoading(submitBtn, true);

  // Build FormData
  const data = new FormData(form);

  try {
    const response = await fetch(action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      showFeedback(form, 'success',
        '¡Mensaje enviado correctamente! Te contactaremos lo antes posible.');
      form.reset();
      // Keep button disabled to prevent duplicate submissions
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '¡Enviado!';
      }
    } else {
      const json = await response.json().catch(() => ({}));
      const errMsg = sanitize(json?.errors?.map(e => e.message).join(', ') || '') ||
        'Ha ocurrido un error. Por favor inténtalo de nuevo o llámanos al 680 917 536.';
      showFeedback(form, 'error', errMsg);
      setButtonLoading(submitBtn, false);
    }
  } catch (_err) {
    showFeedback(form, 'error',
      'Sin conexión. Por favor, inténtalo de nuevo o contáctanos por teléfono: 680 917 536.');
    setButtonLoading(submitBtn, false);
  }
}

/* ============================================================
   INIT — wire up all forms on the page
   ============================================================ */
function initForms() {
  document.querySelectorAll('form[data-ajax]').forEach(form => {
    // Real-time validation on blur
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => {
        if (field.value || field.type === 'checkbox') {
          validateField(field);
        }
      });
      field.addEventListener('input', () => clearFieldError(field));
    });

    // Submit handler
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitForm(form);
    });
  });
}

document.addEventListener('DOMContentLoaded', initForms);
