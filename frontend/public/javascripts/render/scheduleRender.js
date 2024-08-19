import { checkLoginStatus } from '../api/authScript.js'
const token = localStorage.getItem('token')
let calendar

document.addEventListener('DOMContentLoaded', async function () {
  const { user, isAuthenticated, token } = await checkLoginStatus()
  console.log(user)

  if (!isAuthenticated) {
    console.log('User is not authenticated')
  } else {
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
          showModal(info.dateStr)
        },
        eventClick: async function (info) {
          const scheduleId = info.event.extendedProps.scheduleId
          const scheduleItems = await getSchedulesItems(scheduleId)
          console.log(scheduleItems)
          showScheduleItemsModal(scheduleItems, scheduleId)
        }
      })
      calendar.render()
    }

    const { schedules } = await getSchedules()
    renderCalendar(schedules)
    getSchedulesItems()
  }
})

// function showScheduleItemsModal (scheduleItems) {
//   let modalContent = `
//     <ul class="list-group">`

//   scheduleItems.forEach(item => {
//     modalContent += `
//       <li class="list-group-item">
//         <strong>${item.name}</strong><br>
//         Reps: ${item.reps}, Sets: ${item.sets}, Weight: ${item.weight}
//       </li>`
//   })

//   modalContent += `
//     </ul>`

//   // Update the modal body content
//   document.querySelector('#scheduleItemModal .modal-body').innerHTML = modalContent

//   // Show the modal
//   $('#scheduleItemModal').modal('show')
// }

async function planFormSubmission (date) {
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
async function addItemsIntoSchedule ({ sectionIds, scheduleId }) {
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
async function getSchedules () {
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

async function getSchedulesItems (scheduleId = null) {
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



function showScheduleItemsModal(scheduleItems, scheduleId) {
  let modalContent = `<input type="hidden" name="scheduleId" value="${scheduleId}">`; // Hidden input for schedule_id

  scheduleItems.forEach((item, index) => {
    modalContent += `
      <div class="form-group">
        <label for="exercise${index}">Exercise: ${item.name}</label>
        <input type="hidden" name="exerciseIds[]" value="${item.id}">
        <div class="form-row">
          <div class="col">
            <label for="reps${index}">Reps</label>
            <input type="number" class="form-control" name="reps[]" id="reps${index}" value="${item.reps}" disabled required>
          </div>
          <div class="col">
            <label for="sets${index}">Sets</label>
            <input type="number" class="form-control" name="sets[]" id="sets${index}" value="${item.sets}" disabled required>
          </div>
          <div class="col">
            <label for="weight${index}">Weight</label>
            <input type="text" class="form-control" name="weight[]" id="weight${index}" value="${item.weight}" disabled required>
          </div>
        </div>
      </div>`;
  });

  // Insert modal content into modal
  document.querySelector('#scheduleItemModal .modal-body').innerHTML = modalContent;

  $('#scheduleItemModal').modal('show');

  // Handle switching to edit mode
  const editButton = document.getElementById('editButton');
  const submitButton = document.getElementById('submitButton');

  editButton.addEventListener('click', function () {
    // Enable form fields for editing
    document.querySelectorAll('#editScheduleForm input[type="number"], #editScheduleForm input[type="text"]').forEach(input => {
      input.disabled = false;
    });

    // Hide the Edit button and show the Submit button
    editButton.classList.add('d-none');
    submitButton.classList.remove('d-none');
  });

  // Handle edit schedule form submission
  document.getElementById('editScheduleForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const form = document.getElementById('editScheduleForm');
    const formData = new FormData(form);

    // Prepare the data for submission
    const scheduleId = formData.get('scheduleId'); // Retrieve the scheduleId
    console.log(scheduleId)
    const updatedItems = [];
    const exerciseIds = formData.getAll('exerciseIds[]');
    const reps = formData.getAll('reps[]');
    const sets = formData.getAll('sets[]');
    const weights = formData.getAll('weight[]');

    for (let i = 0; i < exerciseIds.length; i++) {
      updatedItems.push({
        exerciseId: exerciseIds[i],
        reps: reps[i],
        sets: sets[i],
        weight: weights[i],
        scheduleId: scheduleId // Include the scheduleId in each item
      });
    }

    console.log('Updated Items:', updatedItems);

    // Assume updateScheduleItems is a function to send updated data to the backend
    await updateScheduleItems(updatedItems);

    // Close the modal
    $('#scheduleItemModal').modal('hide');
  });
}

async function updateScheduleItems(updatedItems) {
  const token = localStorage.getItem('token');
  console.log(updatedItems)
  try {
    const response = await fetch('/api/scheduleItems/update', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ updatedItems })
    });

    if (!response.ok) {
      throw new Error('Failed to update schedule items');
    }

    console.log('Schedule items updated successfully');
  } catch (error) {
    console.error('Error updating schedule items:', error);
  }
}