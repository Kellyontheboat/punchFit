export function planFormSubmission() {
  const formData = formdata submit in the create a plan modal
  
  const sectionIds = retrieve from the section user selected return an array
  return sectionIds
}

export async function getModuleBySectionId(sectionIds) {
  sectionIds.forEach(id => {
    const sectionId = id
    const token = localStorage.getItem('token')
    const memberId = user.id

    const response = await fetch(`/api/sections/${sectionId}/modules?memberId=${memberId}`, {
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
  })

}

export async function renderItemsInSchedule(itemContainers) {
  for (const container of itemContainers) {
    const moduleId = container.dataset.id
    if (!moduleId) continue

    const items = await getExerciseInModule(moduleId)

    // Clear the container before rendering items
    if (items.length !== 0) {
      container.innerText = ''
    }

    items.forEach(item => {
      const itemDiv = document.createElement('div')
      const detailDiv = document.createElement('div')

      const exerciseName = item.exercise.name
      const exerciseId = item.exercise_id
      const { reps, sets, weight } = item

      itemDiv.classList.add('exercise-item')
      itemDiv.dataset.id = exerciseId

      detailDiv.classList.add('exercise-item-detail')
      detailDiv.innerText = `*${exerciseName} ${reps} reps ${sets} sets ${weight} kg`

      container.appendChild(itemDiv)
      itemDiv.appendChild(detailDiv)
    })
  }
}




