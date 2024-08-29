import { checkLoginStatus } from './authScript.js'
import { renderExerciseToModuleContainer } from '../render/moduleRender.js'
import { exerciseCardModal } from '../render/exerciseRender.js'

// create new module by clicking add new
// Btn to create new module using sectionId+memberId
const sectionId = parseInt(window.location.pathname.split('/')[2], 10)
const token = localStorage.getItem('token')

export async function createModule () {
  const data = {
    section_id: sectionId
  }

  try {
    const response = await fetch('/api/modules', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText)
    }

    const result = await response.json()

    if (result.success) {
      console.log('Module created successfully:', result)
      const moduleId = result.module.id
      return moduleId
    } else {
      console.error('Failed to add module:', result.error)
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

// Get all modules of a member by memberId+token
export async function getModules (isAuthenticated) {
  if (!isAuthenticated) {
    return
  }

  try {
    const response = await fetch('/api/modules', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch modules')
    }

    const modules = await response.json()
    return modules // array
  } catch (error) {
    console.error('Error:', error)
  }
}

// Enter module editing mode by clicking module or sectionImg
export async function addListenerModule (isAuthenticated) {
  const sectionImg = document.querySelectorAll('.col-md-3')
  const sectionModule = document.querySelectorAll('.module-item')
  let goToSectionBtn = ''
  if (!isAuthenticated) {
    goToSectionBtn = sectionImg
  } else {
    goToSectionBtn = [
      ...sectionImg,
      ...sectionModule
    ]
  }

  goToSectionBtn.forEach(module => {
    // module need to be created first then to be given the data-id(id of module)
    // const moduleId = module.getAttribute('data-id')
    let sectionId = ''
    if (module.classList.contains('col-md-3')) {
      sectionId = module.getAttribute('data-id')
    } else {
      sectionId = module.getAttribute('data-section-id')
    }
    module.addEventListener('click', function () {
      sessionStorage.setItem('lastUrl', window.location.href)
      window.location.href = `/sections/${sectionId}/parts` //! !!!!!/sections/${sectionId}/modules
    })
  })
}

export async function getModuleBySection (sectionId) {
  const response = await fetch(`/api/sections/${sectionId}/modules`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  const modules = await response.json()
  if (!modules) {
    return { modules: null, moduleId: null }
  }
  const moduleId = []
  modules.forEach(module => {
    moduleId.push(module.id)
  })
  return { modules, moduleId }
}

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

  const moduleId = modules.map(module => module.id)
  return { modules, moduleId }
}

// to the view
export async function addExerciseToModule (exerciseId, exerciseName) {
  let funcModuleId = ''
  const { moduleId, modules } = await getModuleBySection(sectionId)
  const moduleEdit = document.querySelector('.part-module-editing')
  console.log(modules)
  if (modules.length === 0 && !moduleEdit) {
    funcModuleId = await createModule()
  } else {
    const module = modules[0]
    funcModuleId = module.id
  }
  // render default value
  const reps = 12
  const sets = 4
  const weight = 5
  renderExerciseToModuleContainer({
    funcModuleId,
    exerciseId,
    exerciseName,
    reps,
    sets,
    weight
  })
}

// add Exercise into memo
export async function addListenerAddMemoBtn () {
  const addBtn = document.querySelectorAll('.add-into-memo')
  console.log(addBtn)

  addBtn.forEach((btn, index) => {
    console.log(btn)
    console.log(btn.closest('.card'))
    const exerciseId = btn.closest('.card').getAttribute('data-id')

    btn.addEventListener('click', () => {
      const cardBody = btn.closest('.card-body')
      const exerciseName = cardBody.querySelector('.card-title').innerText
      console.log('start to add exercise into module')
      addExerciseToModule(exerciseId, exerciseName)
    })
  })
}

let selectedExerciseId = null
let selectedExerciseName = null

export async function addListenerModalAddMemoBtn (data) {
  console.log(data)
  const exerciseDetailBtns = document.querySelectorAll('.exercise-detail')

  exerciseDetailBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      selectedExerciseId = btn.dataset.id

      const selectedExerciseIdInt = parseInt(btn.dataset.id, 10)

      const card = btn.closest('.card')
      selectedExerciseName = card.querySelector('.card-title').innerText

      console.log('Exercise ID:', selectedExerciseId)
      console.log('Exercise Name:', selectedExerciseName)
      const selectedExerciseData = data.find(exercise => exercise.id === selectedExerciseIdInt)
      console.log(data)
      console.log(selectedExerciseData)
      exerciseCardModal(selectedExerciseData)
    })
  })

  // Listen for when the modal is shown
  const exerciseModal = document.querySelector('#exerciseModal')
  exerciseModal.addEventListener('shown.bs.modal', function () {
    const modalAddBtn = exerciseModal.querySelector('.btn-primary')

    // Clear previous listeners to avoid multiple triggers
    modalAddBtn.removeEventListener('click', handleModalAddBtnClick)

    // Add new event listener
    modalAddBtn.addEventListener('click', handleModalAddBtnClick)
  })
}

