import { checkLoginStatus } from '../api/authScript.js'
import { planFormSubmission, postSchedule, addItemsIntoSchedule, getSchedules, getSchedulesItems, updateScheduleItems } from '../api/scheduleScript.js'

const token = localStorage.getItem('token')
let calendar

document.addEventListener('DOMContentLoaded', async function () {
  const { user, isAuthenticated, token } = await checkLoginStatus()
  console.log(user)

  if (!isAuthenticated) {
    console.log('User is not authenticated')
  } else {
    const token = localStorage.getItem('token')

    async function renderCalendar (schedules) {
      console.log(schedules)
      const calendarEl = document.getElementById('calendar')
      calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: schedules.map(schedule => ({
          id: schedule.id,
          title: schedule.schedule_name,
          start: schedule.schedule_date,
          extendedProps: {
            scheduleId: schedule.id
          }
        })),
        // dateClick: function (info) {
        //   const selectedDate = new Date(info.dateStr)
        //   const today = new Date()

        //   // Clear the time part of both dates to compare only the date portion
        //   selectedDate.setHours(0, 0, 0, 0)
        //   today.setHours(0, 0, 0, 0)

        //   if (selectedDate > today) {
        //     alert('You can only create records for today or past dates!')
        //   } else {
        //     showModal(info.dateStr)
        //   }
        // },
        eventClick: async function (info) {
          const scheduleId = info.event.extendedProps.scheduleId
          const scheduleItems = await getSchedulesItems(scheduleId)
          console.log(scheduleItems)
          showScheduleItemsModal(scheduleItems, scheduleId)
        }
      })
      calendar.render()
      // Make calendar globally accessible
      window.calendar = calendar
    }

    const { schedules } = await getSchedules()
    await renderCalendar(schedules)
    await getSchedulesItems()
  }
})

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

async function showScheduleItemsModal (scheduleItems, scheduleId) {
  // Reset the modal buttons to their initial state
  // const editButton = document.getElementById('editButton');

  // const submitButton = document.getElementById('submitButton');
  // editButton.classList.remove('d-none');
  // submitButton.classList.add('d-none');

  // Create the hidden input for scheduleId
  const hiddenInput = document.createElement('input')
  hiddenInput.type = 'hidden'
  hiddenInput.name = 'scheduleId'
  hiddenInput.value = scheduleId
  hiddenInput.classList.add('hidden-input')

  // Create the unordered list element with the class "list-group"
  const ulElement = document.createElement('ul')
  ulElement.className = 'list-group'

  // Loop through schedule items and create list items
  console.log(scheduleItems)
  scheduleItems.forEach((item) => {
    // Create the list item element with the class "list-group-item"
    const liElement = document.createElement('li')
    liElement.className = 'list-group-item'
    liElement.id = `item-${item.id}`

    // Create the div for the exercise name
    const exerciseNameDiv = document.createElement('div')
    exerciseNameDiv.innerHTML = `<strong>${item.section}: </strong><em>${item.name}</em> `

    // Create the div for exercise details with the class "exercise-details"
    const exerciseDetailsDiv = document.createElement('div')
    exerciseDetailsDiv.className = 'exercise-details'
    exerciseDetailsDiv.textContent = `${item.reps} reps / ${item.sets} sets / ${item.weight} kg`

    // // Create the delete button
    // const deleteButton = document.createElement('button');
    // deleteButton.type = 'button';
    // deleteButton.className = 'btn btn-danger btn-sm delete-btn d-none mt-2';
    // deleteButton.setAttribute('data-exercise-id', item.id);
    // deleteButton.textContent = 'Delete';

    // Append the exercise name, details, and delete button to the list item
    liElement.appendChild(exerciseNameDiv)
    liElement.appendChild(exerciseDetailsDiv)
    // liElement.appendChild(deleteButton);

    // Append the list item to the unordered list
    ulElement.appendChild(liElement)
  })

  // Get the modal body and clear any existing content
  const modalBody = document.querySelector('#scheduleItemModal .modal-body')
  modalBody.innerHTML = '' // Clear any existing content

  // Append the hidden input and the unordered list to the modal body
  modalBody.appendChild(hiddenInput)
  modalBody.appendChild(ulElement)

  // Show the modal
  $('#scheduleItemModal').modal('show')

  // // Handle delete button functionality
  // const deleteButtons = document.querySelectorAll('.delete-btn');
  // const itemsToDelete = new Set();

  // editButton.addEventListener('click', function () {
  //   deleteButtons.forEach(button => button.classList.remove('d-none'));
  //   editButton.classList.add('d-none');
  //   submitButton.classList.remove('d-none');
  // });

  // deleteButtons.forEach(button => {
  //   button.addEventListener('click', function () {
  //     const exerciseId = this.getAttribute('data-exercise-id');
  //     itemsToDelete.add(exerciseId);
  //     document.getElementById(`item-${exerciseId}`).remove(); // Remove item from modal
  //   });
  // });

  document.getElementById('editScheduleForm').addEventListener('submit', async function (event) {
    event.preventDefault()

    const form = document.getElementById('editScheduleForm')
    const formData = new FormData(form)

    const scheduleId = formData.get('scheduleId')
    const updatedItems = []
    const exerciseIds = formData.getAll('exerciseIds[]')
    const reps = formData.getAll('reps[]')
    const sets = formData.getAll('sets[]')
    const weights = formData.getAll('weight[]')

    for (let i = 0; i < exerciseIds.length; i++) {
      if (!itemsToDelete.has(exerciseIds[i])) {
        updatedItems.push({
          exerciseId: exerciseIds[i],
          reps: reps[i],
          sets: sets[i],
          weight: weights[i],
          scheduleId
        })
      }
    }

    console.log('Updated Items:', updatedItems)
    console.log('Items to Delete:', Array.from(itemsToDelete))

    await updateScheduleItems(updatedItems, Array.from(itemsToDelete))

    $('#scheduleItemModal').modal('hide')
  })
}

export async function welcomeMessage () {
  const welcomeContainer = document.querySelector('.welcome')
  const messageContainer = document.querySelector('.welcome-message')
  welcomeContainer.innerText = ''
  messageContainer.innerText = 'Your Record'
}
