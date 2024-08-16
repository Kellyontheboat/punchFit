//import { checkLoginStatus } from '../api/authScript.js'

//const { user, isAuthenticated } = await checkLoginStatus()

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

function showModal(date) {
  // Fetch sections and section IDs from localStorage
  const sections = JSON.parse(localStorage.getItem('sections')) || []
  const sectionsId = JSON.parse(localStorage.getItem('sectionsId')) || []

  // Create the modal content
  let modalContent = `
    <form id="planForm">
      <div class="form-group">
        <label>Select Sections</label>`

  sections.forEach((sectionName, index) => {
    const sectionId = sectionsId[index] // sectionsId:array of sectionId
    modalContent += `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" name="sections" value="${sectionId}" id="section${sectionId}">
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
  document.getElementById('planForm').addEventListener('submit', async function (event) {
    event.preventDefault()
    const sectionIds = await planFormSubmission()
    const modules = await getModuleBySectionIds(sectionIds)
    
    console.log('Selected modules:', modules)//[{id,createdAt,member_id,module_name,section_id}]
    $('#myModal').modal('hide')
    return modules
  })
}


export async function planFormSubmission() {
  // Get the form data from the modal
  const form = document.getElementById('planForm')
  const formData = new FormData(form)

  // Retrieve selected section IDs from the form data
  const sectionIds = []
  formData.getAll('sections').forEach(sectionId => {
    sectionIds.push(sectionId)
  })

  // Return the array of selected section IDs
  return sectionIds
}

export async function getModuleBySectionIds(sectionIds) {
  const token = localStorage.getItem('token');

  const moduleIds = [];
  for (const id of sectionIds) {
    try {
      const response = await fetch(`/api/sections/${id}/modules`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const moduleId = await response.json();
      moduleIds.push(moduleId);
    } catch (error) {
      console.error(`Failed to fetch module for section ${id}:`, error);
      return
    }
  }
  return moduleIds;
}


// Ensure the DOM is fully loaded before rendering the calendar
document.addEventListener('DOMContentLoaded', async function () {
  renderCalendar()
})
