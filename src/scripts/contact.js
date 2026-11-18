/* ============================================================================
 *  Contact form handler.
 *
 *  On submit it:
 *    1. saves a copy of the inquiry to the backend (POST /api/contact →
 *       encrypted in Postgres, readable at /admin);
 *    2. then:
 *       • if a business email is set → opens a pre-filled mailto: draft
 *       • otherwise → confirms receipt once the backend has stored it, and
 *         invites the visitor to book via Calendly
 *  If the backend is down or the site is served from a static-only host,
 *  step 2 behaves exactly as it did before the backend existed.
 *
 *  If the <form> is given an `action` + `method="POST"`, this handler steps aside.
 * ========================================================================== */
(function () {
  'use strict';
  var form = document.getElementById('contactForm');
  if (!form) return;
  var status = document.getElementById('cfStatus');

  // If a real backend action is set on the form, let the browser handle it.
  if (form.getAttribute('action')) return;

  // Saves a copy to the backend (src/pages/api/contact.ts). Resolves true once
  // stored, or false on any failure (offline, static-only host, slow/broken
  // backend) — it never rejects, so the visible flow below always completes.
  // `keepalive` lets the request finish even if opening the mail app moves the
  // page along; browsers cap keepalive bodies at 64 KB, so it's only used below that.
  function saveInquiry(payload) {
    if (!window.fetch) return Promise.resolve(false);
    var body = JSON.stringify(payload);
    try {
      var request = fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        keepalive: new Blob([body]).size < 60000,
      }).then(
        function (res) {
          return res.status === 201;
        },
        function () {
          return false;
        },
      );
      var timeout = new Promise(function (resolve) {
        setTimeout(resolve, 8000, false);
      });
      return Promise.race([request, timeout]);
    } catch {
      return Promise.resolve(false); // very old browser
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    var data = new FormData(form);
    var name = (data.get('name') || '').toString().trim();
    var email = (data.get('email') || '').toString().trim();
    var org = (data.get('organization') || '').toString().trim();
    var type = (data.get('projectType') || '').toString().trim();
    var message = (data.get('message') || '').toString().trim();

    var saved = saveInquiry({
      name: name,
      email: email,
      organization: org,
      projectType: type,
      message: message,
      website: (data.get('website') || '').toString(), // spam trap; empty for people
    });

    var to = form.dataset.email;
    if (to) {
      var subject = 'Project inquiry from ' + (name || 'a website visitor');
      var bodyLines = [
        'Name: ' + name,
        'Email: ' + email,
        org ? 'Organization: ' + org : '',
        type ? 'Project type: ' + type : '',
        '',
        message,
      ].filter(Boolean);
      var href =
        'mailto:' +
        to +
        '?subject=' +
        encodeURIComponent(subject) +
        '&body=' +
        encodeURIComponent(bodyLines.join('\n'));
      window.location.href = href;
      if (status) status.textContent = 'Opening your email app to send…';
    } else if (status) {
      var cal = form.dataset.calendly;
      var calLink = cal
        ? '<a class="green" href="' + cal + '" target="_blank" rel="noopener">book a quick consultation</a>'
        : 'reach out via Calendly';
      status.textContent = 'Sending…';
      // Only say the message arrived once the backend confirms it was stored.
      saved.then(function (ok) {
        status.innerHTML = ok
          ? 'Thanks — we’ve received your message! For the fastest response, ' + calLink + '.'
          : 'Thanks! Our contact inbox isn’t connected yet — please ' + calLink + ' and we’ll take it from there.';
      });
    }
  });
})();
