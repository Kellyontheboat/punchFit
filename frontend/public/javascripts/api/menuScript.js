import { postSchedule, addItemsIntoSchedule } from '../api/scheduleScript.js'

import { renderSubmitMenuBtn } from '../render/menuRender.js'

const token = localStorage.getItem('token')
export async function getModulesBySections (sectionIds) {
  const queryString = sectionIds.join(',')

  const response = await fetch(`/api/sections/modules?sectionIds=${queryString}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  const modules = await response.json()
  const moduleId = []
  modules.forEach(module => {
    moduleId.push(module.id)
  })
  console.log({ modules, moduleId })
  return { modules, moduleId }
}

export async function addListenerEditMenuBtn () {
  const EditMenuBtn = document.querySelectorAll('.edit-menu-module')

  for (const btn of EditMenuBtn) {
    const sectionId = btn.closest('.module-wrap').querySelector('.menu-section-item').dataset.sectionId
    console.log(sectionId)
    btn.addEventListener('click', async function (event) {
      // Save the current URL as the last URL before navigating
      sessionStorage.setItem('lastUrl', window.location.href)
      window.location.href = `/sections/${sectionId}/parts`
    })
  }
}

// save into Schedule
export async function addListenerSubmitMenu () {
  const SubmitMenuBtn = await renderSubmitMenuBtn()
  console.log(SubmitMenuBtn)
  SubmitMenuBtn.addEventListener('click', async function (event) {
    event.preventDefault()
    const scheduleName = await submitMenu()
    console.log(scheduleName)
    if (!scheduleName) return

    const lastUrl = sessionStorage.getItem('lastUrl')

    const saveSuccessAlert = document.getElementById('saveSuccessAlert')
    saveSuccessAlert.classList.remove('d-none')

    // Redirect after a short delay
    setTimeout(() => {
      if (lastUrl) {
        sessionStorage.removeItem('lastUrl')
        window.location.href = lastUrl
      } else {
        window.location.href = '/schedules'
      }
    }, 1500)
  })
}

// submit to Schedule
export async function submitMenu () {
  const params = new URLSearchParams(window.location.search)
  const sectionIds = params.get('sectionIds') ? params.get('sectionIds').split(',').map(Number) : []
  const today = new Date()
  const currentDate = today.toLocaleDateString('en-CA')
  console.log(currentDate)
  const scheduleName = document.getElementById('schedule-name-input').value

  if (!scheduleName) {
    alert('Schedule name cannot be empty!')
    return
  }

  const scheduleId = await postSchedule({ scheduleName, date: currentDate })
  console.log(scheduleId)
  addItemsIntoSchedule({ sectionIds, scheduleId })
  console.log(sectionIds)
  return scheduleName
}
