import { getModuleBySection, getModulesBySections, getExerciseInModule } from '../api/moduleScript.js'

export async function renderModulesBySections () {
  const params = new URLSearchParams(window.location.search)
  const sectionIds = params.get('sectionIds') ? params.get('sectionIds').split(',') : []

  const { modules } = await getModulesBySections(sectionIds)
  const menuModules = modules
  console.log(menuModules)
  renderMenuModules(menuModules, sectionIds)
}

export async function renderMenuModules (modules, sectionIds) {
  const sectionKey = JSON.parse(localStorage.getItem('sections'))
  const moduleContainer = document.querySelector('.menu-module-container')

  sectionIds.forEach((sectionId, index) => {
    const sectionName = sectionKey[sectionId - 1]

    // Create elements for module wrap and module content
    const moduleWrap = document.createElement('div')
    moduleWrap.classList.add('module-wrap')

    const moduleDiv = document.createElement('div')
    moduleDiv.classList.add('module-editing', 'list-group')
    moduleDiv.dataset.sectionId = sectionId

    const moduleTitle = document.createElement('div')
    moduleTitle.classList.add('menu-section-item')
    moduleTitle.dataset.sectionId = sectionId
    moduleTitle.innerText = `${sectionName}`

    const editBtn = document.createElement('button')
    editBtn.classList.add('btn', 'btn-primary', 'edit-menu-module')
    editBtn.innerText = 'Edit'

    console.log(modules)
    // // Tie the module.id to moduleDiv if a module exists under this sectionId
    console.log(sectionId)
    const sectionIdNumber = Number(sectionId)
    console.log(modules)
    // Find the module with the matching section_id
    const module = modules.find(module => module.section_id === sectionIdNumber)

    if (module) {
      const moduleId = module.id
      moduleDiv.dataset.id = moduleId
      // remove the module from the array
      const moduleIndex = modules.indexOf(module)
      if (moduleIndex !== -1) {
        modules.splice(moduleIndex, 1)
      }
    }

    moduleWrap.appendChild(moduleTitle)
    moduleTitle.appendChild(editBtn)
    moduleWrap.appendChild(moduleDiv)
    moduleContainer.appendChild(moduleWrap)
  })
}

export async function renderItemsInMenuModule (itemContainers) {
  for (const container of itemContainers) {
    const moduleId = container.dataset.id
    // if (!moduleId) continue

    const listGroup = document.createElement('ul')
    listGroup.classList.add('list-group')
    container.appendChild(listGroup)

    const items = await getExerciseInModule(moduleId)
    // Clear the container before rendering items
    if (items.length !== 0) {
      items.forEach(item => {
        const listItem = document.createElement('li')
        const exerciseName = item.exercise.name
        const exerciseId = item.exercise_id
        const { reps, sets, weight } = item

        listItem.classList.add('list-group-item', 'menu-module-item')

        const detailDiv = document.createElement('div')
        detailDiv.classList.add('exercise-details')

        listItem.dataset.id = exerciseId
        listItem.innerText = `*  ${exerciseName}`
        detailDiv.innerText = `${reps} reps / ${sets} sets / ${weight} kg`
        listGroup.appendChild(listItem)
        listItem.appendChild(detailDiv)
      })
    }
  }
}

export async function renderSubmitMenuBtn () {
  const menuContainer = document.querySelector('.menu-wrapper')
  const SubmitMenuBtn = document.createElement('button')

  SubmitMenuBtn.innerText = 'Submit Post'
  SubmitMenuBtn.classList.add('btn', 'btn-primary')
  SubmitMenuBtn.id = 'submit-menu'
  SubmitMenuBtn.type = 'button'
  menuContainer.appendChild(SubmitMenuBtn)
  return SubmitMenuBtn
}
