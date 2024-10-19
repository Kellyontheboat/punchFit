import { checkLoginStatus } from '../api/authScript.js'
import { getSchedules, getSchedulesItems } from '../api/scheduleScript.js'

const token = localStorage.getItem('token')
let calendar

document.addEventListener('DOMContentLoaded', async function () {
  const { user, isAuthenticated, token } = await checkLoginStatus()

  if (!isAuthenticated) {
    console.log('User is not authenticated')
  } else {
    const token = localStorage.getItem('token')

    async function renderCalendar (schedules) {
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

async function showScheduleItemsModal (scheduleItems, scheduleId) {
  const postContainer = document.getElementById('post-container');
  const postWrappers = postContainer.querySelectorAll('.post-wrapper');

  for (let wrapper of postWrappers) {
    const postElement = wrapper.querySelector('.post');
    if (postElement && postElement.dataset.id === scheduleId.toString()) {
      // Remove the wrapper from its current position
      wrapper.remove();
      // Insert it at the beginning of the container
      postContainer.insertAdjacentElement('afterbegin', wrapper);
      break; // Exit the loop once we've moved the matching wrapper
    }
  }
}