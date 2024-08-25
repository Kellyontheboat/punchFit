const token = localStorage.getItem('token')

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
        console.log('Delete button clicked:', scheduleId)
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
  console.log('start to delete')
  const data = await deleteSchedule(scheduleId)
  console.log(data)
}

export async function deleteSchedule (scheduleId) {
  try {
    const response = await fetch(`/api/schedules/${scheduleId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorResult = await response.json()
      throw new Error(errorResult.message || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log(result)

    if (result.success) {
      const event = window.calendar.getEventById(scheduleId)
      if (event) {
        event.remove()
        console.log(`Event with Schedule ID: ${scheduleId} deleted successfully.`)
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