function handleModalAddBtnClick () {
  if (selectedExerciseId && selectedExerciseName) {
    console.log('Exercise ID:', selectedExerciseId)
    console.log('Exercise Name:', selectedExerciseName)
    console.log('Start to add exercise into module')
    addExerciseToModule(selectedExerciseId, selectedExerciseName)
  } else {
    console.log('No exercise selected')
  }
}

export async function getExerciseInModule (moduleId) {
  const response = await fetch(`/api/modules/${moduleId}/exercises`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ContentType: 'application/json'
    }
  })
  const exercises = await response.json()
  return exercises
}

export async function collectModuleData () {
  const moduleContainer = document.querySelector('.part-module-editing')
  const moduleId = moduleContainer.getAttribute('data-id') // Retrieve the moduleId
  const items = moduleContainer.querySelectorAll('.menu-module-item')

  const updatedItems = []
  const updatedItemIds = []

  items.forEach(item => {
    const itemId = item.dataset.id // Existing item ID (could be undefined for new items)
    const exerciseId = item.dataset.exerciseId // Exercise ID
    const reps = item.querySelector('.reps-input').value
    const sets = item.querySelector('.sets-input').value
    const weight = item.querySelector('.weight-input').value

    if (itemId) {
      updatedItemIds.push(itemId) // Collect existing item IDs
    }

    updatedItems.push({
      itemId, // This could be undefined for new items
      exerciseId, // Always present
      reps: parseInt(reps, 10),
      sets: parseInt(sets, 10),
      weight: parseFloat(weight),
      moduleId // This is the module ID for creating new items
    })
    console.log(updatedItems)
  })

  return { moduleId, updatedItems, updatedItemIds }
}

export async function addListenerSaveModuleBtn () {
  console.log('save module')
  const saveBtn = document.querySelector('.save-menu-module')
  if (!saveBtn) return

  saveBtn.addEventListener('click', async function () {
    const { moduleId, updatedItems, updatedItemIds } = await collectModuleData() // Collect data from the module-editing section
    console
    const requestBody = {
      updatedItems,
      existingItemIds: updatedItemIds // Send the current item IDs to the backend
    }

    console.log('Saving module with data:', requestBody)

    try {
      const response = await fetch(`/api/modules/${moduleId}/exercises`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()
      if (result.success) {
        console.log('Exercises updated successfully')
        const lastUrl = sessionStorage.getItem('lastUrl')

        const saveSuccessAlert = document.getElementById('saveSuccessAlert')
        saveSuccessAlert.classList.remove('d-none')

        // Redirect after a short delay
        setTimeout(() => {
          if (lastUrl) {
            sessionStorage.removeItem('lastUrl')
            window.location.href = lastUrl
          } else {
            window.location.href = '/' // Fallback if no last URL is stored
          }
        }, 500) // 2-second delay
      } else {
        console.error('Failed to update exercises:', result.message)
      }
    } catch (error) {
      console.error('Error updating exercises:', error)
    }
  })
}

export function addListenerDeleteModuleItem (listGroup) {
  const deleteButtons = listGroup.querySelectorAll('.delete-menu-item')

  deleteButtons.forEach(button => {
    button.addEventListener('click', function () {
      const listItem = button.closest('li')
      listItem.remove()
    })
  })
}
