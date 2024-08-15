// import { planFormSubmission } from '../api/'
export function renderCalendar () {
  const calendarEl = document.getElementById('calendar')
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    dateClick: function (info) {
      // When a day is clicked, show the modal
      showModal(info.dateStr)
    }
  })
  calendar.render()
}

function showModal (date) {
  // Fetch sections and section IDs from localStorage
  const sections = JSON.parse(localStorage.getItem('sections')) || []
  const sectionsId = JSON.parse(localStorage.getItem('sectionsId')) || []

  // Create the modal content
  let modalContent = `
    <form id="planForm">
      <div class="form-group">
        <label>Select a Section</label>`

  sections.forEach((sectionName, index) => {
    const sectionId = sectionsId[index]// sectionsId:array of sectionId
    modalContent += `
      <div class="form-check">
        <input class="form-check-input" type="radio" name="section" value="${sectionId}" id="section${sectionId}">
        <label class="form-check-label" for="section${sectionId}">${sectionName}</label>
      </div>`
  })

  modalContent += `
      </div>
      <div class="form-group">
        <label for="planName">Plan Name</label>
        <input type="text" class="form-control" id="planName" name="planName" required>
      </div>
      <button type="submit" class="btn btn-primary">Create Plan on ${date}!</button>
    </form>`

  // Insert modal content into a modal element
  document.getElementById('modalBody').innerHTML = modalContent

  // Show the modal
  $('#myModal').modal('show')

  // Handle form submission
  document.getElementById('planForm').addEventListener('submit', function (event) {
    event.preventDefault()
    // Handle form submission
    // planFormSubmission()
    console.log('Form submitted')
    // Close the modal
    $('#myModal').modal('hide')
  })
}

// Ensure the DOM is fully loaded before rendering the calendar
document.addEventListener('DOMContentLoaded', async function () {
  renderCalendar()
})
