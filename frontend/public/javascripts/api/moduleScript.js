import { checkLoginStatus } from './authScript.js'

// create new module by clicking add new
// Btn to create new module using sectionId+memberId
const sectionId = parseInt(window.location.pathname.split('/')[2], 10)
const token = localStorage.getItem('token')

export async function createModule () {
  const token = localStorage.getItem('token')

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

  const token = localStorage.getItem('token')

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

// export async function addListenerSectionImg () {
//   document.querySelectorAll('.section-card-item').forEach(card => {
//     const
//   })
// }

// Enter module editing mode by clicking module
export async function addListenerModule (isAuthenticated) {
  const sectionImg = document.querySelectorAll('.col-md-3')
  const sectionModule = document.querySelectorAll('.module-item')
  let goToSectionBtn = ''
  if (!isAuthenticated) {
    goToSectionBtn = sectionImg
    console.log(goToSectionBtn)
  } else {
    goToSectionBtn = [
      ...sectionImg,
      ...sectionModule
    ]
  }

  goToSectionBtn.forEach(module => {
    console.log(module)
    // module need to be created first then to be given the data-id(id of module)
    // const moduleId = module.getAttribute('data-id')
    let sectionId = ''
    if (module.classList.contains('col-md-3')) {
      sectionId = module.getAttribute('data-id')
    } else {
      sectionId = module.getAttribute('data-section-id')
    }
    // const sectionId = module.getAttribute('data-section-id')
    // const sectionName = module.getAttribute('data-section-name')
    module.addEventListener('click', function () {
      window.location.href = `/sections/${sectionId}/parts`
      // console.log('addListenerModule', moduleId)
      // return { moduleId, sectionName }
    })
  })
}

//   if (!isAuthenticated) return
//   document.querySelectorAll('.module-item').forEach(module => {
//     // module need to be created first then to be given the data-id(id of module)
//     const moduleId = module.getAttribute('data-id')
//     const sectionId = module.getAttribute('data-section-id')
//     const sectionName = module.getAttribute('data-section-name')
//     module.addEventListener('click', function () {
//       window.location.href = `/sections/${sectionId}/parts`
//       console.log('addListenerModule', moduleId)
//       return { moduleId, sectionName }
//     })
//   })
// }

export async function getModuleBySection () {
  const token = localStorage.getItem('token')
  const sectionId = window.location.pathname.split('/')[2]

  const response = await fetch(`/api/sections/${sectionId}/modules`, {
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

export async function addExerciseToModule (exerciseId, exerciseName) {
  let funcModuleId = ''
  const { moduleId, modules } = await getModuleBySection()
  console.log(modules)

  // if there is not yet a module
  if (modules.length === 0) {
    funcModuleId = await createModule()
    console.log(funcModuleId)
  } else {
    console.log(modules)
    // temp for one module for each section
    // userId+sectionId to get the modules
    const module = modules[0]
    funcModuleId = module.id
    console.log(funcModuleId)
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
      console.log('Exercise added into module successfully')
      const exercise = result.moduleItem
      const { reps, sets, weight } = exercise
      const name = exerciseName

      console.log(exercise)
      //! move to renderjs
      // Find the module container in the DOM
      let moduleContainer = document.querySelector(`[data-id="${funcModuleId}"]`)
      if (!moduleContainer) {
        const existingElement = document.querySelector(`.module-item[data-section-id="${sectionId}"]`)

        // Create the new moduleContainer
        moduleContainer = document.createElement('div')
        moduleContainer.classList.add('module-editing')
        moduleContainer.dataset.id = funcModuleId

        // Replace the existing element with the new moduleContainer
        existingElement.replaceWith(moduleContainer)
      }
      console.log(moduleContainer)
      // Create new DOM elements for the exercise item
      const itemDiv = document.createElement('div')
      const detailDiv = document.createElement('div')

      itemDiv.classList.add('exercise-item')
      itemDiv.dataset.id = exerciseId

      detailDiv.classList.add('exercise-item-detail')
      detailDiv.innerText = `*${name} ${reps} reps ${sets} sets ${weight} kg`

      // Append the new exercise item to the module container
      moduleContainer.appendChild(itemDiv)
      itemDiv.appendChild(detailDiv)
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
  const token = localStorage.getItem('token')
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
