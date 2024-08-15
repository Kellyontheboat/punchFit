export function renderCalendar () {
  const calendarEl = document.getElementById('calendar')
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth'
  })
  calendar.render()
}

// Ensure the DOM is fully loaded before rendering the calendar
document.addEventListener('DOMContentLoaded', renderCalendar)
