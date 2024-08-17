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

  const { modules } = await getModuleBySection(isAuthenticated) // modules[index].section_id/module_name/member_id
  if (modules.length === 0) {
    const sectionId = parseInt(window.location.pathname.split('/')[2], 10)
    const sections = JSON.parse(localStorage.getItem('sections'))
    const section = sections[sectionId - 1]

    const moduleDiv = document.createElement('div')
    moduleDiv.classList.add('module-item')

    moduleDiv.textContent = `Select exercises for training ${section}`
    moduleDiv.dataset.sectionId = sectionId

    const hrElement = document.querySelector('hr')
    hrElement.insertAdjacentElement('afterend', moduleDiv)
    return
  }
  //! temp for one module in a section

  const module = modules[0]
  console.log(modules)
  const moduleId = module.id

  const moduleDiv = document.createElement('div')
  moduleDiv.classList.add('module-editing')
  moduleDiv.dataset.id = moduleId
  moduleDiv.innerText = 'Let\'s select exercises into memo!'

  const navElement = document.querySelector('nav')
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
