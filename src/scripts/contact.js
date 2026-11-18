/* ============================================================================
 *  Contact form handler.
 *
 *  On submit it:
 *    1. saves a copy of the inquiry to the backend (POST /api/contact →
 *       encrypted in Postgres, readable at /admin), in the background;
 *    2. then, exactly as before:
 *       • if a business email is set → opens a pre-filled mailto: draft
 *       • otherwise → invites the visitor to book via Calendly
 *  Step 1 never blocks or changes step 2. If the backend is down or the site
 *  is served from a static-only host, visitors see no difference.
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

  // Fire-and-forget save to the backend (src/pages/api/contact.ts).
  // `keepalive` lets the request finish even if opening the mail app moves the
  // page along; browsers cap keepalive bodies at 64 KB, so it's only used below that.
  function saveInquiry(payload) {
    if (!window.fetch) return;
    var body = JSON.stringify(payload);
    try {
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        keepalive: new Blob([body]).size < 60000,
      }).catch(function () {
        /* offline / backend unavailable — the visible flow below still works */
      });
    } catch (err) {
      /* very old browser — ignore */
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

    saveInquiry({
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
      status.innerHTML =
        'Thanks! Our contact inbox isn’t connected yet — please ' +
        (cal ? '<a class="green" href="' + cal + '" target="_blank" rel="noopener">book a quick consultation</a>' : 'reach out via Calendly') +
        ' and we’ll take it from there.';
    }
  });
})();
