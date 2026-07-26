/* ============================================================================
 *  Contact form handler — front-end only (no backend connected yet).
 *
 *  When a real endpoint is configured (see Contact.astro comment + README),
 *  give the <form> an `action` + `method="POST"` and this handler steps aside.
 *  Until then it degrades gracefully:
 *    • if a business email is set → opens a pre-filled mailto: draft
 *    • otherwise → invites the visitor to book via Calendly
 * ========================================================================== */
(function () {
  'use strict';
  var form = document.getElementById('contactForm');
  if (!form) return;
  var status = document.getElementById('cfStatus');

  // If a real backend action is set on the form, let the browser handle it.
  if (form.getAttribute('action')) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    var data = new FormData(form);
    var name = (data.get('name') || '').toString().trim();
    var email = (data.get('email') || '').toString().trim();
    var org = (data.get('organization') || '').toString().trim();
    var type = (data.get('projectType') || '').toString().trim();
    var message = (data.get('message') || '').toString().trim();

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
