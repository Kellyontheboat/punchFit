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
        eventDidMount: function (info) {
          // Set a data attribute on the event element for easy access later
          info.el.setAttribute('data-schedule-id', info.event.extendedProps.scheduleId);
        },
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
  console.log(scheduleItems, scheduleId)
  const postContainer = document.getElementById('post-container');
  const postWrappers = postContainer.querySelectorAll('.post-wrapper');

  for (let wrapper of postWrappers) {
    const postElement = wrapper.querySelector('.post');
    if (postElement && postElement.dataset.id === scheduleId.toString()) {
      console.log('Match found:', postElement);
      // Remove the wrapper from its current position
      wrapper.remove();
      // Insert it at the beginning of the container
      postContainer.insertAdjacentElement('afterbegin', wrapper);
      console.log('Moved wrapper to front');
      break; // Exit the loop once we've moved the matching wrapper
    }
  }
}

// export async function welcomeMessage () {
//   const welcomeContainer = document.querySelector('.welcome')
//   const messageContainer = document.querySelector('.welcome-message')
//   welcomeContainer.innerText = ''
//   messageContainer.innerText = 'Your Record'
// }
