import { checkLoginStatus } from './authScript.js'
import { renderExerciseToModuleContainer } from '../render/moduleRender.js'
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

// Enter module editing mode by clicking module
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
      window.location.href = `/sections/${sectionId}/parts`
    })
  })
}

export async function getModuleBySection (sectionId) {
  // const sectionId = window.location.pathname.split('/')[2]

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

// to the view
export async function addExerciseToModule (exerciseId, exerciseName) {
  let funcModuleId = ''
  const { moduleId, modules } = await getModuleBySection(sectionId)
  const moduleEdit = document.querySelector('.module-editing')
  if (modules.length === 0 && !moduleEdit) {
    funcModuleId = await createModule()
  } else {
    const module = modules[0]
    funcModuleId = module.id
  }

  const data = { exerciseId }

  try {
    const response = await fetch(`/api/modules/${funcModuleId}/exercises`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()
    if (result.success) {
      const exercise = result.moduleItem
      const { reps, sets, weight } = exercise

      renderExerciseToModuleContainer({
        funcModuleId,
        exerciseId,
        exerciseName,
        reps,
        sets,
        weight
      })
    } else {
      console.error('Failed to add module:', result.error)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

// add Exercise into memo
export async function addListenerAddMemoBtn () {
  const addBtn = document.querySelectorAll('.add-into-memo')

  addBtn.forEach((btn, index) => {
    if (!btn) {
      console.error(`Button at index ${index} is null or undefined.`)
      return
    }

    const exerciseId = btn.closest('.card').getAttribute('data-id')

    btn.addEventListener('click', () => {
      const cardBody = btn.closest('.card-body')
      const exerciseName = cardBody.querySelector('.card-title').innerText
      console.log('start to add exercise into module')
      addExerciseToModule(exerciseId, exerciseName)
    })
  })
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
