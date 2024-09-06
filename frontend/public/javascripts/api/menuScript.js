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

  if (!SubmitMenuBtn) {
    console.error('Submit button not found')
    return
  }

  SubmitMenuBtn.addEventListener('click', async function (event) {
    console.log('start to submit menu')
    event.preventDefault() // Prevent the default form submission behavior

    const scheduleName = await submitMenu()
    if (!scheduleName) return
    
    const lastUrl = sessionStorage.getItem('lastUrl')
    const saveSuccessAlert = document.getElementById('saveSuccessAlert')
    saveSuccessAlert.classList.remove('d-none')

    // Redirect after a short delay
    setTimeout(() => {
      if (lastUrl) {
        console.log('menu lastUrl')
        sessionStorage.removeItem('lastUrl')
        window.location.href = lastUrl
      } else {
        console.log('menu redirect')
        window.location.href = '/posts'
      }
    }, 1500)
  })
}

// export async function addListenerSubmitMenu () {
//   const SubmitMenuBtn = await renderSubmitMenuBtn()
//   SubmitMenuBtn.addEventListener('click', async function (event) {
//     console.log("start to submit menu")
//     event.preventDefault()
//     const scheduleName = await submitMenu()
//     if (!scheduleName) return

//     const lastUrl = sessionStorage.getItem('lastUrl')

//     const saveSuccessAlert = document.getElementById('saveSuccessAlert')
//     saveSuccessAlert.classList.remove('d-none')

//     // Redirect after a short delay
//     setTimeout(() => {
//       if (lastUrl) {
//         console.log("menu lastUrl")
//         sessionStorage.removeItem('lastUrl')
//         window.location.href = lastUrl
//       } else {
//         console.log("menu redirect")
//         window.location.href = '/schedules'
//       }
//     }, 1500)
//   })
// }

// Handle file input and caption
export async function submitMenu () {
  const fileInput = document.getElementById('formFile')
  const captionInput = document.getElementById('captionInput')
  const file = fileInput.files[0]
  const caption = captionInput.value

  if (file && !file.type.startsWith('video/')) {
    alert('Please upload a video file.')
    return
  }

  const formData = new FormData()
  if (file) formData.append('video', file)
  formData.append('captionInput', caption)

  // Handle schedule name
  const scheduleName = document.getElementById('schedule-name-input').value
  if (!scheduleName) {
    alert('Schedule name cannot be empty!')
    return
  }

  formData.append('scheduleName', scheduleName)
  formData.append('date', new Date().toLocaleDateString('en-CA'))

  try {
    // Post the schedule along with form data
    const scheduleId = await postSchedule({ formData })

    // Add items into the schedule
    const params = new URLSearchParams(window.location.search)
    const sectionIds = params.get('sectionIds') ? params.get('sectionIds').split(',').map(Number) : []

    await addItemsIntoSchedule({ sectionIds, scheduleId })
  } catch (error) {
    console.error('Error:', error)
  }

  return scheduleName
}

// export async function submitMenu() {
//   const fileInput = document.getElementById('formFile');
//   const captionInput = document.getElementById('captionInput');
//   const file = fileInput.files[0];
//   const caption = captionInput.value;

//   if (file && !file.type.startsWith('video/')) {
//     alert('Please upload a video file.');
//     return;
//   }

//   const formData = new FormData();
//   if (file) formData.append('video', file);
//   formData.append('captionInput', caption);

//   // Handle schedule name
//   const scheduleName = document.getElementById('schedule-name-input').value;
//   if (!scheduleName) {
//     alert('Schedule name cannot be empty!');
//     return;
//   }

//   const today = new Date();
//   const currentDate = today.toLocaleDateString('en-CA');

//   try {
//     // Post the schedule along with form data
//     const scheduleId = await postSchedule({ scheduleName, date: currentDate, formData });

//     // Add items into the schedule
//     const params = new URLSearchParams(window.location.search);
//     const sectionIds = params.get('sectionIds') ? params.get('sectionIds').split(',').map(Number) : [];

//     await addItemsIntoSchedule({ sectionIds, scheduleId });
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// submit to Schedule
// export async function submitMenu () {
//   const params = new URLSearchParams(window.location.search)
//   const sectionIds = params.get('sectionIds') ? params.get('sectionIds').split(',').map(Number) : []
//   const today = new Date()
//   const currentDate = today.toLocaleDateString('en-CA')
//   console.log(currentDate)
//   const scheduleName = document.getElementById('schedule-name-input').value

//   if (!scheduleName) {
//     alert('Schedule name cannot be empty!')
//     return
//   }

//   const scheduleId = await postSchedule({ scheduleName, date: currentDate })
//   console.log(scheduleId)
//   addItemsIntoSchedule({ sectionIds, scheduleId })
//   console.log(sectionIds)
//   return scheduleName
// }
