// import { checkLoginStatus } from '../api/authScript.js'

// const { user, isAuthenticated } = await checkLoginStatus()
let calendar
const token = localStorage.getItem('token')
function renderCalendar (schedules) {
  console.log(schedules)
  const calendarEl = document.getElementById('calendar')
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    events: schedules.map(schedule => ({
      title: schedule.schedule_name,
      start: schedule.schedule_date,
      extendedProps: {
        scheduleId: schedule.id
      }
    })),
    dateClick: function (info) {
      // day modal
      showModal(info.dateStr)
    },
    eventClick: async function (info) {
      const scheduleId = info.event.extendedProps.scheduleId
      const scheduleItems = await getSchedulesItems(scheduleId)
      console.log(scheduleItems)
      showScheduleItemsModal(scheduleItems)
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

  // Insert modal content into modal
  document.getElementById('modalBody').innerHTML = modalContent

  $('#myModal').modal('show')

  // Handle form submission
  document.getElementById('planForm').addEventListener('submit', async function (event) {
    event.preventDefault()
    const { sectionIds, scheduleName } = await planFormSubmission(date)
    console.log(sectionIds)
    $('#myModal').modal('hide')
  })
}

function showScheduleItemsModal (scheduleItems) {
  let modalContent = `
    <ul class="list-group">`

  scheduleItems.forEach(item => {
    modalContent += `
      <li class="list-group-item">
        <strong>${item.name}</strong><br>
        Reps: ${item.reps}, Sets: ${item.sets}, Weight: ${item.weight}
      </li>`
  })

  modalContent += `
    </ul>`

  // Update the modal body content
  document.querySelector('#scheduleItemModal .modal-body').innerHTML = modalContent

  // Show the modal
  $('#scheduleItemModal').modal('show')
}

export async function planFormSubmission (date) {
  // Get the form data from the modal
  const form = document.getElementById('planForm')
  const formData = new FormData(form)
  // Retrieve selected section IDs from the form data
  const sectionIds = []
  formData.getAll('sections').forEach(sectionId => {
    sectionIds.push(sectionId)
  })
  const scheduleName = formData.get('planName')
  console.log('formSubmission', { sectionIds, scheduleName, date })

  const data = { sectionIds, scheduleName, date }
  console.log(data)
  const scheduleId = await postSchedule({ scheduleName, date })
  await addItemsIntoSchedule({ sectionIds, scheduleId })

  // Add the new event to the calendar
  calendar.addEvent({
    title: scheduleName,
    start: date,
    extendedProps: {
      scheduleId
    }
  })

  return data
}

async function postSchedule ({ scheduleName, date }) {
  const token = localStorage.getItem('token')
  const data = { scheduleName, date }
  try {
    const response = await fetch('/api/schedules', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Failed to add schedule')
    }
    const scheduleData = await response.json()
    const scheduleId = scheduleData.schedule_id
    console.log(scheduleId)
    return scheduleId // send to addItemsIntoSchedule
  } catch (error) {
    console.error('Error:', error)
  }
}

// sectionIds>modules>exercises
export async function addItemsIntoSchedule ({ sectionIds, scheduleId }) {
  console.log({ sectionIds, scheduleId })
  const token = localStorage.getItem('token')
  try {
    const data = { sectionIds, scheduleId }
    const response = await fetch('/api/scheduleItems', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Failed to add scheduleItems')
    }
  } catch (error) {
    console.error('Error:', error)
  }
  return { sectionIds }// the section user want to train
}

// get schedules of current member
export async function getSchedules () {
  const response = await fetch('/api/schedules', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  const schedules = await response.json()

  const scheduleIds = []
  schedules.forEach(s => {
    scheduleIds.push(s.id)
  })
  console.log(scheduleIds)
  return { scheduleIds, schedules }
}

export async function getSchedulesItems (scheduleId = null) {
  const token = localStorage.getItem('token')
  let scheduleIdsArray = []

  // If scheduleId is provided, use it;(when user just created a schedule need to render right away)
  // otherwise, get all scheduleIds(when page loaded need to get all schedules)
  if (scheduleId) {
    console.log(scheduleId)
    scheduleIdsArray.push(scheduleId)
  } else {
    const { scheduleIds, schedules } = await getSchedules()
    scheduleIdsArray = scheduleIds
  }

  if (scheduleIdsArray.length === 0) return []

  const allExercises = []
  for (const id of scheduleIdsArray) {
    const response = await fetch(`/api/schedules/${id}/items`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch items for schedule ${id}`)
    }

    const rawData = await response.json()
    const exercises = rawData.items.map(item => ({
      id: item.exercise.id,
      name: item.exercise.name,
      section: item.section.section_name,
      reps: item.reps,
      sets: item.sets,
      weight: item.weight,
      status: item.status
    }))
    console.log(exercises)
    allExercises.push(...exercises)
  }

  console.log(allExercises)
  return allExercises
}

// Ensure the DOM is fully loaded before rendering the calendar
document.addEventListener('DOMContentLoaded', async function () {
  console.log('schedule Dom loaded')
  const { schedules } = await getSchedules()
  console.log(schedules)
  renderCalendar(schedules)
  getSchedulesItems()
})
