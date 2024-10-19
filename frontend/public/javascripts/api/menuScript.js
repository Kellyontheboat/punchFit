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
    return
  }

  SubmitMenuBtn.addEventListener('click', async function (event) {
    
    event.preventDefault() // Prevent the default form submission behavior
    if ( (document.getElementById('schedule-name-input').value === '' || document.getElementById('formFile').value === '')){
      alert('Schedule name and file cannot be empty!')
      return
    }

    const fileInput = document.getElementById('formFile')
    const file = fileInput.files[0]
    if (!file || !file.type.startsWith('video/')) {
      alert('Please upload a video file.')
      return
    }

    const MAX_FILE_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      alert('File is too large. Maximum allowed size is 50MB.')
      return
    }

    const maxScheduleNameLength = 10;
    const maxCaptionLength = 500;
    if ((document.getElementById('schedule-name-input').value.length > maxScheduleNameLength) || (document.getElementById('captionInput').value.length > maxCaptionLength)) {
      alert('Schedule name cannot exceed 10 and caption cannot exceed 500 characters!')
      return
    }

    SubmitMenuBtn.disabled = true;
    SubmitMenuBtn.textContent = 'Uploading...';
    const progressAlert = document.getElementById('progress-saveSuccessAlert')
    progressAlert.classList.remove('d-none')

    try {
    const scheduleName = await submitMenu()
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
        window.location.href = '/posts'
      }
    }, 1500)
    } catch (error) {
      progressAlert.classList.add('d-none')
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
    if (!scheduleId) {
      throw new Error('Failed to create schedule')
    }
    // Add items into the schedule
    const params = new URLSearchParams(window.location.search)
    const sectionIds = params.get('sectionIds') ? params.get('sectionIds').split(',').map(Number) : []

    // Client-side validation: Ensure sectionIds are numbers between 1 and 7
    const isValidSectionIds = sectionIds.every(id => Number.isInteger(id) && id >= 1 && id <= 7);

    if (!isValidSectionIds) {
      alert('Invalid section IDs. Please ensure they are numbers between 1 and 7.');
    } else {
      await addItemsIntoSchedule({ sectionIds, scheduleId });
    }
  } catch (error) {
    return null
  }

  return scheduleName
}
