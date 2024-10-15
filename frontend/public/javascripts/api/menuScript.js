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
    const progressAlert = document.getElementById('progress-saveSuccessAlert')
    progressAlert.classList.remove('d-none')
    console.log('start to submit menu')
    event.preventDefault() // Prevent the default form submission behavior

    SubmitMenuBtn.disabled = true;
    SubmitMenuBtn.textContent = 'Uploading...';

    try {
    const scheduleName = await submitMenu()
    if (!scheduleName) return

    const lastUrl = sessionStorage.getItem('lastUrl')
    const saveSuccessAlert = document.getElementById('saveSuccessAlert')
    progressAlert.classList.add('d-none')
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
    } catch (error) {
      console.error('Error during submission:', error);
    } finally {
      // Re-enable the submit button after the process is complete
      SubmitMenuBtn.disabled = false;
      SubmitMenuBtn.textContent = 'Submit Post'; // Reset button text
    }
  });
}

// Handle file input and caption
export async function submitMenu () {
  const fileInput = document.getElementById('formFile')
  const captionInput = document.getElementById('captionInput')
  const file = fileInput.files[0]
  const caption = captionInput.value

  // Handle schedule name
  const scheduleName = document.getElementById('schedule-name-input').value
  if (!scheduleName || !file) {
    alert('Schedule name and file cannot be empty!')
    return
  }

  if (!file || !file.type.startsWith('video/')) {
    alert('Please upload a video file.')
    return null
  }

  const MAX_FILE_SIZE = 50 * 1024 * 1024
  if (file.size > MAX_FILE_SIZE) {
    alert('File is too large. Maximum allowed size is 50MB.')
    return
  }

  const formData = new FormData()
  if (file) formData.append('video', file)
  if (caption) {
    formData.append('captionInput', caption)
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
    return null
  }

  return scheduleName
}
