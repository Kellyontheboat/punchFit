import { checkLoginStatus } from './authScript.js'
import { showLoginModal } from '../render/render.js'
export async function addListenerModuleBtn (user, isAuthenticated) {
  console.log('addListenerModuleBtn', isAuthenticated)
  document.querySelectorAll('.add-module-btn').forEach(button => {
    console.log(button)
    button.addEventListener('click', function () {
      if (!isAuthenticated) {
        showLoginModal()
        return
      }
      const sectionId = this.getAttribute('data-id')
      console.log(sectionId)
      const userId = user.id

      const data = {
        section_id: sectionId,
        member_id: userId
      }
      console.log('addListenerModuleBtn', data)

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
            console.log('Module added successfully')
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

export async function getModules (user, isAuthenticated) {
  if (!isAuthenticated) {
    return
  }

  const memberId = user.id
  console.log('getModules', memberId)
  console.log(typeof memberId)
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
    console.log('Modules:', modules)
    // Process and display the modules as needed
  } catch (error) {
    console.error('Error:', error)
  }
}
// api to get the module of a member by member_id(module_id section_id)
// iterate each section to map the section_id of each module

//! move to render later
// function renderModules() {

// }

//! return moduleId
// function addListenerModule(){
//   document.querySelectorAll('.module-item').forEach(module => {
//     const moduleId = this.getAttribute('data-id')
//     console.log(moduleId)
//   })
// }

export function addListenerExerciseBtn (user, isAuthenticated) {
  document.querySelectorAll('.exercise-item').forEach(button => {
    console.log(button)
    button.addEventListener('click', function () {
      if (!isAuthenticated) {
        showLoginModal()
        return
      }

      addExerciseToModule()
    })
  })
}
export async function addExerciseToModule (user, isAuthenticated, moduleId) {
  document.querySelectorAll('.exercise-item').forEach(button => {
    console.log(button)
    button.addEventListener('click', function () {
      if (!isAuthenticated) {
        showLoginModal()
        return
      }

      const exerciseId = this.getAttribute('data-id')
      console.log(exerciseId)
      const userId = user.id

      const data = {
        section_id: sectionId,
        member_id: userId
      }

      console.log('addExerciseToModule', data)
      //! get moduleId from addListenerModuleBtn
      method: 'POST',
      fetch('/api/modules/:moduleId/exercises', {
        method: 'POST',
        headers: {
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
    })
  })
}
