// Backend-enabled script.js
(function () {
  const API_HOST = (window.__ENV__ && window.__ENV__.API_HOST) || window.location.origin;
  const eventList = document.querySelector('.event-list');
  const statusElem = document.createElement('div');
  statusElem.id = 'booking-status';
  document.body.appendChild(statusElem);

  const defaultEvents = [
    { title: 'Coldplay Concert', date: '2025-01-20', location: 'Mumbai, India' },
    { title: 'Comedy Night', date: '2025-01-25', location: 'Delhi, India' },
    { title: 'Art Exhibition', date: '2025-02-10', location: 'Bangalore, India' }
  ];

  function renderEvents(events) {
    eventList.innerHTML = '';
    events.forEach(event => {
      const eventCard = document.createElement('div');
      eventCard.classList.add('event-card');
      eventCard.innerHTML = `
        <h3>${event.title}</h3>
        <p>Date: ${event.date}</p>
        <p>Location: ${event.location}</p>
        <button data-title="${event.title}">Book Now</button>
      `;
      eventList.appendChild(eventCard);
    });
    // attach handlers
    document.querySelectorAll('.event-card button').forEach(btn => {
      btn.addEventListener('click', () => bookTicket(btn.getAttribute('data-title')));
    });
  }

  async function loadEvents() {
    try {
      const res = await fetch(API_HOST + '/api/shows');
      if (res.ok) {
        const data = await res.json();
        renderEvents(data.shows || defaultEvents);
        return;
      }
    } catch (e) {
      // ignore and fallback to defaults
    }
    renderEvents(defaultEvents);
  }

  async function bookTicket(eventTitle) {
    statusElem.innerText = 'Booking...';
    const payload = { userId: 'anon-user', eventTitle, seats: [] };
    // Try 2 retries for transient errors
    for (let i = 0; i < 2; i++) {
      try {
        const res = await fetch(API_HOST + '/api/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          statusElem.innerText = `Booking ${json.status} (id=${json.bookingId || json.id || 'n/a'})`;
          // If pending, poll for confirmation (simple naive loop)
          if (json.status === 'pending' && json.bookingId) {
            pollConfirmation(json.bookingId);
          }
          return;
        } else {
          const text = await res.text();
          statusElem.innerText = 'Booking failed: ' + text;
        }
      } catch (e) {
        statusElem.innerText = 'Network error, retrying...';
      }
    }
    statusElem.innerText = 'Booking failed after retries.';
  }

  async function pollConfirmation(bookingId) {
    let attempts = 0;
    while (attempts < 6) {
      try {
        const res = await fetch(API_HOST + '/api/book/' + bookingId);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'confirmed') {
            statusElem.innerText = 'Booking confirmed!';
            return;
          }
        }
      } catch (e) { /* ignore */ }
      await new Promise(r => setTimeout(r, 3000));
      attempts++;
    }
    statusElem.innerText = 'Booking still pending. You will be notified.';
  }

  document.addEventListener('DOMContentLoaded', loadEvents);
  window.addEventListener('beforeunload', () => {
    // best-effort beacon
    if (navigator.sendBeacon) {
      const payload = new Blob([JSON.stringify({ ts: Date.now() })], { type: 'application/json' });
      navigator.sendBeacon(API_HOST + '/api/keepalive', payload);
    }
  });
})();
