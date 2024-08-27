import { getModuleBySection, getExerciseInModule } from '../api/moduleScript.js'

export async function renderModulesBySections () {
  const params = new URLSearchParams(window.location.search)
  const sectionIds = params.get('sectionIds') ? params.get('sectionIds').split(',') : []
  const menuModules = []
  for (const sectionId of sectionIds) {
    const { modules, moduleId } = await getModuleBySection(sectionId)
    if (modules.length === 0) {
      menuModules.push('')
      continue
    }
    menuModules.push(modules[0])
  }
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

    // Tie the module.id to moduleDiv if a module exists under this sectionId
    const module = modules[index]
    if (module && module !== '') {
      const moduleId = module.id
      moduleDiv.dataset.id = moduleId
    }
    moduleWrap.appendChild(moduleTitle)
    moduleWrap.appendChild(moduleDiv)
    moduleContainer.appendChild(moduleWrap)
  })
}

export async function renderItemsInMenuModule (itemContainers) {
  for (const container of itemContainers) {
    console.log(container)

    const moduleId = container.dataset.id
    // if (!moduleId) continue

    const listGroup = document.createElement('ul')
    listGroup.classList.add('list-group')
    container.appendChild(listGroup)

    const editBtn = document.createElement('button')
    editBtn.classList.add('btn', 'btn-primary', 'edit-menu-module')
    editBtn.innerText = 'Edit'

    const items = await getExerciseInModule(moduleId)

    // Clear the container before rendering items
    if (items.length !== 0) {
      // container.innerText = ''

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
        console.log(listItem)
        listGroup.appendChild(listItem)
        listItem.appendChild(detailDiv)
        listGroup.appendChild(editBtn)
      })
    }
    listGroup.appendChild(editBtn)
  }
}

export async function renderSubmitMenuBtn () {
  const menuContainer = document.querySelector('.menu-module-container')
  const SubmitMenuBtn = document.createElement('button')

  SubmitMenuBtn.innerText = 'Save into Schedule'
  SubmitMenuBtn.classList.add('btn', 'btn-primary') // Example Bootstrap classes
  SubmitMenuBtn.id = 'submit-menu'
  menuContainer.appendChild(SubmitMenuBtn)
  return SubmitMenuBtn
}
