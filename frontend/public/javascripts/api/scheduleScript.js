import { getCookie } from './authScript.js'

const token = localStorage.getItem('token')
const csrfToken = getCookie('XSRF-TOKEN')
export async function postSchedule ({ formData }) { // scheduleName, date,

  try {
    const response = await fetch('/api/schedules', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-CSRF-Token': csrfToken
      },
      body: formData // scheduleFormData
    })

    if (!response.ok) {
      alert('Failed to upload. Please try again.')
      const progressAlert = document.getElementById('progress-saveSuccessAlert')
      progressAlert.classList.add('d-none')

      return null
    }
    const scheduleData = await response.json()
    if (scheduleData.success) {
      const scheduleId = scheduleData.schedule_id
      return scheduleId
    }
  } catch (error) {
    alert('Error uploading. Please try again.')
    return null
  }
}

// sectionIds>modules>exercises
export async function addItemsIntoSchedule ({ sectionIds, scheduleId }) {
  const token = localStorage.getItem('token')
  try {
    const data = { sectionIds, scheduleId }
    const response = await fetch('/api/scheduleItems', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
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
  return { scheduleIds, schedules }
}

export async function getSchedulesItems (scheduleId = null) {
  const token = localStorage.getItem('token')
  let scheduleIdsArray = []

  // If scheduleId is provided, use it;(when user just created a schedule need to render right away)
  // otherwise, get all scheduleIds(when page loaded need to get all schedules)
  if (scheduleId) {
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
    allExercises.push(...exercises)
  }

  return allExercises
}

export async function updateScheduleItems (updatedItems, itemsToDelete) {
  try {
    const response = await fetch('/api/scheduleItems/update', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ updatedItems, itemsToDelete })
    })

    if (!response.ok) {
      throw new Error('Failed to update schedule items')
    }

  } catch (error) {
    console.error('Error updating schedule items:', error)
  }
}

export async function addListenerDelScheduleBtn () {
  const scheduleItemModal = document.querySelector('#scheduleItemModal')

  scheduleItemModal.addEventListener('shown.bs.modal', function () {
    const deleteBtn = scheduleItemModal.querySelector('.btn-danger')
    const hiddenInput = scheduleItemModal.querySelector('input[name="scheduleId"]')
    const scheduleId = hiddenInput ? hiddenInput.value : null

    // Remove any previous listener before adding new
    if (deleteBtn._handleDelete) {
      deleteBtn.removeEventListener('click', deleteBtn._handleDelete)
    }

    // Store the event handler on the element so it can be removed later
    deleteBtn._handleDelete = async function () {
      // Show confirmation dialog
      const confirmed = window.confirm('Are you sure you want to delete this record?')
      if (confirmed) {
        await handleDeleteSchedule(scheduleId)
        // Close the modal after successful deletion
        const modalInstance = bootstrap.Modal.getInstance(scheduleItemModal)
        modalInstance.hide()
      } else {
        console.log('Deletion canceled.')
      }
    }

    deleteBtn.addEventListener('click', deleteBtn._handleDelete)
  })
}

async function handleDeleteSchedule (scheduleId) {
  const data = await deleteSchedule(scheduleId)
  return data
}

export async function deleteSchedule (scheduleId) {
  try {
    const response = await fetch(`/api/schedules/${scheduleId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      }
    })

    if (!response.ok) {
      const errorResult = await response.json()
      throw new Error(errorResult.message || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      const event = window.calendar.getEventById(scheduleId)
      if (event) {
        event.remove()
      } else {
        console.warn(`Event with Schedule ID: ${scheduleId} not found in calendar.`)
      }
    } else {
      console.error('Failed to delete schedule:', result.message)
    }
  } catch (error) {
    console.error('Error making DELETE request:', error)
  }
}
