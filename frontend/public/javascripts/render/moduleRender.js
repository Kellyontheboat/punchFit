import { getModules, getModuleBySection, getExerciseInModule } from '../api/moduleScript.js'

export async function renderModules (user, isAuthenticated) {
  if (!user) {
    return
  }

  try {
    const modules = await getModules(isAuthenticated)
    if (!modules) {
      console.error('Modules is undefined:', modules)
      return
    }

    // render each module in modules which has already been created
    // only the created modules have id
    console.log(modules)
    modules.forEach(module => {
      const sectionId = module.section_id
      const moduleId = module.id
      // specify the moduleWrap of the module by sectionId in this loop
      const moduleWrap = document.querySelector(`.section-item[data-id="${sectionId}"]`)
        .closest('.section-container')
        .querySelector('.module-wrap')
      console.log(moduleWrap)
      if (moduleWrap) {
        const moduleSpace = moduleWrap.querySelector('.module-item')
        if (moduleSpace) {
          const dataId = moduleSpace.dataset.id
          // render module is created
          moduleSpace.style.backgroundColor = '#f7d352'
          moduleSpace.style.color = '#bf3b3b'
          moduleSpace.dataset.id = moduleId
          moduleSpace.dataset.sectionId = sectionId
          const closestSection = document.querySelector(`.section-item[data-id="${sectionId}"]`).textContent
          moduleSpace.innerText = `${closestSection} Template has been created!
          Click to edit/create exercises inside.`
          moduleSpace.dataset.sectionName = closestSection
        }
      } else {
        console.warn(`No module-wrap found for sectionId ${sectionId}`)
      }
    })
  } catch (error) {
    console.error('Error in renderModules:', error)
  }
}

export async function renderEditModule (isAuthenticated) {
  if (!isAuthenticated) return
  const sectionId = parseInt(window.location.pathname.split('/')[2], 10)
  const { modules } = await getModuleBySection(sectionId) // modules[index].section_id/module_name/member_id
  console.log(modules)
  const sections = JSON.parse(localStorage.getItem('sections'))
  const section = sections[sectionId - 1]
  const moduleDiv = document.createElement('div')

  if (modules.length === 0) {
    moduleDiv.classList.add('module-item')

    moduleDiv.textContent = `Let\'s select exercises into ${section} module!`
    moduleDiv.dataset.sectionId = sectionId

    const hrElement = document.querySelector('hr')
    hrElement.insertAdjacentElement('afterend', moduleDiv)
    return
  }

  const module = modules[0]
  console.log(modules)
  const moduleId = module.id

  moduleDiv.classList.add('module-editing')
  moduleDiv.dataset.id = moduleId

  const navElement = document.querySelector('hr')
  navElement.insertAdjacentElement('afterend', moduleDiv)
}

export async function renderItemsInModule (itemContainers) {
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

export function renderExerciseToModuleContainer ({ funcModuleId, exerciseId, exerciseName, reps, sets, weight }) {
  let moduleContainer = document.querySelector(`[data-id="${funcModuleId}"]`)
  if (!moduleContainer) {
    const existingElement = document.querySelector('.module-item')

    moduleContainer = document.createElement('div')
    moduleContainer.classList.add('module-editing')
    moduleContainer.offsetHeight// Force reflow (read a property to trigger reflow)
    moduleContainer.dataset.id = funcModuleId
    console.log(existingElement)
    existingElement.replaceWith(moduleContainer)
  }

  const itemDiv = document.createElement('div')
  const detailDiv = document.createElement('div')

  itemDiv.classList.add('exercise-item')
  itemDiv.dataset.id = exerciseId

  detailDiv.classList.add('exercise-item-detail')
  detailDiv.innerText = `*${exerciseName} ${reps} reps ${sets} sets ${weight} kg`

  moduleContainer.appendChild(itemDiv)
  itemDiv.appendChild(detailDiv)
}
