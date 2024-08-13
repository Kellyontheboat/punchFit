import { checkLoginStatus } from './authScript.js'
import { showLoginModal, renderPartsBySection, renderEditModule } from '../render/render.js'

// create new module by clicking add new
// Btn to create new module using sectionId+memberId
export async function addListenerModuleBtn (user) {
  document.querySelectorAll('.add-module-btn').forEach(button => {
    console.log(button)
    button.addEventListener('click', function () {
      const sectionId = this.getAttribute('data-id')
      if (!user) {
        showLoginModal()
        return
      }
      const data = {
        section_id: sectionId,
        member_id: userId
      }

      fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            console.log('Module created successfully')
          } else {
            console.error('Failed to add module:', result.error)
          }
        })
        .catch(error => {
          console.error('Error:', error)
        })
    })
  })
}

// Get all modules of a member by memberId+token
export async function getModules (user, isAuthenticated) {
  if (!isAuthenticated) {
    return
  }

  const memberId = user.id
  const token = localStorage.getItem('token')

  try {
    const response = await fetch(`/api/members/${memberId}/modules`, {
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
export async function addListenerModule () {
  document.querySelectorAll('.module-item').forEach(module => {
    // module need to be created first to be given the data-id(id of module)
    const moduleId = module.getAttribute('data-id')
    const sectionId = module.getAttribute('data-section-id')
    const sectionName = module.getAttribute('data-section-name')
    console.log(moduleId)
    module.addEventListener('click', function () {
      window.location.href = `/sections/${sectionId}/parts`
      console.log('addListenerModule', moduleId)
      return { moduleId, sectionName }
    })
  })
}

export async function getModuleBySection (user) {
  if (!user) {
    return
  }
  const token = localStorage.getItem('token')
  const sectionId = window.location.pathname.split('/')[2]
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
}

export async function addExerciseToModule (user, exerciseId) {
  const modules = await getModuleBySection(user)
  console.log(modules)

  const token = localStorage.getItem('token')
  // temp for one module for each section
  // userId+sectionId to get the modules
  const module = modules.modules[0]
  console.log(module)
  const moduleId = module.id
  const data = { exerciseId }

  fetch(`/api/modules/${moduleId}/exercises`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        console.log('Module added successfully')
      } else {
        console.error('Failed to add module:', result.error)
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

// add Exercise into memo
export async function addListenerAddMemoBtn (user, isAuthenticated) {
  const addBtn = document.querySelectorAll('.add-into-memo')
  addBtn.forEach(btn => {
    const exerciseId = btn.closest('.card').getAttribute('data-id')
    btn.addEventListener('click', () => {
      if (!isAuthenticated) {
        showLoginModal()
        return
      }
      addExerciseToModule(user, exerciseId)
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
